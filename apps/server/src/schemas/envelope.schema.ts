/**
 * Envelope Response Schemas - OpenAPI Documentation
 *
 * Zod schemas for RFC 9457 envelope pattern responses.
 * Used to generate accurate OpenAPI documentation.
 *
 * @module schemas/envelope.schema
 */

import { z } from "@hono/zod-openapi";

// =================================================================
// RESPONSE META SCHEMA
// =================================================================

/**
 * Response metadata schema - included in every envelope response
 */
export const responseMetaSchema = z.object({
  requestId: z.string().openapi({
    description: "Unique request identifier for correlation",
    example: "req_1234567890",
  }),
  timestamp: z.string().datetime().openapi({
    description: "ISO 8601 timestamp of response generation",
    example: "2025-01-15T10:30:00.000Z",
  }),
  traceId: z.string().optional().openapi({
    description: "W3C Trace Context trace-id (if traceparent header present)",
    example: "0af7651916cd43dd8448eb211c80319c",
  }),
  spanId: z.string().optional().openapi({
    description: "W3C Trace Context span-id (if traceparent header present)",
    example: "b7ad6b7169203331",
  }),
}).openapi("ResponseMeta");

// =================================================================
// FIELD ERROR SCHEMA (RFC 9457 Extension)
// =================================================================

/**
 * Field-level validation error schema
 *
 * Contract:
 * - `code`: Stable E-code for clients (E1001, E3002, etc.)
 * - `reason`: Zod issue code for debug/telemetry (optional)
 */
export const fieldErrorSchema = z.object({
  field: z.string().optional().openapi({
    description: "Dot-path to the field (e.g., 'user.email')",
    example: "email",
  }),
  pointer: z.string().optional().openapi({
    description: "JSON Pointer in URI fragment form per RFC 6901. Tokens are escaped (~→~0, /→~1) and may be percent-encoded for special characters (space, %, #, etc.)",
    example: "#/filedata",
    format: "uri-reference",
    pattern: "^#(/|$)",
  }),
  message: z.string().openapi({
    description: "Human-readable error message",
    example: "Invalid email format",
  }),
  code: z.string().optional().openapi({
    description: "Stable E-code for client consumption (E1001, E3002, E3001, etc.)",
    example: "E1001",
  }),
  reason: z.string().optional().openapi({
    description: "Zod issue code for debug/telemetry (internal use only)",
    example: "custom",
  }),
}).openapi("FieldError");

// =================================================================
// PROBLEM DETAILS SCHEMA (RFC 9457)
// =================================================================

/**
 * RFC 9457 Problem Details schema
 */
export const problemDetailsSchema = z.object({
  type: z.string().openapi({
    description: "URI reference identifying the problem type (may be relative per RFC 9457)",
    example: "/problems/not-found",
    format: "uri-reference",
  }),
  title: z.string().openapi({
    description: "Short, human-readable summary (should not change between occurrences)",
    example: "Not found",
  }),
  status: z.number().openapi({
    description: "HTTP status code (must match actual HTTP response status)",
    example: 404,
  }),
  detail: z.string().openapi({
    description: "Human-readable explanation specific to this occurrence",
    example: "Route was not found",
  }),
  instance: z.string().openapi({
    description: "URI reference identifying the specific occurrence (typically the request path)",
    example: "/missing",
    format: "uri-reference",
  }),
  code: z.string().openapi({
    description: "Stable E-code for client consumption (E#### pattern)",
    example: "E1404",
  }),
  errors: z.array(fieldErrorSchema).optional().openapi({
    description: "Field-level validation errors (present for 422 responses)",
  }),
}).openapi("ProblemDetails");

// =================================================================
// ENVELOPE SCHEMA FACTORIES
// =================================================================

/**
 * Creates a success envelope schema for OpenAPI documentation
 *
 * @param dataSchema - Zod schema for the response data
 * @param name - OpenAPI component name
 *
 * @example
 * const loginEnvelope = createSuccessEnvelopeSchema(loginPayloadSchema, "LoginSuccessEnvelope");
 */
export function createSuccessEnvelopeSchema<T extends z.ZodType>(
  dataSchema: T,
  name: string,
) {
  return z.object({
    success: z.literal(true).openapi({
      description: "Success flag (true for successful responses)",
    }),
    data: dataSchema,
    error: z.null().openapi({
      description: "Error object (null for successful responses)",
    }),
    meta: responseMetaSchema,
  }).openapi(name);
}

/**
 * Creates an error envelope schema for OpenAPI documentation
 *
 * @param name - OpenAPI component name
 *
 * @example
 * const authErrorEnvelope = createErrorEnvelopeSchema("AuthErrorEnvelope");
 */
export function createErrorEnvelopeSchema(name: string) {
  return z.object({
    success: z.literal(false).openapi({
      description: "Success flag (false for error responses)",
    }),
    data: z.null().openapi({
      description: "Data object (null for error responses)",
    }),
    error: problemDetailsSchema,
    meta: responseMetaSchema,
  }).openapi(name);
};

// =================================================================
// PRE-BUILT ERROR ENVELOPE SCHEMAS
// =================================================================

/**
 * 401 Unauthorized envelope schema
 */
export const unauthorizedEnvelopeSchema = createErrorEnvelopeSchema("UnauthorizedEnvelope");

/**
 * 403 Forbidden envelope schema
 */
export const forbiddenEnvelopeSchema = createErrorEnvelopeSchema("ForbiddenEnvelope");

/**
 * 404 Not Found envelope schema
 */
export const notFoundEnvelopeSchema = createErrorEnvelopeSchema("NotFoundEnvelope");

/**
 * 409 Conflict envelope schema
 */
export const conflictEnvelopeSchema = createErrorEnvelopeSchema("ConflictEnvelope");

/**
 * 422 Validation Error envelope schema
 */
export const validationErrorEnvelopeSchema = createErrorEnvelopeSchema("ValidationErrorEnvelope");

/**
 * 500 Internal Server Error envelope schema
 */
export const internalErrorEnvelopeSchema = createErrorEnvelopeSchema("InternalErrorEnvelope");

/**
 * 502 Bad Gateway envelope schema
 * Used when upstream SOAP service returns invalid response
 */
export const badGatewayEnvelopeSchema = createErrorEnvelopeSchema("BadGatewayEnvelope");

/**
 * 504 Gateway Timeout envelope schema
 * Used when upstream SOAP service times out
 */
export const gatewayTimeoutEnvelopeSchema = createErrorEnvelopeSchema("GatewayTimeoutEnvelope");

// =================================================================
// TYPE EXPORTS
// =================================================================

export type ResponseMeta = z.infer<typeof responseMetaSchema>;
export type FieldError = z.infer<typeof fieldErrorSchema>;
export type ProblemDetails = z.infer<typeof problemDetailsSchema>;
