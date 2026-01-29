/**
 * HTTP Constants
 *
 * Provides HTTP-related schemas and constants.
 * Local implementation replacing stoker dependencies.
 *
 * @module constants/http
 */

import { z } from "@hono/zod-openapi";

import { HTTP_PHRASES, HTTP_STATUS } from "@/lib/http-status";

/**
 * Creates a simple message object schema for OpenAPI responses
 */
function createMessageObjectSchema(message: string) {
  return z.object({
    message: z.string().default(message).openapi({
      example: message,
    }),
  });
};

/**
 * Schema for 404 Not Found response message
 */
export const notFoundSchema = createMessageObjectSchema(HTTP_PHRASES[HTTP_STATUS.NOT_FOUND]);
