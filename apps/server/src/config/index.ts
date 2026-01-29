/**
 * Configuration Module Barrel Export
 *
 * Centralized exports for all configuration modules.
 * env is the ONLY default export (singleton pattern).
 * All other exports are named exports.
 *
 * @module config
 */

// API configuration
export { API_CONFIG, API_PREFIX, getRateLimitConfig } from "./api";

// Database configuration
export { DB_CONFIG, getPoolConfig, getTimeoutConfig } from "./database";

// Environment configuration (ONLY default export)
export { default as env, type Env } from "./env";

// Logging configuration
export {
  getLogLevel,
  getLogRotationConfig,
  isAccessLogEnabled,
  isAppLogEnabled,
  isRotationEnabled,
  LOG_DIR,
  LOG_LEVELS,
  type LogLevel,
  type LogRotationConfig,
} from "./logging";

// OpenAPI configuration
export { configureOpenAPI, OPENAPI_CONFIG } from "./openapi";

// Security configuration
export { buildCSPDirectives, CSP_CONFIG, ENV_CONFIG, isCSPEnabled } from "./security";
