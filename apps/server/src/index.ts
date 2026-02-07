import { serve } from "@hono/node-server";

import { env } from "@/config";
import { attachGraphQLWebSocketServer } from "@/graphql";

import app from "./app";

const port = env.PORT;

const server = serve({
  fetch: app.fetch,
  port,
}, (info) => {
  console.log(`Server is running on port http://localhost:${info.port}`);
});

const disposeGraphQLWebSocket = attachGraphQLWebSocketServer(server);

const shutdown = () => {
  disposeGraphQLWebSocket();
};

process.on("SIGINT", shutdown);
process.on("SIGTERM", shutdown);
