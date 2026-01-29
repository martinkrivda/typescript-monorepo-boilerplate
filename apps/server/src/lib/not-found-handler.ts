/**
 * Not Found Handler - 404 Response Handler
 *
 * Centralized 404 handler that returns RFC 9457 Problem Details
 * in the standard envelope format.
 *
 * IMPORTANT: This handler must be set ONLY on the root app in create-app.ts.
 * Hono's app.notFound() is called only from the top-level app.
 * Do NOT set notFound handlers on child routers/modules.
 *
 * @see https://hono.dev/docs/api/hono#not-found
 * @module lib/not-found-handler
 */

import { ProblemRegistry, problemTypeUri } from "@/errors";

import { fail } from "./response";

/**
 * Not Found Handler
 *
 * Returns 404 response with RFC 9457 Problem Details envelope.
 * Logs the 404 event for monitoring.
 *
 * @example
 * // In create-app.ts (root app only)
 * app.notFound(notFoundHandler);
 */
export function notFoundHandler(c) {
  const def = ProblemRegistry.not_found;

  const problem = {
    type: problemTypeUri("not_found"),
    title: def.title,
    status: def.status,
    detail: `Route '${c.req.method} ${c.req.path}' was not found`,
    instance: c.req.path,
    code: def.code,
    errors: [],
  };

  // Structured logging for 404
  // Logger API: logger.info(message, context)
  const logger = c.get("logger");
  if (logger?.info) {
    logger.info("Route not found", {
      requestId: c.get("requestId"),
      response: { statusCode: 404 },
      error: {
        code: def.code,
        name: def.errorType,
      },
      request: {
        path: c.req.path,
        method: c.req.method,
      },
    });
  }

  return fail(c, problem, 404);
}
