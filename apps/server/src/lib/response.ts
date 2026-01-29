/**
 * Response Helpers - Envelope Pattern Implementation
 *
 * Provides consistent response structure for all API endpoints:
 * - Success: { success: true, data: T, error: null, meta: ResponseMeta }
 * - Error: { success: false, data: null, error: ProblemDetails, meta: ResponseMeta }
 *
 * Content-Type: application/json (consistent for all responses)
 *
 * @see RFC 9457 for Problem Details structure
 * @see W3C Trace Context for traceparent parsing
 * @module lib/response
 */

import type { Context } from "hono";
import type { ContentfulStatusCode } from "hono/utils/http-status";

import type { ProblemDetails } from "./problem";

// =================================================================
// TYPE DEFINITIONS
// =================================================================

/**
 * Response metadata included in every response
 */
export interface ResponseMeta {
  /** Unique request identifier for correlation */
  requestId: string;
  /** ISO 8601 timestamp of response generation */
  timestamp: string;
  /** W3C Trace Context trace-id (optional, if traceparent header present) */
  traceId?: string;
  /** W3C Trace Context span-id (optional, if traceparent header present) */
  spanId?: string;
}

/**
 * Success response envelope
 */
export interface SuccessEnvelope<T> {
  success: true;
  data: T;
  error: null;
  meta: ResponseMeta;
}

/**
 * Error response envelope
 */
export interface ErrorEnvelope {
  success: false;
  data: null;
  error: ProblemDetails;
  meta: ResponseMeta;
}

/**
 * Union type for any API response
 */
export type ApiResponse<T> = SuccessEnvelope<T> | ErrorEnvelope;

// =================================================================
// W3C TRACE CONTEXT PARSER
// =================================================================

/**
 * W3C Trace Context traceparent parser with validation
 *
 * Format: {version}-{trace-id}-{parent-id}-{trace-flags}
 * - version: 2 hex chars (currently only "00" supported)
 * - trace-id: 32 hex chars (MUST NOT be all zeros)
 * - parent-id/span-id: 16 hex chars (MUST NOT be all zeros)
 * - trace-flags: 2 hex chars
 *
 * @see https://www.w3.org/TR/trace-context/
 *
 * @param traceparent - The traceparent header value
 * @returns Parsed trace-id and span-id, or empty object if invalid
 */
function parseTraceparent(
  traceparent: string | undefined,
): {
  traceId?: string;
  spanId?: string;
} {
  if (!traceparent)
    return {};

  // Regex validation according to W3C Trace Context spec
  const TRACEPARENT_REGEX = /^([0-9a-f]{2})-([0-9a-f]{32})-([0-9a-f]{16})-([0-9a-f]{2})$/;
  const match = traceparent.match(TRACEPARENT_REGEX);

  if (!match)
    return {};

  const [, version, traceId, spanId] = match;

  // W3C Trace Context validation rules:
  // 1. Version "ff" is invalid (reserved for future use)
  // 2. trace-id MUST NOT be all zeros
  // 3. parent-id/span-id MUST NOT be all zeros
  if (
    version === "ff"
    || traceId === "00000000000000000000000000000000"
    || spanId === "0000000000000000"
  ) {
    return {};
  }

  return { traceId, spanId };
}

// =================================================================
// REQUEST ID HANDLING
// =================================================================

/**
 * Gets request ID from Hono context
 *
 * IMPORTANT: Request ID is generated ONLY by requestId() middleware.
 * This function only reads from context - never generates.
 * Trust policy is enforced in middleware configuration.
 *
 * @throws Error if requestId middleware is not configured
 */
function getRequestId(c: Context): string {
  const requestId = c.get("requestId") as string | undefined;

  if (!requestId) {
    // This should never happen if middleware is configured correctly
    // Log error and generate fallback (don't crash the request)
    console.error(
      "[response.ts] requestId not found in context. "
      + "Ensure requestId() middleware is applied before route handlers.",
    );
    // Fallback: generate UUID (Node 20+ required)
    return crypto.randomUUID();
  }

  return requestId;
}

// =================================================================
// META BUILDER
// =================================================================

/**
 * Builds response metadata from context
 */
function buildMeta(c: Context): ResponseMeta {
  const requestId = getRequestId(c);
  const timestamp = new Date().toISOString();

  // W3C Trace Context parsing with validation
  const traceparent = c.req.header("traceparent");
  const { traceId, spanId } = parseTraceparent(traceparent);

  return { requestId, timestamp, traceId, spanId };
}

// =================================================================
// RESPONSE HELPERS
// =================================================================

/**
 * Success response helper - overload for default 200 status
 *
 * Returns envelope with:
 * - success: true
 * - data: provided data
 * - error: null
 * - meta: request metadata
 *
 * @example
 * return ok(c, { user: userData }); // status 200
 */
/**
 * Success response helper - overload with explicit status literal
 *
 * @example
 * return ok(c, { user: userData }, 200);
 * return ok(c, { id: newId }, 201);
 */
export function ok<T>(
  c: Context,
  data: T,
): ReturnType<typeof c.json<SuccessEnvelope<T>, 200>>;
export function ok<T, S extends ContentfulStatusCode>(
  c: Context,
  data: T,
  status: S,
): ReturnType<typeof c.json<SuccessEnvelope<T>, S>>;
export function ok<T, S extends ContentfulStatusCode>(
  c: Context,
  data: T,
  status?: S,
) {
  const body: SuccessEnvelope<T> = {
    success: true,
    data,
    error: null,
    meta: buildMeta(c),
  };

  if (typeof status === "number") {
    return c.json(body, status);
  }
  return c.json(body, 200);
}

/**
 * Error response helper
 *
 * Returns envelope with:
 * - success: false
 * - data: null
 * - error: RFC 9457 Problem Details
 * - meta: request metadata
 *
 * NOTE: status is REQUIRED to preserve literal type for OpenAPI handlers.
 *
 * @param c - Hono context
 * @param problem - RFC 9457 Problem Details object
 * @param status - HTTP status code (required, must be literal)
 *
 * @example
 * return fail(c, problem, 401);
 * return fail(c, problem, 404);
 * return fail(c, problem, 500);
 */
export function fail<S extends ContentfulStatusCode>(
  c: Context,
  problem: ProblemDetails,
  status: S,
): ReturnType<typeof c.json<ErrorEnvelope, S>> {
  const body: ErrorEnvelope = {
    success: false,
    data: null,
    error: problem,
    meta: buildMeta(c),
  };
  return c.json(body, status);
}

/**
 * Created response helper (201)
 *
 * Convenience wrapper for ok() with 201 status.
 * Returns properly typed response with literal 201 status.
 *
 * @param c - Hono context
 * @param data - Created resource data
 *
 * @example
 * return created(c, { id: newUser.id, email: newUser.email });
 */
export function created<T>(
  c: Context,
  data: T,
): ReturnType<typeof c.json<SuccessEnvelope<T>, 201>> {
  return ok(c, data, 201);
}

/**
 * No content response (204)
 *
 * Returns empty body with 204 status.
 * This is an EXCEPTION to the envelope pattern (per HTTP spec).
 *
 * Use for:
 * - DELETE operations with no return value
 * - PUT/PATCH updates where client doesn't need response body
 *
 * @param c - Hono context
 *
 * @example
 * // After successful DELETE
 * return noContent(c);
 */
export function noContent(c: Context) {
  return c.body(null, 204);
}

/**
 * Accepted response helper (202)
 *
 * For async operations that will be processed later.
 * Returns properly typed response with literal 202 status.
 *
 * @param c - Hono context
 * @param data - Accepted task data (e.g., job ID)
 *
 * @example
 * return accepted(c, { jobId: "abc-123", status: "processing" });
 */
export function accepted<T>(
  c: Context,
  data: T,
): ReturnType<typeof c.json<SuccessEnvelope<T>, 202>> {
  return ok(c, data, 202);
}

// =================================================================
// PAGINATION HELPERS (optional - for list endpoints)
// =================================================================

/**
 * Pagination metadata for list responses
 */
export interface PaginationMeta {
  page: number;
  pageSize: number;
  totalItems: number;
  totalPages: number;
  hasNextPage: boolean;
  hasPreviousPage: boolean;
}

/**
 * Paginated list response data
 */
export interface PaginatedData<T> {
  items: T[];
  pagination: PaginationMeta;
}

/**
 * Paginated list response helper
 *
 * Returns properly typed response with literal 200 status.
 *
 * @param c - Hono context
 * @param items - List of items
 * @param pagination - Pagination metadata
 *
 * @example
 * return paginated(c, users, {
 *   page: 1,
 *   pageSize: 20,
 *   totalItems: 100,
 *   totalPages: 5,
 *   hasNextPage: true,
 *   hasPreviousPage: false,
 * });
 */
export function paginated<T>(
  c: Context,
  items: T[],
  pagination: PaginationMeta,
): ReturnType<typeof c.json<SuccessEnvelope<PaginatedData<T>>, 200>> {
  const data: PaginatedData<T> = { items, pagination };
  return ok(c, data);
}
