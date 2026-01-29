/**
 * Health Module Schemas
 *
 * Zod schemas for health check endpoints.
 * Follows RFC 9457 envelope pattern with checks[] extension.
 *
 * @module modules/health/health.schema
 */

import { z } from "@hono/zod-openapi";

// =================================================================
// CHECK STATUS TYPES
// =================================================================

/**
 * Individual check status (uppercase for Rust compatibility)
 */
export const checkStatusSchema = z.enum(["UP", "DOWN", "SKIP"]).openapi({
  description: "Health check status: UP (healthy), DOWN (unhealthy), SKIP (not checked)",
  example: "UP",
});

export type CheckStatus = z.infer<typeof checkStatusSchema>;

/**
 * Overall health status (uppercase for Rust compatibility)
 */
export const healthStatusSchema = z.enum(["UP", "DEGRADED", "DOWN"]).openapi({
  description: "Overall health status",
  example: "UP",
});

export type HealthStatus = z.infer<typeof healthStatusSchema>;

// =================================================================
// CHECK RESULT SCHEMA
// =================================================================

/**
 * Individual health check result
 */
export const checkResultSchema = z.object({
  name: z.string().openapi({
    description: "Name of the health check component",
    example: "database",
  }),
  status: checkStatusSchema,
  responseTimeMs: z.number().optional().openapi({
    description: "Response time in milliseconds",
    example: 12,
  }),
  message: z.string().optional().openapi({
    description: "Additional message or error description",
    example: "Connection successful",
  }),
  details: z.record(z.string(), z.unknown()).optional().openapi({
    description: "Additional details specific to this check",
  }),
}).openapi("CheckResult");

export type CheckResult = z.infer<typeof checkResultSchema>;

// =================================================================
// LIVENESS RESPONSE SCHEMA
// =================================================================

/**
 * Liveness probe response - minimal, no dependencies
 */
export const liveResponseSchema = z.object({
  status: z.literal("alive").openapi({
    description: "Process is alive",
    example: "alive",
  }),
  timestamp: z.string().datetime().openapi({
    description: "ISO 8601 timestamp",
    example: "2025-01-15T10:30:00.000Z",
  }),
}).openapi("LiveResponse");

export type LiveResponse = z.infer<typeof liveResponseSchema>;

// =================================================================
// READINESS RESPONSE SCHEMA
// =================================================================

/**
 * Readiness probe response - includes critical dependency checks
 */
export const readyResponseSchema = z.object({
  status: z.enum(["ready", "not_ready"]).openapi({
    description: "Readiness status",
    example: "ready",
  }),
  checks: z.array(checkResultSchema).openapi({
    description: "Array of dependency check results",
  }),
}).openapi("ReadyResponse");

export type ReadyResponse = z.infer<typeof readyResponseSchema>;

// =================================================================
// FULL HEALTH RESPONSE SCHEMA
// =================================================================

/**
 * Full health check response - detailed diagnostics
 */
export const healthResponseSchema = z.object({
  status: healthStatusSchema,
  version: z.string().openapi({
    description: "Application version",
    example: "0.5.0",
  }),
  uptime: z.number().openapi({
    description: "Process uptime in seconds",
    example: 3600,
  }),
  checks: z.array(checkResultSchema).openapi({
    description: "Array of all health check results",
  }),
}).openapi("HealthResponse");

export type HealthResponse = z.infer<typeof healthResponseSchema>;

// =================================================================
// PROBLEM DETAILS EXTENSION FOR HEALTH FAILURES
// =================================================================

/**
 * Extended Problem Details with checks array
 * Used when health check fails (503 response)
 */
export const healthProblemExtensionSchema = z.object({
  checks: z.array(checkResultSchema).optional().openapi({
    description: "Health check results that caused the failure",
  }),
}).openapi("HealthProblemExtension");
