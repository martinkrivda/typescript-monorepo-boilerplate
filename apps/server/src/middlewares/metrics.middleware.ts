import type { Context, Next } from "hono";

import { getPath } from "hono/utils/url";
import { Histogram, register } from "prom-client";

const httpRequestDurationSeconds = new Histogram({
  name: "http_request_duration_seconds",
  help: "Duration of HTTP requests in seconds",
  labelNames: ["method", "route", "status_code"],
  buckets: [0.001, 0.005, 0.01, 0.05, 0.1, 0.5, 1, 2, 5, 10],
});

register.registerMetric(httpRequestDurationSeconds);
export async function metricsMiddleware(c: Context, next: Next) {
  const start = process.hrtime.bigint();

  await next();

  const end = process.hrtime.bigint();
  const durationInSeconds = Number(end - start) / 1_000_000_000;

  const labels = {
    method: c.req.method,
    route: getPath(c.req.raw) || c.req.path,
    status_code: c.res.status.toString(),
  };

  httpRequestDurationSeconds.observe(labels, durationInSeconds);
}
