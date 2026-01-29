/**
 * OpenAPI Helpers - Local implementation
 *
 * Replaces stoker/openapi/helpers with local implementations.
 * Provides type-safe helpers for OpenAPI route definitions.
 *
 * @module lib/openapi/helpers
 */

import type { ZodSchema } from "zod";

// =================================================================
// CONTENT TYPE HELPERS
// =================================================================

/**
 * Creates JSON content specification for OpenAPI responses.
 *
 * @param schema - Zod schema for the response body
 * @param description - Optional description for the response
 * @returns OpenAPI content specification object
 *
 * @example
 * responses: {
 *   200: jsonContent(userSchema, "User details"),
 * }
 */
export function jsonContent<T extends ZodSchema>(
  schema: T,
  description: string = "",
) {
  return {
    content: {
      "application/json": {
        schema,
      },
    },
    description,
  } as const;
}

/**
 * Creates required JSON content specification for OpenAPI request bodies.
 *
 * @param schema - Zod schema for the request body
 * @param description - Optional description for the request body
 * @returns OpenAPI content specification object with required: true
 *
 * @example
 * request: {
 *   body: jsonContentRequired(createUserSchema, "User data"),
 * }
 */
export function jsonContentRequired<T extends ZodSchema>(
  schema: T,
  description: string = "",
) {
  return {
    content: {
      "application/json": {
        schema,
      },
    },
    description,
    required: true,
  } as const;
}

// =================================================================
// ADDITIONAL HELPERS (for future use)
// =================================================================

/**
 * Creates JSON content with multiple examples
 */
export function jsonContentWithExamples<T extends ZodSchema>(
  schema: T,
  examples: Record<string, { value: unknown; summary?: string }>,
  description: string = "",
) {
  return {
    content: {
      "application/json": {
        schema,
        examples,
      },
    },
    description,
  } as const;
}

/**
 * Creates empty response specification (for 204 No Content)
 */
export function emptyContent(description: string = "") {
  return {
    content: {},
    description,
  } as const;
}
