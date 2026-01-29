/**
 * Application Constants
 *
 * Static configuration constants that don't depend on environment.
 * Security-related config (CSP, ENV_CONFIG) is in @/config/security.
 *
 * @module constants/app
 */

// =================================================================
// API CONFIGURATION
// =================================================================

export const API_CONFIG = {
  // Default pagination limits
  PAGINATION: {
    DEFAULT_LIMIT: 10,
    MAX_LIMIT: 100,
    DEFAULT_PAGE: 1,
  },

  // Cache configuration
  CACHE: {
    DEFAULT_TTL: 300, // 5 minutes
    HEALTH_CHECK_TTL: 30, // 30 seconds
  },

  // Rate limiting
  RATE_LIMITS: {
    WINDOW_MS: 15 * 60 * 1000, // 15 minutes
    MAX_REQUESTS: 100,
  },
} as const;

// =================================================================
// DATABASE CONFIGURATION
// =================================================================

export const DB_CONFIG = {
  // Connection timeouts
  TIMEOUTS: {
    CONNECTION: 30000, // 30 seconds
    COMMAND: 30000, // 30 seconds
    POOL: 20000, // 20 seconds
  },

  // Pool settings
  POOL: {
    MIN_CONNECTIONS: 2,
    MAX_CONNECTIONS: 10,
  },
} as const;
