import type { Context, Next } from "hono";

import { HTTPException } from "hono/http-exception";
import { verify } from "hono/jwt";

import { env } from "@/config";

export const PUBLIC_PATHS = new Set([
  "/",
  "/health",
  "/health/live",
  "/health/ready",
  "/metrics",
  "/doc",
  "/reference",
]);

export function isPublicPath(path: string) {
  if (PUBLIC_PATHS.has(path)) {
    return true;
  }

  // Keep docs assets publicly available.
  return path.startsWith("/reference/");
}

export async function authMiddleware(c: Context, next: Next) {
  if (c.req.method === "OPTIONS" || isPublicPath(c.req.path)) {
    await next();
    return;
  }

  const authorization = c.req.header("authorization");
  if (!authorization || !authorization.startsWith("Bearer ")) {
    throw new HTTPException(401, {
      message: "Missing or invalid Authorization header",
    });
  }

  const token = authorization.slice(7).trim();
  if (!token) {
    throw new HTTPException(401, {
      message: "Missing bearer token",
    });
  }

  try {
    await verify(token, env.JWT_SECRET, "HS256");
  }
  catch {
    throw new HTTPException(401, {
      message: "Invalid or expired token",
    });
  }

  await next();
}
