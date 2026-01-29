/**
 * Application Factory - Creates Hono app with middleware stack
 *
 * This module is responsible for:
 * - Creating the main Hono app with all middleware
 * - Creating routers for modules with proper validation hook
 * - Setting up centralized error handling (RFC 9457)
 *
 * IMPORTANT: Error handling is centralized here on the root app.
 * Do NOT add notFound or onError handlers on child routers/modules.
 *
 * @module lib/create-app
 */

import type { Schema } from "hono";

import { OpenAPIHono } from "@hono/zod-openapi";
import { rateLimiter } from "hono-rate-limiter";
import { bodyLimit } from "hono/body-limit";
import { compress } from "hono/compress";
import { contextStorage } from "hono/context-storage";
import { cors } from "hono/cors";
import { requestId } from "hono/request-id";
import { secureHeaders } from "hono/secure-headers";
import { timing } from "hono/timing";

import type { AppBindings, AppOpenAPI, RateLimitOptions } from "@/types";

import { buildCSPDirectives, env, isCSPEnabled } from "@/config";
import { prisma } from "@/db/prisma";
import { HTTP_STATUS } from "@/lib/http-status";
import { accessLoggerMiddleware } from "@/middlewares/access-logger";
import { structuredLogger } from "@/middlewares/pino-logger";

// Custom error handling (replaces stoker)
import { errorHandler } from "./error-handler";
import { notFoundHandler } from "./not-found-handler";
import { validationHook } from "./validation-hook";

/**
 * Creates a new router for modules
 *
 * IMPORTANT: This factory ensures validationHook is applied to every router.
 * The defaultHook from parent app does NOT propagate to child routers
 * mounted via .route() - this is confirmed Hono behavior.
 *
 * Always use this factory instead of creating OpenAPIHono directly in modules.
 *
 * @see https://github.com/honojs/middleware/issues/708
 */
export function createRouter() {
  return new OpenAPIHono<AppBindings>({
    strict: false,
    defaultHook: validationHook,
  });
};

/**
 * Creates the main application with middleware stack
 *
 * Middleware order is critical for proper functionality:
 * 1. Request ID (first - for correlation in all subsequent middleware)
 * 2. Context Storage (enables async context propagation)
 * 3. Access Logger (HTTP request/response logging)
 * 4. Structured Logger (business logging context)
 * 5. Security Headers (CSP, HSTS, etc.)
 * 6. Compression (bandwidth optimization)
 * 7. Timing (performance headers)
 * 8. CORS (cross-origin configuration)
 * 9. Rate Limiting (DDoS protection)
 * 10. Prisma Injection (database client)
 */
function createApp() {
  const app = new OpenAPIHono<AppBindings>({
    strict: false,
    defaultHook: validationHook,
  });

  // =================================================================
  // LOGGING MIDDLEWARE (order is critical!)
  // =================================================================

  // 1. Request ID - must be first for correlation
  app.use(requestId());

  // 2. Context Storage - enables tryGetContext() in PrintFunc
  //    Uses AsyncLocalStorage to propagate context across async boundaries
  app.use(contextStorage());

  // 3. Access Logger - hono/logger with custom PrintFunc → accessLogger
  //    Single source of truth for access logs
  app.use(accessLoggerMiddleware());

  // 4. Structured Logger - business logging context only
  //    Sets logger and logContext in Hono context for handlers
  app.use(structuredLogger());

  // =================================================================
  // BODY SIZE LIMITS
  // =================================================================
  // Defense layer against OOM and event loop DoS from large payloads
  // @see https://github.com/honojs/hono/security/advisories/GHSA-92vj-g62v-jqhh
  app.use("*", bodyLimit({
    maxSize: env.MAX_DEFAULT_BODY_SIZE_BYTES,
    onError: (c) => {
      const maxMB = Math.round(env.MAX_DEFAULT_BODY_SIZE_BYTES / 1024 / 1024);
      return c.json(
        {
          success: false,
          data: null,
          error: {
            type: "https://api.template.local/problems/payload-too-large",
            title: "Payload too large",
            status: HTTP_STATUS.CONTENT_TOO_LARGE,
            detail: "Request body too large",
            instance: c.req.path,
            code: "E1413",
            errors: [],
            limit: `${maxMB}MB`,
          },
          meta: {
            requestId: c.get("requestId") || "unknown",
            timestamp: new Date().toISOString(),
          },
        },
        HTTP_STATUS.CONTENT_TOO_LARGE,
      );
    },
  }));

  // =================================================================
  // PERFORMANCE MIDDLEWARE (The order is important!)
  // =================================================================

  // 1. Security headers (first for safety)
  const enableCSP = isCSPEnabled(env.NODE_ENV);

  app.use("*", secureHeaders(
    enableCSP
      ? {
          contentSecurityPolicy: buildCSPDirectives(env.NODE_ENV),
        }
      : {
          // CSP disabled for development
        },
  ));

  // 2. Compression (second for bandwidth optimization)
  app.use("*", compress({
    encoding: "gzip", // Best performance/compression ratio for JSON APIs
    threshold: 1024, // Compress only files > 1KB
  }));

  // 3. Timing header (performance before monitoring)
  app.use("*", timing());

  // 4. CORS (pre cross-origin requests)
  app.use("*", cors({
    origin: env.CORS_ORIGIN?.split(",") || ["*"],
    allowMethods: env.CORS_METHODS?.split(",") || ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    allowHeaders: env.CORS_HEADERS?.split(",") || ["Content-Type", "Authorization"],
    credentials: true,
  }));

  // 5. Rate limiting (DDoS protection)
  app.use("*", rateLimiter({
    windowMs: env.RATE_LIMIT_WINDOW_MS,
    limit: env.RATE_LIMIT_MAX,
    standardHeaders: "draft-6",
    keyGenerator: (c: { req: { header: (key: string) => string | undefined }; env?: { ip?: string } }) =>
      c.req.header("x-forwarded-for") || c.env?.ip || "anonymous",
  } as RateLimitOptions));

  // 6. Prisma injection (available on all routes)
  app.use("*", async (c, next) => {
    c.set("prisma", prisma);
    await next();
  });

  // =================================================================
  // CENTRALIZED ERROR HANDLING (RFC 9457)
  // =================================================================
  // IMPORTANT: These handlers are set ONLY on the root app.
  // Do NOT add notFound or onError handlers on child routers/modules.
  // Route-level handlers have priority and would bypass these.

  app.notFound(notFoundHandler);
  app.onError(errorHandler);

  return app;
};

export default createApp;

export function createTestApp<S extends Schema>(router: AppOpenAPI<S>) {
  return createApp().route("/", router);
};
