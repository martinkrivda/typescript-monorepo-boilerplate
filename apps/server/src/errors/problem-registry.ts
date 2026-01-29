/**
 * Problem Registry - Single Source of Truth for Error Definitions
 *
 * Central registry mapping error types to RFC 9457 Problem Details.
 * This is the authoritative source for all error metadata.
 *
 * @see https://www.rfc-editor.org/rfc/rfc9457.html
 * @module errors/problem-registry
 */

import { env } from "@/config";

// =================================================================
// TYPE DEFINITIONS
// =================================================================

/**
 * Problem type keys - used for programmatic error handling
 */
export type ProblemKey
  = | "validation_error"
    | "not_found"
    | "unauthorized"
    | "forbidden"
    | "conflict"
    | "bad_request"
    | "payload_too_large"
    | "rate_limited"
    | "bad_gateway"
    | "gateway_timeout"
    | "internal_error"
    | "service_unavailable";

/**
 * Log levels for error severity
 */
export type LogLevel = "debug" | "info" | "warn" | "error";

/**
 * Problem definition - immutable configuration for each error type
 */
export interface ProblemDef {
  /** Unique key for this problem type */
  readonly key: ProblemKey;
  /** URI suffix: /problems/{suffix} */
  readonly suffix: string;
  /** RFC 9457 title - short, unchanging description */
  readonly title: string;
  /** HTTP status code */
  readonly status: number;
  /** Internal error code (E#### pattern) */
  readonly code: string;
  /** Domain label for logs and metrics */
  readonly errorType: string;
  /** Logging severity level */
  readonly logLevel: LogLevel;
  /** Whether to expose detail in production (sanitization) */
  readonly exposeDetail: boolean;
}

// =================================================================
// PROBLEM BASE URL CONFIGURATION
// =================================================================

/**
 * Base URL for problem type URIs
 * Configurable via API_BASE_URL environment variable
 */
function getProblemBaseUrl() {
  // Use API_BASE_URL if configured, otherwise default
  const baseUrl = env.API_BASE_URL;
  return baseUrl ? `${baseUrl}/problems` : "https://api.template.local/problems";
};

// =================================================================
// PROBLEM REGISTRY
// =================================================================

/**
 * Central Problem Registry
 *
 * Single source of truth for:
 * - Problem type URIs
 * - HTTP status codes
 * - Internal error codes (E####)
 * - Log levels
 * - Detail exposure policy
 */
export const ProblemRegistry = Object.freeze({
  validation_error: {
    key: "validation_error",
    suffix: "validation-error",
    title: "Validation failed",
    status: 422,
    code: "E1001",
    errorType: "validation_error",
    logLevel: "info",
    exposeDetail: true,
  },
  not_found: {
    key: "not_found",
    suffix: "not-found",
    title: "Not found",
    status: 404,
    code: "E1404",
    errorType: "not_found",
    logLevel: "info",
    exposeDetail: true,
  },
  unauthorized: {
    key: "unauthorized",
    suffix: "unauthorized",
    title: "Unauthorized",
    status: 401,
    code: "E1401",
    errorType: "unauthorized",
    logLevel: "info",
    exposeDetail: true,
  },
  forbidden: {
    key: "forbidden",
    suffix: "forbidden",
    title: "Forbidden",
    status: 403,
    code: "E1403",
    errorType: "forbidden",
    logLevel: "info",
    exposeDetail: true,
  },
  conflict: {
    key: "conflict",
    suffix: "conflict",
    title: "Conflict",
    status: 409,
    code: "E1409",
    errorType: "conflict",
    logLevel: "info",
    exposeDetail: true,
  },
  bad_request: {
    key: "bad_request",
    suffix: "bad-request",
    title: "Bad request",
    status: 400,
    code: "E1400",
    errorType: "bad_request",
    logLevel: "info",
    exposeDetail: true,
  },
  payload_too_large: {
    key: "payload_too_large",
    suffix: "payload-too-large",
    title: "Payload too large",
    status: 413,
    code: "E1413",
    errorType: "payload_too_large",
    logLevel: "warn",
    exposeDetail: true,
  },
  rate_limited: {
    key: "rate_limited",
    suffix: "rate-limited",
    title: "Too many requests",
    status: 429,
    code: "E1429",
    errorType: "rate_limited",
    logLevel: "warn",
    exposeDetail: true,
  },
  bad_gateway: {
    key: "bad_gateway",
    suffix: "bad-gateway",
    title: "Bad gateway",
    status: 502,
    code: "E1502",
    errorType: "bad_gateway",
    logLevel: "error",
    exposeDetail: true,
  },
  gateway_timeout: {
    key: "gateway_timeout",
    suffix: "gateway-timeout",
    title: "Gateway timeout",
    status: 504,
    code: "E1504",
    errorType: "gateway_timeout",
    logLevel: "error",
    exposeDetail: true,
  },
  service_unavailable: {
    key: "service_unavailable",
    suffix: "service-unavailable",
    title: "Service unavailable",
    status: 503,
    code: "E1503",
    errorType: "service_unavailable",
    logLevel: "error",
    exposeDetail: false,
  },
  internal_error: {
    key: "internal_error",
    suffix: "internal-error",
    title: "Internal error",
    status: 500,
    code: "E1500",
    errorType: "internal_error",
    logLevel: "error",
    exposeDetail: false,
  },
} as const satisfies Record<ProblemKey, ProblemDef>);

// =================================================================
// HELPER FUNCTIONS
// =================================================================

/**
 * Generates full problem type URI for a given problem key
 *
 * @example
 * problemTypeUri("not_found") // "https://api.template.local/problems/not-found"
 */
export function problemTypeUri(key: ProblemKey) {
  return `${getProblemBaseUrl()}/${ProblemRegistry[key].suffix}`;
};

/**
 * Maps HTTP status code to problem key
 * Used for converting generic HTTP errors to typed problems
 */
export function statusToKey(status: number) {
  switch (status) {
    case 400: return "bad_request";
    case 401: return "unauthorized";
    case 403: return "forbidden";
    case 404: return "not_found";
    case 409: return "conflict";
    case 413: return "payload_too_large";
    case 422: return "validation_error";
    case 429: return "rate_limited";
    case 502: return "bad_gateway";
    case 503: return "service_unavailable";
    case 504: return "gateway_timeout";
    default: return "internal_error";
  }
};

/**
 * Gets problem definition by key
 */
export function getProblemDef(key: ProblemKey) {
  return ProblemRegistry[key];
};

/**
 * Gets problem definition by HTTP status code
 */
export function getProblemDefByStatus(status: number) {
  return ProblemRegistry[statusToKey(status)];
};
