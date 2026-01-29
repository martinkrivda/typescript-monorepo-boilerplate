/**
 * Health Module - Kubernetes-ready Health Check Endpoints
 *
 * Provides three health check endpoints following Kubernetes conventions:
 * - /health/live: Liveness probe (process alive, no dependencies)
 * - /health/ready: Readiness probe (critical dependencies)
 * - /health: Full diagnostic endpoint
 *
 * Success responses return direct JSON for simplicity.
 * Error responses (503) use RFC 9457 Problem Details with checks[] extension.
 *
 * @module modules/health
 */

import { createRouter } from "@/lib/create-app";

import { healthHandler, liveHandler, readyHandler } from "./health.handlers";

// =================================================================
// ROUTER CONFIGURATION
// =================================================================

const router = createRouter();

// Liveness probe - no DB, always 200
router.get("/health/live", liveHandler);

// Readiness probe - DB ping, 200 or 503
router.get("/health/ready", readyHandler);

// Full health check - all diagnostics
router.get("/health", healthHandler);

export default router;

// =================================================================
// PUBLIC API EXPORTS
// =================================================================

// Re-export types for external use
export type { CheckResult, HealthResponse, HealthStatus, LiveResponse, ReadyResponse } from "./health.schema";

// Re-export service functions for programmatic health checks
export { checkDatabase, checkMemory, performFullHealthCheck, performReadinessCheck } from "./health.service";
