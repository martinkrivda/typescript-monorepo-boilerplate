import { z } from "@hono/zod-openapi";

// =================================================================
// UTILITY SCHEMAS FOR ROUTE PARAMETERS
// =================================================================

// UUID parameter validation
export const uuidParamSchema = z.object({
  id: z.guid().openapi({
    description: "Unique identifier (8-4-4-4-12 hex format)",
    example: "550e8400-e29b-41d4-a716-446655440000",
    param: {
      name: "id",
      in: "path",
    },
  }),
}).openapi("UUIDParam");

// Integer ID parameter validation
export const intIdParamSchema = z.object({
  id: z.string().openapi({
    description: "Positive integer identifier",
    example: "123",
    param: {
      name: "id",
      in: "path",
    },
  }),
}).openapi("IntIdParam");

// Environment ID parameter validation
export const environmentIdParamSchema = z.object({
  environmentId: z.string()
    .length(8, "Environment ID must be exactly 8 characters")
    .openapi({
      description: "Environment identifier (exactly 8 characters)",
      example: "ENV00001",
      param: {
        name: "environmentId",
        in: "path",
      },
    }),
}).openapi("EnvironmentIdParam");

// =================================================================
// QUERY PARAMETER SCHEMAS
// =================================================================

export const paginationQuerySchema = z.object({
  page: z.string()
    .optional()
    .openapi({
      description: "Page number for pagination (default: 1)",
      example: "1",
    }),
  limit: z.string()
    .optional()
    .openapi({
      description: "Number of items per page (default: 10, max: 100)",
      example: "10",
    }),
}).openapi("PaginationQuery");

// =================================================================
// RESPONSE SCHEMAS
// =================================================================

export function paginatedResponseSchema<T extends z.ZodType>(itemSchema: T) {
  return z.object({
    data: z.array(itemSchema).openapi({
      description: "Array of items",
    }),
    pagination: z.object({
      page: z.number().openapi({
        description: "Current page number",
        example: 1,
      }),
      limit: z.number().openapi({
        description: "Items per page",
        example: 10,
      }),
      total: z.number().openapi({
        description: "Total number of items",
        example: 100,
      }),
      totalPages: z.number().openapi({
        description: "Total number of pages",
        example: 10,
      }),
    }).openapi({
      description: "Pagination metadata",
    }),
  });
}

export const errorResponseSchema = z.object({
  message: z.string().openapi({
    description: "Error message",
    example: "An error occurred",
  }),
  error: z.string().optional().openapi({
    description: "Error type or code",
    example: "BAD_REQUEST",
  }),
  code: z.string().optional().openapi({
    description: "Application-specific error code",
    example: "ERR_001",
  }),
}).openapi("ErrorResponse");

/**
 * Standard error response schema - matches error(message, statusCode)
 * Shared across all modules for consistent error responses
 */
export const standardErrorResponseSchema = z.object({
  message: z.string().openapi({
    description: "Error message",
    example: "Internal server error",
  }),
  code: z.number().openapi({
    description: "HTTP status code",
    example: 500,
  }),
  error: z.literal(true).openapi({
    description: "Error flag (true for errors)",
  }),
}).openapi("StandardErrorResponse");

// =================================================================
// TYPE EXPORTS
// =================================================================

export type PaginationQuery = z.infer<typeof paginationQuerySchema>;
export type ErrorResponse = z.infer<typeof errorResponseSchema>;
export type StandardErrorResponse = z.infer<typeof standardErrorResponseSchema>;

// =================================================================
// HELPER FUNCTIONS
// =================================================================

/**
 * Creates pagination info object
 */
export function createPaginationInfo(
  page: number,
  limit: number,
  total: number,
) {
  return {
    page,
    limit,
    total,
    totalPages: Math.ceil(total / limit),
  };
}

/**
 * Creates a paginated response
 */
export function createPaginatedResponse<T>(
  data: T[],
  page: number,
  limit: number,
  total: number,
) {
  return {
    data,
    pagination: createPaginationInfo(page, limit, total),
  };
}
