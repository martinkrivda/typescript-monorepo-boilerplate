import { createAdaptorServer } from "@hono/node-server";
import { Hono } from "hono";
import { sign } from "hono/jwt";
import request from "supertest";
import { afterAll, beforeAll, describe, expect, it } from "vitest";

import { env } from "@/config";
import { errorHandler } from "@/lib/error-handler";
import { authMiddleware } from "@/middlewares/auth.middleware";
import graphql from "@/modules/graphql";
import type { AppBindings } from "@/types";

function createGraphQLTestServer() {
  const app = new Hono<AppBindings>();

  app.use("*", async (c, next) => {
    c.set("requestId", "test-request-id-graphql");
    c.set("logger", {
      info: () => {},
      warn: () => {},
      error: () => {},
      debug: () => {},
    } as AppBindings["Variables"]["logger"]);
    await next();
  });

  app.use("*", authMiddleware);
  app.route("/", graphql);
  app.onError(errorHandler);

  return createAdaptorServer({
    fetch: app.fetch,
  });
}

describe("graphql endpoint integration", () => {
  const server = createGraphQLTestServer();
  let bearerToken = "";

  beforeAll(async () => {
    const jwt = await sign(
      { sub: "user-1", role: "user" },
      env.JWT_SECRET,
      "HS256"
    );
    bearerToken = `Bearer ${jwt}`;
  });

  afterAll(async () => {
    if (!server.listening) {
      return;
    }

    await new Promise<void>((resolve, reject) => {
      server.close((err?: Error) => {
        if (err) {
          reject(err);
          return;
        }
        resolve();
      });
    });
  });

  it("returns 401 for protected /graphql without bearer token", async () => {
    const response = await request(server)
      .post("/graphql")
      .send({ query: "{ ping }" });

    expect(response.status).toBe(401);
    expect(response.body.success).toBe(false);
    expect(response.body.error.status).toBe(401);
  });

  it("returns GraphQL data for authorized request", async () => {
    const response = await request(server)
      .post("/graphql")
      .set("Authorization", bearerToken)
      .send({ query: "{ ping serverTime }" });

    expect(response.status).toBe(200);
    expect(response.body.errors).toBeUndefined();
    expect(response.body.data.ping).toBe("pong");
    expect(typeof response.body.data.serverTime).toBe("string");
  });
});
