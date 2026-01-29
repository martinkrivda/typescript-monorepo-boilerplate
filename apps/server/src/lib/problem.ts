/**
 * Problem Details Builder - RFC 9457 Implementation
 *
 * Converts various error types to RFC 9457 Problem Details format.
 * Used by error handlers to generate consistent error responses.
 *
 * @see https://www.rfc-editor.org/rfc/rfc9457.html
 * @module lib/problem
 */

import type { Context } from "hono";

import { HTTPException } from "hono/http-exception";
import { ZodError } from "zod";

import type { FieldError, LogLevel, ProblemKey } from "@/errors";

import { env } from "@/config";
import {
  AppError,

  ProblemRegistry,
  problemTypeUri,
  statusToKey,
} from "@/errors";

import { toJsonPointerFragment } from "./json-pointer";

// =================================================================
// TYPE DEFINITIONS
// =================================================================

/**
 * RFC 9457 Problem Details with extensions
 *
 * Supports standard RFC 9457 members plus arbitrary extension members.
 * Extension members are allowed per RFC 9457 Section 3.2.
 *
 * @see https://www.rfc-editor.org/rfc/rfc9457.html#section-3.2
 */
export interface ProblemDetails {
  /** URI reference identifying the problem type */
  type: string;
  /** Short, human-readable summary (should not change between occurrences) */
  title: string;
  /** HTTP status code */
  status: number;
  /** Human-readable explanation specific to this occurrence */
  detail: string;
  /** URI reference identifying the specific occurrence */
  instance: string;
  /** Internal error code (E#### pattern) - extension member */
  code: string;
  /** Field-level validation errors - extension member */
  errors: FieldError[];
  /** RFC 9457 allows additional extension members */
  [key: string]: unknown;
}

/**
 * Result of converting an error to Problem Details
 */
export interface ProblemResult {
  /** The Problem Details object */
  problem: ProblemDetails;
  /** HTTP status code to return */
  httpStatus: number;
  /** Problem registry key */
  key: ProblemKey;
  /** Log level for this error */
  logLevel: LogLevel;
  /** Error type for metrics/logging */
  errorType: string;
}

// =================================================================
// HELPER FUNCTIONS
// =================================================================

/**
 * Checks if running in production mode
 */
function isProd() {
  return env.NODE_ENV === "production";
}

/**
 * Sanitizes error detail based on exposure policy
 *
 * In production, sensitive errors return generic message.
 */
function safeDetail(def: { exposeDetail: boolean }, raw: string) {
  if (!isProd())
    return raw;
  return def.exposeDetail ? raw : "An unexpected error occurred";
}

/** Default E-code for generic validation errors */
const DEFAULT_VALIDATION_CODE = "E1001";

/**
 * Converts Zod validation issues to FieldError array
 *
 * This is a fallback for ZodErrors caught outside the validation hook.
 * Uses DEFAULT_VALIDATION_CODE (E1001) since we don't have domain context here.
 *
 * Contract:
 * - `code`: ALWAYS a stable E-code (E1001 default)
 * - `reason`: Zod issue.code for debug/telemetry
 * - `pointer`: RFC 6901 JSON Pointer in URI fragment form
 *
 * @example
 * const errors = zodToFieldErrors(zodError);
 * // [{ field: "email", pointer: "#/email", message: "Invalid email", code: "E1001", reason: "invalid_string" }]
 */
export function zodToFieldErrors(zerr: ZodError) {
  return zerr.issues.map((issue) => {
    return {
      field: issue.path.length ? issue.path.join(".") : undefined,
      pointer: toJsonPointerFragment(issue.path),
      message: issue.message,
      code: DEFAULT_VALIDATION_CODE, // Always E-code for clients
      reason: issue.code, // Zod code for debug
    };
  });
}

// =================================================================
// MAIN CONVERTER
// =================================================================

/**
 * Converts any error to RFC 9457 Problem Details
 *
 * Handles the following error types:
 * 1. AppError - canonical application errors
 * 2. ZodError - validation errors from zod
 * 3. HTTPException - Hono built-in HTTP errors
 * 4. Unknown - fallback to internal_error
 *
 * @param c - Hono context (for instance path)
 * @param err - Error to convert
 * @returns ProblemResult with all necessary information
 *
 * @example
 * const { problem, httpStatus, logLevel } = toProblemDetails(c, error);
 * return fail(c, problem, httpStatus);
 */
export function toProblemDetails(
  c: Context,
  err: unknown,
): ProblemResult {
  const instance = c.req.path;

  // =================================================================
  // 1. AppError - Canonical path (preferred)
  // =================================================================
  if (err instanceof AppError) {
    const def = ProblemRegistry[err.key];
    const status = err.statusOverride ?? def.status;
    const code = err.codeOverride ?? def.code;
    const detail = safeDetail(def, err.detail ?? err.message);

    return {
      key: err.key,
      httpStatus: status,
      logLevel: def.logLevel,
      errorType: def.errorType,
      problem: {
        type: problemTypeUri(err.key),
        title: def.title,
        status,
        detail,
        instance,
        code,
        errors: err.errors,
      },
    };
  }

  // =================================================================
  // 2. ZodError - Validation errors (outside zod-openapi hook)
  // =================================================================
  if (err instanceof ZodError) {
    const def = ProblemRegistry.validation_error;
    return {
      key: "validation_error",
      httpStatus: def.status,
      logLevel: def.logLevel,
      errorType: def.errorType,
      problem: {
        type: problemTypeUri("validation_error"),
        title: def.title,
        status: def.status,
        detail: safeDetail(def, "The request contains invalid data"),
        instance,
        code: def.code,
        errors: zodToFieldErrors(err),
      },
    };
  }

  // =================================================================
  // 3. HTTPException - Hono built-in errors
  // =================================================================
  if (err instanceof HTTPException) {
    const key = statusToKey(err.status);
    const def = ProblemRegistry[key];
    return {
      key,
      httpStatus: err.status,
      logLevel: def.logLevel,
      errorType: def.errorType,
      problem: {
        type: problemTypeUri(key),
        title: def.title,
        status: err.status,
        detail: safeDetail(def, err.message || def.title),
        instance,
        code: def.code,
        errors: [],
      },
    };
  }

  // =================================================================
  // 4. Unknown errors - Fallback to internal_error
  // =================================================================
  const def = ProblemRegistry.internal_error;
  const msg = err instanceof Error ? err.message : "Unknown error";

  return {
    key: "internal_error",
    httpStatus: def.status,
    logLevel: def.logLevel,
    errorType: def.errorType,
    problem: {
      type: problemTypeUri("internal_error"),
      title: def.title,
      status: def.status,
      detail: safeDetail(def, msg),
      instance,
      code: def.code,
      errors: [],
    },
  };
}

// =================================================================
// PROBLEM BUILDERS (for direct use without throwing)
// =================================================================

/**
 * Creates a Problem Details object directly (without throwing)
 *
 * Useful when you need to return an error response without throwing.
 *
 * @example
 * return fail(c, createProblem("not_found", c.req.path, "User not found"), 404);
 */
export function createProblem(
  key: ProblemKey,
  instance: string,
  detail: string,
  errors: FieldError[] = [],
  codeOverride?: string,
): ProblemDetails {
  const def = ProblemRegistry[key];
  return {
    type: problemTypeUri(key),
    title: def.title,
    status: def.status,
    detail: safeDetail(def, detail),
    instance,
    code: codeOverride ?? def.code,
    errors,
  };
}

/**
 * Creates a validation Problem Details with field errors
 *
 * @example
 * return fail(c, createValidationProblem(c.req.path, [
 *   { field: "email", message: "Invalid format" }
 * ]), 422);
 */
export function createValidationProblem(
  instance: string,
  errors: FieldError[],
  detail: string = "Validation failed",
): ProblemDetails {
  return createProblem("validation_error", instance, detail, errors);
}

/**
 * Creates a not found Problem Details
 *
 * @example
 * return fail(c, createNotFoundProblem(c.req.path, "User", "123"), 404);
 */
export function createNotFoundProblem(
  instance: string,
  resource: string,
  identifier?: string,
): ProblemDetails {
  const detail = identifier
    ? `${resource} with identifier '${identifier}' was not found`
    : `${resource} was not found`;
  return createProblem("not_found", instance, detail);
}
