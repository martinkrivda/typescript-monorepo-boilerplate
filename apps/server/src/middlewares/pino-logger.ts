import type { Context } from "hono";

import type { LogContext } from "@/lib/logging";

import { logger } from "@/lib/logging";
import { extractClientIp, sanitizeLogString } from "@/utils/sanitize";

/**
 * Enhanced context with structured logging capabilities
 */
declare module "hono" {
  interface ContextVariableMap {
    logger: typeof logger;
    logContext: LogContext;
  }
}

/**
 * Structured logger middleware - sets up business logging context
 *
 * This middleware ONLY:
 * - Initializes LogContext with request information (sanitized)
 * - Sets logger and logContext in Hono context for handlers
 * - Includes requestId for correlation with access logs
 *
 * SECURITY NOTES:
 * - Only path is logged, NOT full URL (query params may contain tokens)
 * - User-Agent is sanitized against log injection
 * - IP is extracted safely (first from XFF chain)
 *
 * Access logging is handled separately by accessLoggerMiddleware()
 *
 * @example
 * ```typescript
 * // In route handler:
 * const logger = c.get("logger");
 * const logContext = c.get("logContext");
 *
 * logger.info("Request received", {
 *   ...logContext,
 *   requestId: logContext.requestId,
 * });
 * ```
 */
export function structuredLogger() {
  return async (c: Context, next: () => Promise<void>) => {
    // Get requestId from context (set by requestId middleware)
    const requestId = c.get("requestId") as string | undefined;

    // Get client IP safely - first IP from X-Forwarded-For chain
    // Note: This limits proxy chain info but does NOT prevent spoofing
    // For anti-spoofing, configure reverse proxy to set X-Real-IP
    const clientIp = extractClientIp(
      c.req.header("X-Forwarded-For"),
      c.req.header("X-Real-IP"),
    );

    // Initialize log context with request information
    // SECURITY: Only path, NOT url (query params may contain sensitive data)
    const logContext: LogContext = {
      requestId,
      request: {
        method: c.req.method,
        path: c.req.path, // Only path, no query string
        userAgent: sanitizeLogString(c.req.header("User-Agent")),
        ip: clientIp,
      },
    };

    // Set logger and context in Hono context
    c.set("logger", logger);
    c.set("logContext", logContext);

    const start = Date.now();

    await next();

    // Update context with response info for error handlers
    const responseTime = Date.now() - start;
    const contentLengthHeader = c.res.headers.get("Content-Length");

    const updatedContext: LogContext = {
      ...logContext,
      response: {
        statusCode: c.res.status,
        responseTime,
        contentLength: contentLengthHeader
          ? Number.parseInt(contentLengthHeader, 10)
          : undefined,
      },
    };

    c.set("logContext", updatedContext);

    // Access logging is handled by accessLoggerMiddleware()
    // DO NOT add access logging here to avoid duplication
  };
}

// Note: pinoLogger() has been removed. Use accessLoggerMiddleware() instead.
