/**
 * Logging Factory Module
 *
 * Creates and exports logger instances for the application.
 * Uses configuration from @/config/logging for settings.
 *
 * Public API remains unchanged for backward compatibility.
 *
 * @module lib/logging
 */
import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import { fileURLToPath } from "node:url";
import pino from "pino";
import { createStream } from "rotating-file-stream";

import env from "@/config/env";
import {
  getLogRotationConfig,
  isAccessLogEnabled,
  isAppLogEnabled,
  isRotationEnabled,
  LOG_DIR,
} from "@/config/logging";

// Ensure logs directory exists
if (!fs.existsSync(LOG_DIR)) {
  fs.mkdirSync(LOG_DIR, { recursive: true });
}

/**
 * Calculate maxFiles based on retention days and rotation frequency
 *
 * - daily: 1 file per day → maxFiles = days
 * - hourly: 24 files per day → maxFiles = days * 24
 * - weekly: ~0.14 files per day → maxFiles = ceil(days / 7)
 */
function calculateMaxFiles(retentionDays: number, frequency: string) {
  switch (frequency) {
    case "hourly":
      return retentionDays * 24;
    case "weekly":
      return Math.ceil(retentionDays / 7);
    case "daily":
    default:
      return retentionDays;
  }
}

/**
 * Get rotation interval string for rotating-file-stream
 */
function getRotationInterval(frequency: string) {
  switch (frequency) {
    case "hourly":
      return "1h";
    case "weekly":
      return "7d";
    case "daily":
    default:
      return "1d";
  }
}

/**
 * Creates a rotating file stream for logs
 *
 * File naming convention:
 * - Active file: {filename} (e.g., "access.log")
 * - Rotated files: {filename}.{YYYY-MM-DD}[-{HH}] (e.g., "access.log.2025-12-15")
 * - Compressed: {filename}.{YYYY-MM-DD}[-{HH}].gz
 *
 * Note: maxSize is intentionally NOT used to avoid needing index in filename.
 * If size-based rotation is needed, filename generator must include index.
 *
 * @param filename Base filename (e.g., "access.log")
 * @param options Rotation options
 * @param options.compress Whether to gzip rotated files (default: env.LOG_COMPRESSION)
 * @param options.retention Days to keep rotated files (default: env.LOG_RETENTION_DAYS)
 * @param options.frequency Rotation frequency - "daily" | "hourly" etc. (default: env.LOG_ROTATION_FREQUENCY)
 */
function createRotatingStream(
  filename: string,
  options: {
    compress?: boolean;
    retention?: number;
    frequency?: string;
  } = {},
) {
  const rotationConfig = getLogRotationConfig();
  const {
    compress = rotationConfig.compress,
    retention = rotationConfig.retentionDays,
    frequency = rotationConfig.frequency,
  } = options;

  /**
   * Filename generator for rotating-file-stream
   *
   * IMPORTANT: When time is null/undefined, return the base filename
   * for the active (non-rotated) file. Using `time == null` instead of
   * `!time` to avoid treating epoch (0) as active file.
   *
   * @see https://github.com/iccicci/rotating-file-stream#filename
   *
   * @param time - null for active file, Date/number for rotated file
   * @param _index - rotation index (unused - we don't use maxSize)
   * @returns filename string
   */
  const generator = (time: number | Date | null, _index?: number): string => {
    // Active file - return base filename without date suffix
    // Using == null to catch both null and undefined, but NOT 0 (epoch)
    if (time == null) {
      return filename;
    }

    // Rotated file - add date suffix
    const dateTime = time instanceof Date ? time : new Date(time);

    // Validate date to prevent invalid filenames
    if (Number.isNaN(dateTime.getTime())) {
      // Fallback to current date if invalid
      console.warn(`[logging] Invalid rotation time received: ${time}, using current date`);
      return `${filename}.${new Date().toISOString().split("T")[0]}`;
    }

    const year = dateTime.getFullYear();
    const month = String(dateTime.getMonth() + 1).padStart(2, "0");
    const day = String(dateTime.getDate()).padStart(2, "0");

    if (frequency === "hourly") {
      const hour = String(dateTime.getHours()).padStart(2, "0");
      return `${filename}.${year}-${month}-${day}-${hour}`;
    }

    return `${filename}.${year}-${month}-${day}`;
  };

  return createStream(generator, {
    path: LOG_DIR,
    interval: getRotationInterval(frequency),
    // Rotate at interval boundaries (midnight for daily, top of hour for hourly)
    // Configurable via env - default true
    intervalBoundary: rotationConfig.boundary,
    // Use UTC or local time for rotation timestamps
    // Configurable via env - default false (use TZ, typically Europe/Prague)
    intervalUTC: rotationConfig.utc,
    compress: compress ? "gzip" : false,
    // Calculate maxFiles based on frequency to match retention days
    maxFiles: calculateMaxFiles(retention, frequency),
    // Check for rotation on startup (handles app restart across period boundary)
    initialRotation: true,
    // Note: maxSize intentionally omitted to avoid filename collisions
    // If you need size-based rotation, add maxSize AND include _index in generator:
    // return `${filename}.${suffix}.${_index || 1}`;
  });
}

/**
 * Application logger context interface for structured logging
 */
export interface LogContext {
  requestId?: string;
  documentId?: string | number;
  documentType?: string;
  request?: {
    method?: string;
    path?: string; // Only path, no query string (security)
    userAgent?: string;
    ip?: string;
  };
  response?: {
    statusCode?: number;
    responseTime?: number;
    contentLength?: number;
  };
  senderUUID?: string;
  receiverUUID?: string;
  userId?: string;
  clientId?: string;
  companyId?: string;
  environment?: string;
  action?: string;
  service?: string;
  error?: {
    name?: string;
    message?: string;
    stack?: string;
    code?: string;
  };
  [key: string]: unknown;
}

/**
 * Get application version from package.json
 */
function getAppVersion() {
  try {
    const currentDir = path.dirname(fileURLToPath(import.meta.url));
    const packagePath = path.resolve(currentDir, "../../../..", "package.json");
    const packageJson = JSON.parse(fs.readFileSync(packagePath, "utf-8"));
    return packageJson.version || "0.0.0";
  }
  catch {
    return "0.0.0";
  }
}

const APP_VERSION = getAppVersion();

/**
 * Create structured application logger
 */
function createAppLogger() {
  const streams: pino.StreamEntry[] = [];

  // Console output for development
  if (env.NODE_ENV === "development") {
    streams.push({
      level: env.LOG_LEVEL as pino.Level,
      stream: pino.destination({
        dest: 1, // stdout
        sync: false,
      }),
    });
  }

  // File output for application logs
  if (isAppLogEnabled()) {
    const appLogStream = isRotationEnabled()
      ? createRotatingStream("app.log")
      : pino.destination({
          dest: path.join(LOG_DIR, "app.log"),
          sync: false,
        });

    streams.push({
      level: env.LOG_LEVEL as pino.Level,
      stream: appLogStream,
    });
  }

  // Fallback to stdout if no streams configured
  if (streams.length === 0) {
    streams.push({
      level: env.LOG_LEVEL as pino.Level,
      stream: process.stdout,
    });
  }

  const baseConfig = {
    level: env.LOG_LEVEL,
    timestamp: pino.stdTimeFunctions.isoTime,
    formatters: {
      level: (label: string) => ({ level: label }),
    },
    base: {
      pid: process.pid,
      hostname: os.hostname(),
      service: "api-template",
      version: APP_VERSION,
      env: env.NODE_ENV,
    },
  };

  return streams.length > 1
    ? pino(baseConfig, pino.multistream(streams))
    : pino(baseConfig, streams[0].stream);
}

/**
 * Create access logger for HTTP requests
 */
function createAccessLogger() {
  if (!isAccessLogEnabled()) {
    return null;
  }

  const accessLogStream = isRotationEnabled()
    ? createRotatingStream("access.log")
    : pino.destination({
        dest: path.join(LOG_DIR, "access.log"),
        sync: false,
      });

  return pino({
    level: "info",
    timestamp: pino.stdTimeFunctions.isoTime,
    formatters: {
      level: () => ({ level: "info" }),
    },
    base: {
      service: "api-template-access",
      version: APP_VERSION,
    },
  }, accessLogStream);
}

// Create logger instances
export const appLogger = createAppLogger();
export const accessLogger = createAccessLogger();

/**
 * Helper function to create structured log messages
 */
export function createLogMessage(
  level: pino.Level,
  message: string,
  context?: LogContext,
) {
  const logData = {
    message,
    ...(context && { context }),
  };

  appLogger[level](logData);
}

/**
 * Helper functions for common logging scenarios
 */
export const logger = {
  debug: (message: string, context?: LogContext) => createLogMessage("debug", message, context),
  info: (message: string, context?: LogContext) => createLogMessage("info", message, context),
  warn: (message: string, context?: LogContext) => createLogMessage("warn", message, context),
  error: (message: string, context?: LogContext) => createLogMessage("error", message, context),
  fatal: (message: string, context?: LogContext) => createLogMessage("fatal", message, context),

  // Specialized logging methods
  database: (message: string, context?: Omit<LogContext, "service">) =>
    createLogMessage("info", message, { ...context, service: "database" }),

  security: (message: string, context?: Omit<LogContext, "service">) =>
    createLogMessage("warn", message, { ...context, service: "security" }),
};

export default appLogger;
