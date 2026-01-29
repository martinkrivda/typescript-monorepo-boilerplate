import { createRouter } from "@/lib/create-app";

import { getMetricsHandler } from "./metrics.handlers";
import { getMetrics } from "./metrics.routes";

const router = createRouter();

router.openapi(getMetrics, getMetricsHandler);

export default router;
