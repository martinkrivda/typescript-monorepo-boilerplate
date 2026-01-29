/**
 * Validation Hook - Zod OpenAPI Validation Handler
 *
 * Custom validation hook for @hono/zod-openapi that transforms
 * validation errors into RFC 9457 Problem Details envelope.
 *
 * CRITICAL: This hook must be set on EVERY router created via createRouter().
 * The defaultHook from parent app does NOT propagate to child routers
 * mounted via .route() - this is confirmed Hono behavior.
 *
 * Contract for field errors:
 * - `code`: ALWAYS a stable E-code (E1001, E3001, E3002, etc.)
 * - `reason`: Zod issue.code for debug/telemetry (too_big, custom, etc.)
 *
 * E-code mapping uses MARKER-BASED approach:
 * - Validators add `params.ecode` to ctx.addIssue() calls
 * - This hook reads `params.ecode` and uses it directly
 * - Fallback to E1001 for issues without marker
 * - NO message-based detection (fragile, breaks with i18n/rewording)
 *
 * @see https://github.com/honojs/middleware/issues/708
 * @module lib/validation-hook
 */

import * as z from "zod";

import { AppError } from "@/errors";

import { toJsonPointerFragment } from "./json-pointer";
import { toProblemDetails } from "./problem";
import { fail } from "./response";

/** Default E-code for generic validation errors */
const DEFAULT_VALIDATION_CODE = "E1001";

/** Regex to validate E-code format (E followed by 4 digits) */
const ECODE_PATTERN = /^E\d{4}$/;

/**
 * Extracts E-code from Zod issue params (marker-based approach)
 *
 * Validators should add `params: { ecode: "E3001" }` to ctx.addIssue()
 * This function extracts and validates that marker.
 *
 * @param issue - Zod validation issue
 * @returns E-code from params, or undefined if not present/invalid
 */
function extractEcodeFromParams(issue: z.core.$ZodIssue) {
  // Zod custom issues can have params object
  const params = (issue as { params?: Record<string, unknown> }).params;
  if (!params || typeof params !== "object") {
    return undefined;
  }

  const ecode = params.ecode;
  if (typeof ecode === "string" && ECODE_PATTERN.test(ecode)) {
    return ecode;
  }

  return undefined;
}

/**
 * Maps a Zod issue to the appropriate E-code
 *
 * Priority:
 * 1. Use params.ecode marker (stable, explicit)
 * 2. Fallback to E1001 (generic validation error)
 *
 * IMPORTANT: NO message-based detection - that approach is fragile
 */
function mapToECode(issue: z.core.$ZodIssue) {
  // Priority 1: Use explicit marker from params
  const markerCode = extractEcodeFromParams(issue);
  if (markerCode) {
    return markerCode;
  }

  // Fallback: generic validation error
  return DEFAULT_VALIDATION_CODE;
}

/**
 * Converts Zod issues to FieldErrors with stable E-codes
 *
 * Contract:
 * - `code`: ALWAYS a stable E-code for client consumption
 * - `reason`: Zod issue.code for debug/telemetry
 * - `pointer`: RFC 6901 JSON Pointer in URI fragment form
 */
function zodToFieldErrorsWithDomainCodes(zerr: z.ZodError) {
  return zerr.issues.map((issue) => {
    return {
      field: issue.path.length ? issue.path.join(".") : undefined,
      pointer: toJsonPointerFragment(issue.path),
      message: issue.message,
      code: mapToECode(issue),
      reason: issue.code, // Zod code for debug (too_big, custom, invalid_string, etc.)
    };
  });
}

/**
 * Custom validation hook for @hono/zod-openapi
 *
 * Transforms Zod validation errors into RFC 9457 Problem Details
 * wrapped in the standard envelope format.
 *
 * IMPORTANT: Must be configured on every OpenAPIHono router instance,
 * not just the parent app. Use createRouter() to ensure this.
 *
 * @example
 * // In createRouter() factory
 * return new OpenAPIHono<AppBindings>({
 *   strict: false,
 *   defaultHook: validationHook,
 * });
 */

export function validationHook(result, c) {
  // If validation passed, continue to handler
  if (result.success) {
    return;
  }

  // Get issues from error
  const issues: z.core.$ZodIssue[] = result.error instanceof z.ZodError
    ? result.error.issues
    : (result.error as { issues?: z.core.$ZodIssue[] })?.issues ?? [];

  // Create ZodError for consistent handling
  const zerr = new z.ZodError(issues);

  // Use domain-aware field error mapping (e.g., base64 errors → E3002)
  const fieldErrors = zodToFieldErrorsWithDomainCodes(zerr);

  // Create AppError for consistent handling
  const appErr = AppError.validation(
    "The request contains invalid data",
    fieldErrors,
  );

  // Convert to Problem Details and return fail response
  const { problem } = toProblemDetails(c, appErr);
  return fail(c, problem, 422);
}
