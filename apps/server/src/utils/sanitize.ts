/**
 * Sanitization Utilities
 *
 * Pure utility functions for sanitizing strings and URLs.
 * Implements OWASP Logging Cheat Sheet recommendations.
 * NO DEPENDENCIES on @/config or @/env - must remain pure.
 *
 * @see https://cheatsheetseries.owasp.org/cheatsheets/Logging_Cheat_Sheet.html
 * @module utils/sanitize
 */

/**
 * Sensitive query parameters that should be masked
 * These may contain tokens, passwords, or other secrets
 */
export const SENSITIVE_PARAMS = new Set([
  "token",
  "access_token",
  "refresh_token",
  "code",
  "password",
  "secret",
  "api_key",
  "apikey",
  "key",
  "auth",
  "credential",
  "session",
  "jwt",
  "bearer",
]);

/**
 * Sanitize string against log injection (OWASP)
 *
 * Escapes CR, LF, TAB and removes other control characters
 * that could be used to inject fake log entries or corrupt log parsing.
 *
 * @param str - String to sanitize
 * @returns Sanitized string with control characters escaped/removed
 *
 * @example
 * ```typescript
 * sanitizeLogString("user\r\nfake-log-entry")
 * // Returns: "user\\r\\nfake-log-entry"
 * ```
 */
export function sanitizeLogString(
  str: string | undefined | null,
): string | undefined {
  if (str == null) {
    return undefined;
  }
  if (typeof str !== "string") {
    return undefined;
  }

  return str
    // Escape characters that could inject new log lines
    .replace(/\r/g, "\\r")
    .replace(/\n/g, "\\n")
    .replace(/\t/g, "\\t")
    // Remove other control characters (NUL, BEL, etc.)

    .replace(/[\x00-\x08\v\f\x0E-\x1F\x7F]/g, "");
}

/**
 * Strip ANSI escape codes from string
 *
 * hono/logger may include color codes in development mode.
 * These must be removed before writing to JSON log files.
 *
 * @param str - String potentially containing ANSI codes
 * @returns Clean string without ANSI escape sequences
 */
export function stripAnsi(str: string) {
  return str.replace(/\x1B\[[0-9;]*[a-z]/gi, "");
};

/**
 * Sanitize URL path by masking sensitive query parameters
 *
 * Prevents accidental logging of tokens, passwords, and other
 * sensitive data that may appear in query strings.
 *
 * @param urlString - URL or path string to sanitize
 * @returns Sanitized path with sensitive params masked as [REDACTED]
 *
 * @example
 * ```typescript
 * sanitizePath("/api/auth?token=secret123&user=john")
 * // Returns: "/api/auth?token=[REDACTED]&user=john"
 * ```
 */
export function sanitizePath(urlString: string) {
  try {
    const url = new URL(urlString, "http://localhost");
    const params = new URLSearchParams(url.search);

    for (const key of params.keys()) {
      if (SENSITIVE_PARAMS.has(key.toLowerCase())) {
        params.set(key, "[REDACTED]");
      }
    }

    const sanitizedSearch = params.toString();
    const path = url.pathname + (sanitizedSearch ? `?${sanitizedSearch}` : "");
    return sanitizeLogString(path) || path;
  }
  catch {
    // If URL parsing fails, use regex fallback
    const sanitized = urlString.replace(
      /([?&](token|password|secret|code|api_key|key|auth|jwt|bearer)=)[^&]*/gi,
      "$1[REDACTED]",
    );
    return sanitizeLogString(sanitized) || sanitized;
  }
}

/**
 * Get client IP from X-Forwarded-For header
 *
 * Takes the first IP from the chain (closest to client).
 *
 * SECURITY NOTE: This limits proxy chain info but does NOT prevent spoofing.
 * For true anti-spoofing, configure your reverse proxy (nginx/ALB) to:
 * 1. Strip incoming X-Forwarded-For from untrusted sources
 * 2. Set X-Real-IP to the actual client IP
 *
 * @param xForwardedFor - X-Forwarded-For header value
 * @param xRealIp - X-Real-IP header value (fallback)
 * @returns Sanitized client IP or "unknown"
 */
export function extractClientIp(
  xForwardedFor: string | undefined,
  xRealIp: string | undefined,
): string {
  if (xForwardedFor) {
    // Take only the first IP (closest to client), ignore proxy chain
    const firstIp = xForwardedFor.split(",")[0].trim();
    return sanitizeLogString(firstIp) || "unknown";
  }

  return sanitizeLogString(xRealIp) || "unknown";
}
