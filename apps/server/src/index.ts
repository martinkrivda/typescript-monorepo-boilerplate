import { serve } from "@hono/node-server";

import { env } from "@/config";

import app from "./app";

const port = env.PORT;

serve({
  fetch: app.fetch,
  port,
}, (info) => {
  console.log(`Server is running on port http://localhost:${info.port}`);
});
