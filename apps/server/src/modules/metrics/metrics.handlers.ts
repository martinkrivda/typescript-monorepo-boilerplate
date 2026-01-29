import { collectDefaultMetrics, register } from "prom-client";

import type { AppRouteHandler } from "@/types";

import { HTTP_STATUS } from "@/lib/http-status";

import type { GetMetricsRoute } from "./metrics.routes";

collectDefaultMetrics({ register });

export async function getMetricsHandler(
  c: Parameters<AppRouteHandler<GetMetricsRoute>>[0],
) {
  const metrics = await register.metrics();

  c.header("Content-Type", register.contentType);

  return c.text(metrics, HTTP_STATUS.OK);
}
