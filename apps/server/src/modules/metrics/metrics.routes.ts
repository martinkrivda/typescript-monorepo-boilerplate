import { createRoute } from "@hono/zod-openapi";
import { z } from "zod";

import { HTTP_STATUS } from "@/lib/http-status";

export const getMetrics = createRoute({
  tags: ["Monitoring"],
  method: "get",
  path: "/metrics",
  summary: "Get Prometheus metrics",
  description: "Endpoint for Prometheus to scrape application metrics",
  responses: {
    [HTTP_STATUS.OK]: {
      description: "Prometheus metrics in plain text format",
      content: {
        "text/plain": {
          schema: z.string(),
          example: `# HELP http_request_duration_seconds Duration of HTTP requests in seconds
            # TYPE http_request_duration_seconds histogram
            http_request_duration_seconds_bucket{le="0.001",method="GET",route="/",status_code="200"} 10
            http_request_duration_seconds_bucket{le="0.005",method="GET",route="/",status_code="200"} 50
            http_request_duration_seconds_count{method="GET",route="/",status_code="200"} 100
            http_request_duration_seconds_sum{method="GET",route="/",status_code="200"} 2.5`,
        },
      },
    },
  },
});

export type GetMetricsRoute = typeof getMetrics;
