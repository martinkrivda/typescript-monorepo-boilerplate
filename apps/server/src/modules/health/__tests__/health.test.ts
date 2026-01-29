/**
 * Health Module Integration Tests
 *
 * Tests for Kubernetes-ready health check endpoints:
 * - /health/live: Liveness probe (no dependencies)
 * - /health/ready: Readiness probe (database)
 * - /health: Full diagnostic
 *
 * @module modules/health/__tests__/health.test
 */

import { OpenAPIHono } from "@hono/zod-openapi";
import { describe, expect, it, vi } from "vitest";

import type { AppBindings } from "@/types";

import { healthHandler, liveHandler, readyHandler } from "../health.handlers";

// =================================================================
// TEST APP FACTORY
// =================================================================

/**
 * Creates a minimal test app for health endpoints
 */
function createHealthTestApp(dbHealthy: boolean = true) {
  const app = new OpenAPIHono<AppBindings>();

  // Mock requestId middleware
  app.use("*", async (c, next) => {
    c.set("requestId", "test-request-id-health");
    await next();
  });

  // Mock logger middleware
  app.use("*", async (c, next) => {
    c.set("logger", {
      info: () => {},
      warn: () => {},
      error: () => {},
      debug: () => {},
    } as any);
    await next();
  });

  // Mock prisma with configurable health
  app.use("*", async (c, next) => {
    c.set("prisma", {
      $queryRaw: dbHealthy
        ? vi.fn().mockResolvedValue([{ health: 1 }])
        : vi.fn().mockRejectedValue(new Error("Database connection failed")),
    } as any);
    await next();
  });

  // Register health routes
  app.get("/health/live", liveHandler);
  app.get("/health/ready", readyHandler);
  app.get("/health", healthHandler);

  return app;
};

// =================================================================
// TEST: LIVENESS PROBE (/health/live)
// =================================================================

describe("liveness probe /health/live", () => {
  it("always returns 200 status", async () => {
    const app = createHealthTestApp();
    const res = await app.request("/health/live");

    expect(res.status).toBe(200);
  });

  it("returns status: alive", async () => {
    const app = createHealthTestApp();
    const res = await app.request("/health/live");
    const body = await res.json();

    expect(body).toHaveProperty("status", "alive");
    expect(body).toHaveProperty("timestamp");
  });

  it("returns 200 even when database is down", async () => {
    // Critical: liveness must NOT depend on database
    const app = createHealthTestApp(false);
    const res = await app.request("/health/live");

    expect(res.status).toBe(200);
  });

  it("returns Content-Type: application/json", async () => {
    const app = createHealthTestApp();
    const res = await app.request("/health/live");

    expect(res.headers.get("Content-Type")).toContain("application/json");
  });

  it("timestamp is valid ISO 8601", async () => {
    const app = createHealthTestApp();
    const res = await app.request("/health/live");
    const body = await res.json();

    const timestamp = new Date(body.timestamp);
    expect(timestamp.toISOString()).toBe(body.timestamp);
  });
});

// =================================================================
// TEST: READINESS PROBE (/health/ready)
// =================================================================

describe("readiness probe /health/ready", () => {
  it("returns 200 when database is healthy", async () => {
    const app = createHealthTestApp(true);
    const res = await app.request("/health/ready");

    expect(res.status).toBe(200);
  });

  it("returns envelope with status: ready when healthy", async () => {
    const app = createHealthTestApp(true);
    const res = await app.request("/health/ready");
    const body = await res.json();

    // Envelope structure
    expect(body).toHaveProperty("success", true);
    expect(body).toHaveProperty("data");
    expect(body).toHaveProperty("error", null);
    expect(body).toHaveProperty("meta");

    // Data contains ready status
    expect(body.data).toHaveProperty("status", "ready");
    expect(body.data).toHaveProperty("checks");
    expect(Array.isArray(body.data.checks)).toBe(true);

    // Meta has requestId
    expect(body.meta).toHaveProperty("requestId");
    expect(body.meta).toHaveProperty("timestamp");
  });

  it("includes database check with pass status", async () => {
    const app = createHealthTestApp(true);
    const res = await app.request("/health/ready");
    const body = await res.json();

    const dbCheck = body.data.checks.find((c: any) => c.name === "database");
    expect(dbCheck).toBeDefined();
    expect(dbCheck.status).toBe("UP");
    expect(dbCheck).toHaveProperty("responseTimeMs");
  });

  it("returns 503 when database is down", async () => {
    const app = createHealthTestApp(false);
    const res = await app.request("/health/ready");

    expect(res.status).toBe(503);
  });

  it("returns envelope with RFC 9457 Problem Details when not ready", async () => {
    const app = createHealthTestApp(false);
    const res = await app.request("/health/ready");
    const body = await res.json();

    // Envelope structure
    expect(body).toHaveProperty("success", false);
    expect(body).toHaveProperty("data", null);
    expect(body).toHaveProperty("error");
    expect(body).toHaveProperty("meta");

    // Meta has requestId
    expect(body.meta).toHaveProperty("requestId");
    expect(body.meta).toHaveProperty("timestamp");

    // RFC 9457 Problem Details inside error
    expect(body.error).toHaveProperty("type");
    expect(body.error).toHaveProperty("title", "Service unavailable");
    expect(body.error).toHaveProperty("status", 503);
    expect(body.error).toHaveProperty("detail");
    expect(body.error).toHaveProperty("instance", "/health/ready");
    expect(body.error).toHaveProperty("code", "E1503");

    // Extension member inside error
    expect(body.error).toHaveProperty("checks");
    expect(Array.isArray(body.error.checks)).toBe(true);
  });

  it("includes failed database check in 503 response", async () => {
    const app = createHealthTestApp(false);
    const res = await app.request("/health/ready");
    const body = await res.json();

    const dbCheck = body.error.checks.find((c: any) => c.name === "database");
    expect(dbCheck).toBeDefined();
    expect(dbCheck.status).toBe("DOWN");
    expect(dbCheck).toHaveProperty("message");
  });
});

// =================================================================
// TEST: FULL HEALTH CHECK (/health)
// =================================================================

describe("full health check /health", () => {
  it("returns 200 when all checks pass", async () => {
    const app = createHealthTestApp(true);
    const res = await app.request("/health");

    expect(res.status).toBe(200);
  });

  it("returns envelope with comprehensive health data", async () => {
    const app = createHealthTestApp(true);
    const res = await app.request("/health");
    const body = await res.json();

    // Envelope structure
    expect(body).toHaveProperty("success", true);
    expect(body).toHaveProperty("data");
    expect(body).toHaveProperty("error", null);
    expect(body).toHaveProperty("meta");

    // Data contains health info
    expect(body.data).toHaveProperty("status", "UP");
    expect(body.data).toHaveProperty("version");
    expect(body.data).toHaveProperty("uptime");
    expect(body.data).toHaveProperty("checks");
    expect(Array.isArray(body.data.checks)).toBe(true);

    // Meta has requestId
    expect(body.meta).toHaveProperty("requestId");
    expect(body.meta).toHaveProperty("timestamp");
  });

  it("includes database and memory checks", async () => {
    const app = createHealthTestApp(true);
    const res = await app.request("/health");
    const body = await res.json();

    const checkNames = body.data.checks.map((c: any) => c.name);
    expect(checkNames).toContain("database");
    expect(checkNames).toContain("memory");
  });

  it("memory check includes usage details", async () => {
    const app = createHealthTestApp(true);
    const res = await app.request("/health");
    const body = await res.json();

    const memCheck = body.data.checks.find((c: any) => c.name === "memory");
    expect(memCheck).toBeDefined();
    expect(memCheck.details).toHaveProperty("heapUsedMB");
    expect(memCheck.details).toHaveProperty("heapTotalMB");
    expect(memCheck.details).toHaveProperty("rssMB");
  });

  it("returns 503 when database fails", async () => {
    const app = createHealthTestApp(false);
    const res = await app.request("/health");

    expect(res.status).toBe(503);
  });

  it("returns envelope with RFC 9457 Problem Details when unhealthy", async () => {
    const app = createHealthTestApp(false);
    const res = await app.request("/health");
    const body = await res.json();

    // Envelope structure
    expect(body).toHaveProperty("success", false);
    expect(body).toHaveProperty("data", null);
    expect(body).toHaveProperty("error");
    expect(body).toHaveProperty("meta");

    // Meta has requestId
    expect(body.meta).toHaveProperty("requestId");
    expect(body.meta).toHaveProperty("timestamp");

    // RFC 9457 Problem Details inside error
    expect(body.error).toHaveProperty("type");
    expect(body.error).toHaveProperty("title", "Service unavailable");
    expect(body.error).toHaveProperty("status", 503);
    expect(body.error).toHaveProperty("detail");
    expect(body.error).toHaveProperty("code", "E1503");

    // Extension members inside error
    expect(body.error).toHaveProperty("checks");
    expect(body.error).toHaveProperty("version");
    expect(body.error).toHaveProperty("uptime");
  });

  it("uptime is a positive number", async () => {
    const app = createHealthTestApp(true);
    const res = await app.request("/health");
    const body = await res.json();

    expect(typeof body.data.uptime).toBe("number");
    expect(body.data.uptime).toBeGreaterThanOrEqual(0);
  });
});

// =================================================================
// TEST: RESPONSE TIMING
// =================================================================

describe("health endpoint response timing", () => {
  it("/health/live responds quickly (no DB call)", async () => {
    const app = createHealthTestApp(true);
    const start = performance.now();
    await app.request("/health/live");
    const duration = performance.now() - start;

    // Liveness should be very fast (< 50ms)
    expect(duration).toBeLessThan(50);
  });
});

// =================================================================
// TEST: HTTP HEADERS
// =================================================================

describe("health endpoint HTTP headers", () => {
  it("all endpoints return application/json", async () => {
    const app = createHealthTestApp(true);

    const liveRes = await app.request("/health/live");
    const readyRes = await app.request("/health/ready");
    const healthRes = await app.request("/health");

    expect(liveRes.headers.get("Content-Type")).toContain("application/json");
    expect(readyRes.headers.get("Content-Type")).toContain("application/json");
    expect(healthRes.headers.get("Content-Type")).toContain("application/json");
  });

  it("all endpoints return Cache-Control: no-store", async () => {
    const app = createHealthTestApp(true);

    const liveRes = await app.request("/health/live");
    const readyRes = await app.request("/health/ready");
    const healthRes = await app.request("/health");

    expect(liveRes.headers.get("Cache-Control")).toBe("no-store");
    expect(readyRes.headers.get("Cache-Control")).toBe("no-store");
    expect(healthRes.headers.get("Cache-Control")).toBe("no-store");
  });

  it("503 responses also have Cache-Control: no-store", async () => {
    const app = createHealthTestApp(false);

    const readyRes = await app.request("/health/ready");
    const healthRes = await app.request("/health");

    expect(readyRes.headers.get("Cache-Control")).toBe("no-store");
    expect(healthRes.headers.get("Cache-Control")).toBe("no-store");
  });

  it("503 responses include Retry-After header per RFC 9110", async () => {
    const app = createHealthTestApp(false);

    const readyRes = await app.request("/health/ready");
    const healthRes = await app.request("/health");

    // Per RFC 9110, Retry-After should be present on 503 responses
    expect(readyRes.headers.get("Retry-After")).toBe("30");
    expect(healthRes.headers.get("Retry-After")).toBe("30");
  });

  it("200 responses do not include Retry-After header", async () => {
    const app = createHealthTestApp(true);

    const liveRes = await app.request("/health/live");
    const readyRes = await app.request("/health/ready");
    const healthRes = await app.request("/health");

    expect(liveRes.headers.get("Retry-After")).toBeNull();
    expect(readyRes.headers.get("Retry-After")).toBeNull();
    expect(healthRes.headers.get("Retry-After")).toBeNull();
  });
});
