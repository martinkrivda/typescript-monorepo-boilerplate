/**
 * API Configuration
 *
 * Contains API-related configuration constants including
 * the API prefix, pagination settings, and rate limits.
 *
 * @module config/api
 */
import env from "./env";

/**
 * API path prefix from environment or default
 * Used by utils/path.ts buildApiPath function
 */
export const API_PREFIX = env.BASE_PATH || "";

/**
 * API configuration constants
 */
export const API_CONFIG = {
  /** API path prefix */
  PREFIX: API_PREFIX,

  /** Pagination defaults */
  PAGINATION: {
    DEFAULT_LIMIT: 10,
    MAX_LIMIT: 100,
    DEFAULT_PAGE: 1,
  },

  /** Cache TTL settings (in seconds) */
  CACHE: {
    DEFAULT_TTL: 300, // 5 minutes
    HEALTH_CHECK_TTL: 30, // 30 seconds
  },

  /** Rate limiting configuration */
  RATE_LIMITS: {
    WINDOW_MS: env.RATE_LIMIT_WINDOW_MS,
    MAX_REQUESTS: env.RATE_LIMIT_MAX,
  },
} as const;

/**
 * Get rate limit configuration
 */
export function getRateLimitConfig() {
  return {
    windowMs: env.RATE_LIMIT_WINDOW_MS,
    limit: env.RATE_LIMIT_MAX,
  };
};
