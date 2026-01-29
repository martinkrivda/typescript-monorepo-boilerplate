/**
 * Health Module Handlers
 *
 * Route handlers for health check endpoints.
 * Follows Kubernetes probe conventions and envelope pattern.
 *
 * Key behaviors:
 * - /health/live: Always returns 200 (direct JSON, no envelope - minimal for liveness)
 * - /health/ready: Returns envelope (200 ok() or 503 fail())
 * - /health: Returns envelope (200 ok() or 503 fail())
 *
 * All responses include Cache-Control: no-store to prevent proxy caching.
 *
 * @module modules/health/health.handlers
 */

import type { Context } from "hono";

import type { AppBindings } from "@/types";

import { ProblemRegistry, problemTypeUri } from "@/errors";
import { fail, ok } from "@/lib/response";

import type { CheckResult, HealthResponse, LiveResponse, ReadyResponse } from "./health.schema";

import {
  performFullHealthCheck,
  performReadinessCheck,
} from "./health.service";

// =================================================================
// CONSTANTS
// =================================================================

/**
 * Retry-After interval in seconds for 503 responses
 * Per RFC 9110: "indicates how long the user agent ought to wait before making a follow-up request"
 */
const RETRY_AFTER_SECONDS = 30;

// =================================================================
// RESPONSE HEADERS
// =================================================================

/**
 * Sets Cache-Control header to prevent caching of health responses
 */
function setNoCacheHeaders(c: Context<AppBindings>) {
  c.header("Cache-Control", "no-store");
}

/**
 * Sets Retry-After header for 503 responses
 * @see https://www.rfc-editor.org/rfc/rfc9110.html#name-retry-after
 */
function setRetryAfterHeader(c: Context<AppBindings>) {
  c.header("Retry-After", String(RETRY_AFTER_SECONDS));
}

// =================================================================
// ERROR RESPONSE BUILDER
// =================================================================

/**
 * Creates RFC 9457 Problem Details with checks extension for health failures
 */
function createHealthProblem(
  c: Context<AppBindings>,
  detail: string,
  checks: CheckResult[],
) {
  const def = ProblemRegistry.service_unavailable;
  return {
    type: problemTypeUri("service_unavailable"),
    title: def.title,
    status: def.status,
    detail,
    instance: c.req.path,
    code: def.code,
    errors: [],
    // RFC 9457 extension: include checks array
    checks,
  };
}

// =================================================================
// LIVENESS HANDLER
// =================================================================

/**
 * Liveness probe handler
 *
 * CRITICAL: This handler must NEVER access databases or external services.
 * It only confirms the process is running.
 *
 * Note: Liveness returns minimal direct JSON (no envelope) for maximum
 * simplicity and speed. This is the only health endpoint without envelope.
 */
export function liveHandler(c: Context<AppBindings>) {
  setNoCacheHeaders(c);

  const response: LiveResponse = {
    status: "alive",
    timestamp: new Date().toISOString(),
  };
  return c.json(response, 200);
}

// =================================================================
// READINESS HANDLER
// =================================================================

/**
 * Readiness probe handler
 *
 * Checks critical dependencies (database).
 * Returns envelope format for both success and failure:
 * - 200 with ok() envelope if ready
 * - 503 with fail() envelope containing Problem Details + checks extension
 */
export async function readyHandler(c: Context<AppBindings>) {
  setNoCacheHeaders(c);

  const prisma = c.get("prisma");
  const { ready, checks } = await performReadinessCheck(prisma);

  if (ready) {
    const data: ReadyResponse = {
      status: "ready",
      checks,
    };
    return ok(c, data);
  }

  // Not ready - return 503 with envelope + RFC 9457 Problem Details
  setRetryAfterHeader(c);
  const problem = createHealthProblem(
    c,
    "Service is not ready to accept traffic",
    checks,
  );
  return fail(c, problem, 503);
}

// =================================================================
// FULL HEALTH HANDLER
// =================================================================

/**
 * Full health check handler
 *
 * Returns comprehensive diagnostic information.
 * Returns envelope format for both success and failure:
 * - 200 with ok() envelope if healthy
 * - 503 with fail() envelope containing Problem Details + checks extension
 */
export async function healthHandler(c: Context<AppBindings>) {
  setNoCacheHeaders(c);

  const prisma = c.get("prisma");
  const result = await performFullHealthCheck(prisma);

  if (result.status === "UP") {
    const data: HealthResponse = result;
    return ok(c, data);
  }

  // Unhealthy or degraded - return 503 with envelope + RFC 9457 Problem Details
  setRetryAfterHeader(c);
  const problem = {
    ...createHealthProblem(c, `Service is ${result.status}`, result.checks),
    // Include additional diagnostic info as extension members
    version: result.version,
    uptime: result.uptime,
  };
  return fail(c, problem, 503);
}
