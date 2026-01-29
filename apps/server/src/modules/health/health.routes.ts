/**
 * Health Module Routes
 *
 * OpenAPI route definitions for health check endpoints.
 * Follows Kubernetes probe conventions:
 * - /health/live: Liveness probe (no dependencies)
 * - /health/ready: Readiness probe (critical dependencies)
 * - /health: Full diagnostic endpoint
 *
 * @module modules/health/health.routes
 */

import { createRoute } from "@hono/zod-openapi";

import { standardErrorResponseSchema } from "@/schemas/common.schema";

import {
  healthResponseSchema,
  liveResponseSchema,
  readyResponseSchema,
} from "./health.schema";

const tags = ["Health"];

// =================================================================
// LIVENESS PROBE ROUTE
// =================================================================

/**
 * Liveness probe - checks if process is alive
 *
 * IMPORTANT: This endpoint must NEVER access databases or external services.
 * A failed liveness probe causes Kubernetes to restart the pod.
 *
 * @see https://kubernetes.io/docs/tasks/configure-pod-container/configure-liveness-readiness-startup-probes/
 */
export const live = createRoute({
  path: "/health/live",
  method: "get",
  tags,
  summary: "Liveness probe",
  description: "Returns 200 if the process is alive. Does not check any dependencies. "
    + "Use this endpoint for Kubernetes liveness probes.",
  responses: {
    200: {
      description: "Process is alive",
      content: {
        "application/json": {
          schema: liveResponseSchema,
        },
      },
    },
  },
});

// =================================================================
// READINESS PROBE ROUTE
// =================================================================

/**
 * Readiness probe - checks if service is ready to accept traffic
 *
 * Checks critical dependencies (database).
 * A failed readiness probe removes the pod from service endpoints.
 *
 * @see https://kubernetes.io/docs/tasks/configure-pod-container/configure-liveness-readiness-startup-probes/
 */
export const ready = createRoute({
  path: "/health/ready",
  method: "get",
  tags,
  summary: "Readiness probe",
  description: "Returns 200 if the service is ready to accept traffic. "
    + "Checks database connectivity. Use this endpoint for Kubernetes readiness probes.",
  responses: {
    200: {
      description: "Service is ready",
      content: {
        "application/json": {
          schema: readyResponseSchema,
        },
      },
    },
    503: {
      description: "Service is not ready",
      content: {
        "application/json": {
          schema: standardErrorResponseSchema,
        },
      },
    },
  },
});

// =================================================================
// FULL HEALTH CHECK ROUTE
// =================================================================

/**
 * Full health check - detailed diagnostic information
 *
 * Returns comprehensive health status including:
 * - Database connectivity
 * - Memory usage
 * - Application version
 * - Uptime
 */
export const health = createRoute({
  path: "/health",
  method: "get",
  tags,
  summary: "Full health check",
  description: "Returns detailed health status including all component checks, "
    + "memory usage, version, and uptime. Use for monitoring and debugging.",
  responses: {
    200: {
      description: "Service is healthy",
      content: {
        "application/json": {
          schema: healthResponseSchema,
        },
      },
    },
    503: {
      description: "Service is unhealthy",
      content: {
        "application/json": {
          schema: standardErrorResponseSchema,
        },
      },
    },
  },
});

// =================================================================
// TYPE EXPORTS
// =================================================================

export type LiveRoute = typeof live;
export type ReadyRoute = typeof ready;
export type HealthRoute = typeof health;
