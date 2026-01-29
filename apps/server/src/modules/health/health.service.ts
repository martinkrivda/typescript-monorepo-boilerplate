/**
 * Health Service - Health Check Logic
 *
 * Implements health check operations with timeouts and measurements.
 * Used by health handlers for liveness, readiness, and full health checks.
 *
 * @module modules/health/health.service
 */

import type { PrismaClient } from "@/generated/prisma/client";

import type { CheckResult, CheckStatus, HealthResponse } from "./health.schema";

import packageJSON from "../../../../../package.json" with { type: "json" };

// =================================================================
// CONFIGURATION
// =================================================================

/**
 * Default timeout for database health check (milliseconds)
 * Should be shorter than Kubernetes probe timeoutSeconds
 */
const DB_CHECK_TIMEOUT_MS = 2000;

/**
 * Application version from package.json
 */
const APP_VERSION = packageJSON.version ?? "0.1.0";

// =================================================================
// DATABASE HEALTH CHECK
// =================================================================

/**
 * Performs database health check with timeout
 *
 * @param prisma - Prisma client instance
 * @param timeoutMs - Timeout in milliseconds (default: 2000)
 * @returns CheckResult with status, responseTime, and optional error
 */
export async function checkDatabase(
  prisma: PrismaClient,
  timeoutMs = DB_CHECK_TIMEOUT_MS,
): Promise<CheckResult> {
  const startTime = performance.now();

  try {
    // Create a promise that rejects after timeout
    const timeoutPromise = new Promise<never>((_, reject) => {
      setTimeout(() => {
        reject(new Error(`Database check timed out after ${timeoutMs}ms`));
      }, timeoutMs);
    });

    // Race between actual query and timeout
    await Promise.race([
      prisma.$queryRaw`SELECT 1 as health`,
      timeoutPromise,
    ]);

    const responseTimeMs = Math.round(performance.now() - startTime);

    return {
      name: "database",
      status: "UP",
      responseTimeMs,
      message: "Connection successful",
    };
  }
  catch (error) {
    const responseTimeMs = Math.round(performance.now() - startTime);
    const message = error instanceof Error ? error.message : "Unknown database error";

    return {
      name: "database",
      status: "DOWN",
      responseTimeMs,
      message,
    };
  }
}

// =================================================================
// MEMORY HEALTH CHECK
// =================================================================

/**
 * Performs memory health check
 *
 * @returns CheckResult with memory usage details
 */
export function checkMemory() {
  const memUsage = process.memoryUsage();

  // Calculate heap usage percentage
  const heapUsedMB = Math.round(memUsage.heapUsed / 1024 / 1024);
  const heapTotalMB = Math.round(memUsage.heapTotal / 1024 / 1024);
  const rssMB = Math.round(memUsage.rss / 1024 / 1024);
  const heapUsagePercent = Math.round((memUsage.heapUsed / memUsage.heapTotal) * 100);

  // Consider memory "warn" if heap usage > 85%
  const status: CheckStatus = heapUsagePercent > 85 ? "DOWN" : "UP";

  return {
    name: "memory",
    status,
    message: status === "UP" ? "Memory usage normal" : "High memory usage",
    details: {
      heapUsedMB,
      heapTotalMB,
      rssMB,
      heapUsagePercent,
      externalMB: Math.round(memUsage.external / 1024 / 1024),
    },
  };
}

// =================================================================
// AGGREGATE HEALTH STATUS
// =================================================================

/**
 * Calculates overall health status from individual checks
 *
 * @param checks - Array of check results
 * @returns Overall health status
 */
export function calculateHealthStatus(checks: CheckResult[]) {
  const hasFailure = checks.some(c => c.status === "DOWN");
  const allPass = checks.every(c => c.status === "UP" || c.status === "SKIP");

  if (hasFailure) {
    return "DOWN";
  }
  if (allPass) {
    return "UP";
  }
  return "DEGRADED";
}

/**
 * Determines if service is ready based on checks
 * Ready means all critical checks pass
 *
 * @param checks - Array of check results
 * @returns true if ready, false otherwise
 */
export function isReady(checks: CheckResult[]) {
  // For readiness, only database is critical
  const dbCheck = checks.find(c => c.name === "database");
  return dbCheck?.status === "UP";
}

// =================================================================
// FULL HEALTH CHECK
// =================================================================

/**
 * Performs full health check with all components
 *
 * @param prisma - Prisma client instance
 * @returns Full health check results
 */
export async function performFullHealthCheck(
  prisma: PrismaClient,
): Promise<HealthResponse> {
  // Run checks in parallel for efficiency
  const [dbCheck] = await Promise.all([
    checkDatabase(prisma),
  ]);

  // Memory check is synchronous
  const memoryCheck = checkMemory();

  const checks = [dbCheck, memoryCheck];
  const status = calculateHealthStatus(checks);

  return {
    status,
    version: APP_VERSION,
    uptime: Math.round(process.uptime()),
    checks,
  };
}

/**
 * Performs readiness check (only critical dependencies)
 *
 * @param prisma - Prisma client instance
 * @returns Readiness check results
 */
export async function performReadinessCheck(
  prisma: PrismaClient,
): Promise<{ ready: boolean; checks: CheckResult[] }> {
  const dbCheck = await checkDatabase(prisma);
  const checks = [dbCheck];

  return {
    ready: isReady(checks),
    checks,
  };
}

// =================================================================
// EXPORTS
// =================================================================

export { APP_VERSION, DB_CHECK_TIMEOUT_MS };
