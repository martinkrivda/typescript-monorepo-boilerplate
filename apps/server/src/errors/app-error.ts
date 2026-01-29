/**
 * AppError Class - Application Error with Builder Pattern
 *
 * Type-safe error class for throwing domain errors that map to
 * RFC 9457 Problem Details via the Problem Registry.
 *
 * @see ./problem-registry.ts for error type definitions
 * @module errors/app-error
 */

import type { ProblemKey } from "./problem-registry";

// =================================================================
// TYPE DEFINITIONS
// =================================================================

/**
 * Field-level validation error
 * Follows RFC 9457 extension pattern for validation details
 *
 * Contract:
 * - `code`: Stable E-code for clients (E1001, E3002, etc.) - ALWAYS present for validation errors
 * - `reason`: Zod issue code for debug/telemetry (optional, internal use only)
 */
export interface FieldError {
  /** Dot-path to the field (e.g., "user.email") */
  field?: string;
  /** JSON Pointer to the field in URI fragment form (e.g., "#/user/email") */
  pointer?: string;
  /** Human-readable error message */
  message: string;
  /** Stable E-code for client consumption (E1001, E3002, etc.) */
  code?: string;
  /** Zod issue code for debug/telemetry (too_big, custom, invalid_string, etc.) */
  reason?: string;
}

/**
 * Options for AppError construction
 */
export interface AppErrorOptions {
  /** Detailed error description */
  detail?: string;
  /** Field-level validation errors */
  errors?: FieldError[];
  /** Original error that caused this error */
  cause?: unknown;
  /** Override the default HTTP status from registry */
  statusOverride?: number;
  /** Override the default error code from registry */
  codeOverride?: string;
}

// =================================================================
// APP ERROR CLASS
// =================================================================

/**
 * Application Error Class
 *
 * Use static factory methods for common error types:
 * - AppError.validation() - 422 Validation errors
 * - AppError.notFound() - 404 Resource not found
 * - AppError.unauthorized() - 401 Authentication required
 * - AppError.forbidden() - 403 Access denied
 * - AppError.conflict() - 409 Resource conflict
 * - AppError.badRequest() - 400 Invalid request
 * - AppError.internal() - 500 Internal error
 * - AppError.serviceUnavailable() - 503 Service unavailable
 *
 * @example
 * // Validation error with field details
 * throw AppError.validation("Invalid input", [
 *   { field: "email", message: "Invalid format" }
 * ]);
 *
 * @example
 * // Not found with identifier
 * throw AppError.notFound("User", "123");
 */
export class AppError extends Error {
  /** Problem registry key */
  public readonly key: ProblemKey;
  /** Detailed error description */
  public readonly detail?: string;
  /** Field-level validation errors */
  public readonly errors: FieldError[];
  /** Override HTTP status code */
  public readonly statusOverride?: number;
  /** Override error code */
  public readonly codeOverride?: string;

  constructor(key: ProblemKey, message: string, opts: AppErrorOptions = {}) {
    super(message);
    this.name = "AppError";
    this.key = key;
    this.detail = opts.detail;
    this.errors = opts.errors ?? [];
    this.statusOverride = opts.statusOverride;
    this.codeOverride = opts.codeOverride;

    // ES2022 cause support
    if (opts.cause) {
      (this as unknown as { cause: unknown }).cause = opts.cause;
    }

    // Maintains proper stack trace for where error was thrown
    if (Error.captureStackTrace) {
      Error.captureStackTrace(this, AppError);
    }
  }

  // =================================================================
  // STATIC FACTORY METHODS (Builder Pattern)
  // =================================================================

  /**
   * Creates a validation error (422)
   *
   * @example
   * throw AppError.validation("Invalid data", [
   *   { field: "email", message: "Invalid email format" },
   *   { field: "password", message: "Must be at least 8 characters" }
   * ]);
   */
  static validation(detail: string, errors: FieldError[]): AppError {
    return new AppError("validation_error", "Validation failed", { detail, errors });
  }

  /**
   * Creates a not found error (404)
   *
   * @example
   * throw AppError.notFound("User", "123");
   * throw AppError.notFound("Route");
   */
  static notFound(resource: string, identifier?: string): AppError {
    const detail = identifier
      ? `${resource} with identifier '${identifier}' was not found`
      : `${resource} was not found`;
    return new AppError("not_found", "Resource not found", { detail });
  }

  /**
   * Creates an unauthorized error (401)
   *
   * @example
   * throw AppError.unauthorized("Token expired");
   */
  static unauthorized(detail = "Authentication required"): AppError {
    return new AppError("unauthorized", "Unauthorized", { detail });
  }

  /**
   * Creates a forbidden error (403)
   *
   * @example
   * throw AppError.forbidden("Insufficient permissions");
   */
  static forbidden(detail = "Access denied"): AppError {
    return new AppError("forbidden", "Forbidden", { detail });
  }

  /**
   * Creates a conflict error (409)
   *
   * @example
   * throw AppError.conflict("Email already exists");
   */
  static conflict(detail: string): AppError {
    return new AppError("conflict", "Conflict", { detail });
  }

  /**
   * Creates a bad request error (400)
   *
   * @example
   * throw AppError.badRequest("Invalid JSON body");
   */
  static badRequest(detail: string): AppError {
    return new AppError("bad_request", "Bad request", { detail });
  }

  /**
   * Creates an internal error (500)
   *
   * @example
   * throw AppError.internal("Database connection failed", originalError);
   */
  static internal(detail: string, cause?: unknown): AppError {
    return new AppError("internal_error", "Internal error", { detail, cause });
  }

  /**
   * Creates a service unavailable error (503)
   *
   * @example
   * throw AppError.serviceUnavailable("Database");
   */
  static serviceUnavailable(service: string): AppError {
    return new AppError("service_unavailable", "Service unavailable", {
      detail: `Service '${service}' is currently unavailable`,
    });
  }

  /**
   * Creates a rate limited error (429)
   *
   * @example
   * throw AppError.rateLimited("Too many requests, retry after 60 seconds");
   */
  static rateLimited(detail = "Too many requests"): AppError {
    return new AppError("rate_limited", "Too many requests", { detail });
  }

  // =================================================================
  // DOMAIN-SPECIFIC FACTORY METHODS
  // =================================================================

  /**
   * Creates an invalid credentials error (401) with custom code
   */
  static invalidCredentials(): AppError {
    return new AppError("unauthorized", "Invalid credentials", {
      detail: "The provided credentials are invalid",
      codeOverride: "E2001",
    });
  }

  /**
   * Creates a token expired error (401) with custom code
   */
  static tokenExpired(): AppError {
    return new AppError("unauthorized", "Token expired", {
      detail: "The access token has expired",
      codeOverride: "E2002",
    });
  }

  /**
   * Creates a company not found error (404) with custom code
   */
  static companyNotFound(identifier: string): AppError {
    return new AppError("not_found", "Company not found", {
      detail: `Company with identifier '${identifier}' was not found`,
      codeOverride: "E4001",
    });
  }

  /**
   * Creates an environment not found error (404) with custom code
   */
  static environmentNotFound(identifier: string): AppError {
    return new AppError("not_found", "Environment not found", {
      detail: `Environment with identifier '${identifier}' was not found`,
      codeOverride: "E4002",
    });
  }
}
