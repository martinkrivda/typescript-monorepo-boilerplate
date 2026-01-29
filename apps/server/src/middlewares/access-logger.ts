import { tryGetContext } from "hono/context-storage";
import { logger } from "hono/logger";

import type { AppBindings } from "@/types";

import { env } from "@/config";
import { accessLogger } from "@/lib/logging";
import { extractClientIp, sanitizeLogString, sanitizePath, stripAnsi } from "@/utils/sanitize";

/**
 * Parse hono/logger output message
 *
 * Handles both formats:
 * - Incoming: "<-- GET /api/health"
 * - Outgoing: "--> GET /api/health 200 15ms" or "--> GET /api/health 200 1.2s"
 *
 * Also handles ANSI color codes that may be present in development
 */
/**
 * Parse hono/logger message into structured format
 *
 * @param message - Raw message from hono/logger (may contain ANSI codes)
 * @returns Parsed message with direction, method, path, status, duration
 */
function parseLogMessage(message: string) {
  // Strip ANSI codes first
  const clean = stripAnsi(message).trim();

  // Incoming request: "<-- GET /api/health"
  // Using [ ]+ instead of \s+ to prevent backtracking issues
  const incomingMatch = clean.match(/^<-- +(\w+) +(\S.*)$/);
  if (incomingMatch) {
    return {
      direction: "incoming",
      method: incomingMatch[1],
      path: sanitizePath(incomingMatch[2]),
    };
  }

  // Outgoing response: "--> GET /api/health 200 15ms" or "--> GET /api/health 200 1.2s"
  // Regex handles: ms, s, and decimal values
  // Using [ ]+ instead of \s+ and \S+ for path to prevent backtracking
  const outgoingMatch = clean.match(/^--> +(\w+) +(\S+) +(\d+) +(\d+(?:\.\d+)?)(ms|s)$/);
  if (outgoingMatch) {
    const durationValue = Number.parseFloat(outgoingMatch[4]);
    const durationUnit = outgoingMatch[5];
    // Convert to milliseconds
    const durationMs = durationUnit === "s" ? durationValue * 1000 : durationValue;

    return {
      direction: "outgoing",
      method: outgoingMatch[1],
      path: sanitizePath(outgoingMatch[2]),
      status: Number.parseInt(outgoingMatch[3], 10),
      durationMs: Math.round(durationMs),
    };
  }

  // Fallback for unparseable messages
  return { direction: "incoming" };
}

/**
 * Create custom PrintFunc for hono/logger
 *
 * Uses Hono's tryGetContext() to access request context (requestId, etc.)
 * without throwing exceptions when not in async context.
 *
 * Features:
 * - Console output in development (with colors)
 * - Structured JSON to accessLogger (Pino + rotating file)
 * - RequestId correlation from contextStorage
 * - Sensitive data sanitization (OWASP compliant)
 * - Log injection protection (CR/LF sanitization)
 */
function createPrintFunc() {
  return (message: string, ...rest: string[]) => {
    const fullMessage = [message, ...rest].join(" ");

    // Console output (development only)
    if (env.NODE_ENV === "development") {
      // Keep colors in console output for development DX

      console.log(fullMessage);
    }

    // File output via Pino accessLogger
    if (accessLogger && env.ENABLE_ACCESS_LOG) {
      const parsed = parseLogMessage(fullMessage);

      // Only log completed requests (outgoing responses)
      if (parsed.direction === "outgoing") {
        // Try to get context from contextStorage (non-throwing)
        let requestId: string | undefined;
        let clientIp = "unknown";
        let userAgent: string | undefined;

        const c = tryGetContext<AppBindings>();
        if (c) {
          requestId = c.get("requestId");
          clientIp = extractClientIp(
            c.req.header("X-Forwarded-For"),
            c.req.header("X-Real-IP"),
          );
          const ua = c.req.header("User-Agent");
          userAgent = ua ? sanitizeLogString(ua) : undefined;
        }

        accessLogger.info({
          requestId,
          method: parsed.method,
          path: parsed.path,
          status: parsed.status,
          durationMs: parsed.durationMs,
          ip: clientIp,
          userAgent,
        });
      }
    }
  };
}

/**
 * Access logger middleware using hono/logger with custom PrintFunc
 *
 * Features:
 * - Morgan-style format on console (development)
 * - Structured JSON to rotating log files (production)
 * - RequestId correlation via contextStorage
 * - Sensitive data sanitization (OWASP compliant)
 * - Log injection protection
 * - Single source of truth for access logs
 *
 * Prerequisites:
 * - contextStorage() middleware must be registered BEFORE this middleware
 * - requestId() middleware should be registered BEFORE contextStorage
 *
 * SECURITY NOTE on X-Request-Id:
 * We accept client-provided X-Request-Id for correlation purposes.
 * This is a non-security-sensitive value for logging/debugging only.
 * Never use requestId for authentication, authorization, or rate limiting.
 *
 * @example
 * ```typescript
 * import { contextStorage } from "hono/context-storage";
 * import { requestId } from "hono/request-id";
 * import { accessLoggerMiddleware } from "@/middlewares/access-logger";
 *
 * app.use(requestId());
 * app.use(contextStorage());
 * app.use(accessLoggerMiddleware());
 * ```
 */
export function accessLoggerMiddleware() {
  return logger(createPrintFunc());
}

export default accessLoggerMiddleware;
