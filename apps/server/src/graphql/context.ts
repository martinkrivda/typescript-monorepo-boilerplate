import type { JwtTokenPayload } from "hono/utils/jwt/types";

import { verify } from "hono/jwt";

import { env } from "@/config";

export interface GraphQLUser {
  sub?: string;
  payload: JwtTokenPayload;
}

export interface GraphQLContext {
  requestId: string;
  user: GraphQLUser | null;
}

function extractBearerToken(authorization?: string) {
  if (!authorization || !authorization.startsWith("Bearer ")) {
    return null;
  }
  const token = authorization.slice(7).trim();
  return token || null;
}

export function getAuthorizationFromConnectionParams(params: unknown) {
  if (!params || typeof params !== "object") {
    return undefined;
  }

  const record = params as Record<string, unknown>;
  const directHeader = record.Authorization ?? record.authorization;

  if (typeof directHeader === "string") {
    return directHeader;
  }

  const nestedHeaders = record.headers;
  if (!nestedHeaders || typeof nestedHeaders !== "object") {
    return undefined;
  }

  const headersRecord = nestedHeaders as Record<string, unknown>;
  const nestedHeader = headersRecord.Authorization ?? headersRecord.authorization;
  return typeof nestedHeader === "string" ? nestedHeader : undefined;
}

export async function resolveUserFromAuthorization(authorization?: string) {
  const token = extractBearerToken(authorization);
  if (!token) {
    return null;
  }

  try {
    const payload = await verify(token, env.JWT_SECRET, "HS256");
    return {
      sub: typeof payload.sub === "string" ? payload.sub : undefined,
      payload,
    } satisfies GraphQLUser;
  }
  catch {
    return null;
  }
}
