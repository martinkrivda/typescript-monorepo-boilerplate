/**
 * Logging Configuration (policy/settings)
 *
 * Contains only configuration constants and types.
 * Factory functions (createAppLogger, createAccessLogger) remain in lib/logging.ts
 * and use this configuration.
 *
 * @module config/logging
 */
import path from "node:path";

import env from "./env";

/**
 * Log rotation configuration interface
 */
export interface LogRotationConfig {
  frequency: "daily" | "hourly" | "weekly";
  retentionDays: number;
  compress: boolean;
  boundary: boolean;
  utc: boolean;
}

/**
 * Get log rotation configuration from environment
 */
export function getLogRotationConfig() {
  return {
    frequency: env.LOG_ROTATION_FREQUENCY,
    retentionDays: env.LOG_RETENTION_DAYS,
    compress: env.LOG_COMPRESSION,
    boundary: env.LOG_ROTATION_BOUNDARY,
    utc: env.LOG_ROTATION_UTC,
  };
};

/**
 * Resolved log directory path
 */
export const LOG_DIR = path.resolve(process.cwd(), env.LOG_DIR);

/**
 * Valid Pino log levels
 */
export const LOG_LEVELS = ["fatal", "error", "warn", "info", "debug", "trace"] as const;

/**
 * Log level type
 */
export type LogLevel = typeof LOG_LEVELS[number];

/**
 * Check if rotation is enabled
 */
export function isRotationEnabled() {
  return env.LOG_ROTATION_ENABLED;
};

/**
 * Check if access logging is enabled
 */
export function isAccessLogEnabled() {
  return env.ENABLE_ACCESS_LOG;
};

/**
 * Check if application logging is enabled
 */
export function isAppLogEnabled() {
  return env.ENABLE_APP_LOG;
};

/**
 * Get current log level
 */
export function getLogLevel() {
  return env.LOG_LEVEL;
};
