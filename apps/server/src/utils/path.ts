/**
 * Path Utilities
 *
 * Pure utility functions for path manipulation.
 * NO DEPENDENCIES on @/config or @/env - must remain pure.
 *
 * @module utils/path
 */

/**
 * Join path segments into a single normalized path
 *
 * @param parts - Path segments to join
 * @returns Normalized path string with leading slash
 *
 * @example
 * joinPath("/rest/v1", "/health")  // "/rest/v1/health"
 * joinPath("", "/health")          // "/health"
 * joinPath("/api", "users", "123") // "/api/users/123"
 */
export function joinPath(...parts: string[]) {
  return parts
    .filter(Boolean)
    .join("/")
    .replace(/\/{2,}/g, "/") // Remove duplicate slashes
    .replace(/\/+$/, "") // Remove trailing slash
    .replace(/^([^/])/, "/$1"); // Ensure leading slash
};

/**
 * Build API path from prefix and endpoint
 *
 * @param prefix - API prefix (e.g., "/rest/v1") - passed from config
 * @param endpoint - Endpoint path (e.g., "/health")
 * @returns Complete API path
 *
 * @example
 * buildApiPath("/rest/v1", "/health")  // "/rest/v1/health"
 * buildApiPath("", "/health")          // "/health"
 * buildApiPath("/api", "users")      // "/api/users"
 */
export function buildApiPath(prefix: string, endpoint: string) {
  return joinPath(prefix, endpoint);
};

/**
 * Normalize a path by removing duplicate slashes and ensuring leading slash
 *
 * @param path - Path to normalize
 * @returns Normalized path
 *
 * @example
 * normalizePath("//api//users//") // "/api/users"
 * normalizePath("api/users")      // "/api/users"
 */
export function normalizePath(path: string) {
  if (!path)
    return "/";

  return path
    .replace(/\/{2,}/g, "/") // Remove duplicate slashes
    .replace(/\/+$/, "") // Remove trailing slash
    .replace(/^([^/])/, "/$1") // Ensure leading slash
    || "/";
};

/**
 * Check if path starts with given prefix
 *
 * @param path - Path to check
 * @param prefix - Prefix to match
 * @returns True if path starts with prefix
 *
 * @example
 * pathStartsWith("/api/users", "/api")  // true
 * pathStartsWith("/health", "/api")     // false
 */
export function pathStartsWith(path: string, prefix: string) {
  const normalizedPath = normalizePath(path);
  const normalizedPrefix = normalizePath(prefix);

  return normalizedPath.startsWith(normalizedPrefix);
};
