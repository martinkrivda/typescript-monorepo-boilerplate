/**
 * HTTP Status Codes - Local implementation (RFC 9110 compliant)
 *
 * Replaces stoker/http-status-codes to avoid undefined constant issues.
 * Names follow RFC 9110 / MDN conventions.
 *
 * @see https://www.rfc-editor.org/rfc/rfc9110.html#section-15
 * @see https://developer.mozilla.org/en-US/docs/Web/HTTP/Status
 * @module lib/http-status
 */

// =================================================================
// HTTP STATUS CODES (as const for literal types)
// =================================================================

export const HTTP_STATUS = {
  // 2xx Success
  OK: 200,
  CREATED: 201,
  NO_CONTENT: 204,

  // 3xx Redirection
  FOUND: 302,

  // 4xx Client Errors
  BAD_REQUEST: 400,
  UNAUTHORIZED: 401,
  FORBIDDEN: 403,
  NOT_FOUND: 404,
  METHOD_NOT_ALLOWED: 405,
  CONFLICT: 409,
  CONTENT_TOO_LARGE: 413, // RFC 9110 name (formerly "Payload Too Large")
  UNSUPPORTED_MEDIA_TYPE: 415,
  UNPROCESSABLE_CONTENT: 422, // RFC 9110 name (formerly "Unprocessable Entity")
  TOO_MANY_REQUESTS: 429,

  // 5xx Server Errors
  INTERNAL_SERVER_ERROR: 500,
  BAD_GATEWAY: 502,
  SERVICE_UNAVAILABLE: 503,
  GATEWAY_TIMEOUT: 504,
} as const;

// =================================================================
// TYPE EXPORTS (derived from HTTP_STATUS)
// =================================================================

/** Union of all status codes defined in HTTP_STATUS */
export type HttpStatusCode = (typeof HTTP_STATUS)[keyof typeof HTTP_STATUS];

// =================================================================
// HTTP STATUS PHRASES (type-safe mapping from HTTP_STATUS)
// =================================================================
// IMPORTANT: This record is typed to require a phrase for EVERY code in HTTP_STATUS.
// Adding a new status code without a phrase will cause a compile-time error.

export const HTTP_PHRASES = {
  [HTTP_STATUS.OK]: "OK",
  [HTTP_STATUS.CREATED]: "Created",
  [HTTP_STATUS.NO_CONTENT]: "No Content",

  [HTTP_STATUS.FOUND]: "Found",

  [HTTP_STATUS.BAD_REQUEST]: "Bad Request",
  [HTTP_STATUS.UNAUTHORIZED]: "Unauthorized",
  [HTTP_STATUS.FORBIDDEN]: "Forbidden",
  [HTTP_STATUS.NOT_FOUND]: "Not Found",
  [HTTP_STATUS.METHOD_NOT_ALLOWED]: "Method Not Allowed",
  [HTTP_STATUS.CONFLICT]: "Conflict",
  [HTTP_STATUS.CONTENT_TOO_LARGE]: "Content Too Large",
  [HTTP_STATUS.UNSUPPORTED_MEDIA_TYPE]: "Unsupported Media Type",
  [HTTP_STATUS.UNPROCESSABLE_CONTENT]: "Unprocessable Content",
  [HTTP_STATUS.TOO_MANY_REQUESTS]: "Too Many Requests",

  [HTTP_STATUS.INTERNAL_SERVER_ERROR]: "Internal Server Error",
  [HTTP_STATUS.BAD_GATEWAY]: "Bad Gateway",
  [HTTP_STATUS.SERVICE_UNAVAILABLE]: "Service Unavailable",
  [HTTP_STATUS.GATEWAY_TIMEOUT]: "Gateway Timeout",
} as const satisfies Record<HttpStatusCode, string>;

/** Type-safe phrase lookup - guaranteed to return string, never undefined */
export type HttpStatusPhrase = (typeof HTTP_PHRASES)[HttpStatusCode];

// =================================================================
// ASSERTION HELPERS
// =================================================================

/**
 * Asserts that a value is a valid HTTP status code.
 * Throws if the code is not a number between 100-599.
 *
 * Use this in response helpers to catch "undefined" status bugs at runtime.
 *
 * @throws Error if code is invalid
 */
export function assertHttpStatus(code: unknown) {
  if (typeof code !== "number" || !Number.isInteger(code) || code < 100 || code > 599) {
    throw new Error(`Invalid HTTP status code: ${String(code)}`);
  }
};

/**
 * Checks if a status code indicates success (2xx)
 */
export function isSuccessStatus(code: number) {
  return code >= 200 && code < 300;
};

/**
 * Checks if a status code indicates client error (4xx)
 */
export function isClientError(code: number) {
  return code >= 400 && code < 500;
};

/**
 * Checks if a status code indicates server error (5xx)
 */
export function isServerError(code: number) {
  return code >= 500 && code < 600;
};

// =================================================================
// BACKWARD COMPATIBILITY ALIASES
// =================================================================
// These match stoker/http-status-codes naming for easier migration

/** @deprecated Use HTTP_STATUS.CONTENT_TOO_LARGE (413) */
export const REQUEST_TOO_LONG = HTTP_STATUS.CONTENT_TOO_LARGE;

/** @deprecated Use HTTP_STATUS.UNPROCESSABLE_CONTENT (422) */
export const UNPROCESSABLE_ENTITY = HTTP_STATUS.UNPROCESSABLE_CONTENT;

/** @deprecated Use HTTP_STATUS.FOUND (302) */
export const MOVED_TEMPORARILY = HTTP_STATUS.FOUND;
