import { Hono } from "hono";

import { yoga } from "@/graphql";
import type { AppBindings } from "@/types";

const router = new Hono<AppBindings>();

router.on(["GET", "POST", "OPTIONS"], "/graphql", (c) => {
  return yoga.fetch(c.req.raw, {
    requestId: c.get("requestId"),
  });
});

export default router;
