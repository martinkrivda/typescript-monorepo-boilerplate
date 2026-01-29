/**
 * Database Configuration
 *
 * Contains database connection timeouts and pool settings.
 *
 * @module config/database
 */

/**
 * Database configuration constants
 */
export const DB_CONFIG = {
  // Connection timeouts (in milliseconds)
  TIMEOUTS: {
    CONNECTION: 30000, // 30 seconds
    COMMAND: 30000, // 30 seconds
    POOL: 20000, // 20 seconds
  },

  // Connection pool settings
  POOL: {
    MIN_CONNECTIONS: 2,
    MAX_CONNECTIONS: 10,
  },
} as const;

/**
 * Get database timeout configuration
 */
export function getTimeoutConfig() {
  return DB_CONFIG.TIMEOUTS;
};

/**
 * Get connection pool configuration
 */
export function getPoolConfig() {
  return DB_CONFIG.POOL;
};
