/**
 * Error Handler - Centralized Error Response Handler
 *
 * Global error handler that transforms all errors into RFC 9457 Problem Details.
 *
 * IMPORTANT: This handler must be set ONLY on the root app in create-app.ts.
 * Route-level onError has priority over parent onError in Hono.
 * Do NOT set onError handlers on child routers/modules.
 *
 * @see https://hono.dev/docs/api/hono#error-handling
 * @see https://hono.dev/docs/api/exception
 * @module lib/error-handler
 */

import type { Context } from "hono";
import type { ContentfulStatusCode } from "hono/utils/http-status";

import { toProblemDetails } from "./problem";
import { fail } from "./response";

// =================================================================
// ERROR HANDLER
// =================================================================

/**
 * Centralized Error Handler
 *
 * Handles all uncaught errors and transforms them into RFC 9457 Problem Details
 * envelope responses.
 *
 * Also performs structured logging based on error severity.
 *
 * @example
 * // In create-app.ts (root app only)
 * app.onError(errorHandler);
 */
export function errorHandler(err: unknown, c: Context) {
  return handleStandardError(err, c);
}

/**
 * Handles standard API errors with envelope format
 */
function handleStandardError(err: unknown, c: Context) {
  const { problem, httpStatus, logLevel, errorType } = toProblemDetails(c, err);

  // Structured logging
  // Logger API: logger.level(message, context)
  const logger = c.get("logger");
  const requestId = c.get("requestId");
  const message = err instanceof Error ? err.message : "Error";

  const logContext = {
    requestId,
    response: { statusCode: httpStatus },
    error: {
      code: problem.code,
      name: errorType,
      message: problem.detail,
    },
    request: {
      path: c.req.path,
      method: c.req.method,
    },
  };

  // Log based on severity level from registry
  if (logger) {
    const logFn = logger[logLevel];
    if (typeof logFn === "function") {
      logFn(message, logContext);
    }
  }
  else {
    // Fallback to console if logger not available
    console.error(message, logContext, err);
  }

  return fail(c, problem, httpStatus as ContentfulStatusCode);
}
