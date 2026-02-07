import { configureOpenAPI } from "@/config";
import createApp from "@/lib/create-app";
import { metricsMiddleware } from "@/middlewares/metrics.middleware";
import graphql from "@/modules/graphql";
import health from "@/modules/health";
import metrics from "@/modules/metrics";
import index from "@/routes/index.route";

const app = createApp();

configureOpenAPI(app);

// Global middleware can be applied here before routes
app.use("*", metricsMiddleware);

// Health check and API info routes (public, no auth required)
app.route("/", index);

// Health endpoints (public, Kubernetes probes)
app.route("/", health);

// Metrics endpoint (public, no auth required)
app.route("/", metrics);

// GraphQL endpoint (protected by auth middleware in create-app)
app.route("/", graphql);

// Type export for RPC and client generation
export type AppType = typeof app;

export default app;
