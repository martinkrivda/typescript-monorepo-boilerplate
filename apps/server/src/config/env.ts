/**
 * Environment Configuration
 *
 * Centralized environment variable validation using Zod.
 * This is the ONLY file that should access process.env directly.
 *
 * @module config/env
 */
import { config } from "dotenv";
import { expand } from "dotenv-expand";
import path from "node:path";
import { z } from "zod";

// Load environment variables based on NODE_ENV
// - .env.test for tests (isolated test database)
// - .env for development/production
expand(
  config({
    path: path.resolve(process.cwd(), process.env.NODE_ENV === "test" ? ".env.test" : ".env"),
  }),
);

const isTestEnv = process.env.NODE_ENV === "test";
if (isTestEnv && !process.env.DATABASE_URL) {
  process.env.DATABASE_URL = "postgres://test:test@localhost:5432/test";
}

// Environment schema with validation
const EnvSchema = z.object({
  // =================================================================
  // APPLICATION SETTINGS
  // =================================================================
  NODE_ENV: z.enum(["development", "production", "test"]).default("development"),
  PORT: z.coerce.number().default(3001),
  LOG_LEVEL: z.enum(["fatal", "error", "warn", "info", "debug", "trace", "silent"]).default("info"),
  BASE_PATH: z.string().default("/rest/v1"),
  API_BASE_URL: z.string().optional(),

  // =================================================================
  // LOGGING CONFIGURATION
  // =================================================================
  // Log directory
  LOG_DIR: z.string().default("logs"),

  // Access log settings
  ENABLE_ACCESS_LOG: z.coerce.boolean().default(true),
  ACCESS_LOG_FORMAT: z.enum(["combined", "common", "short", "tiny", "dev"]).default("combined"),

  // Application log settings
  ENABLE_APP_LOG: z.coerce.boolean().default(true),
  APP_LOG_FORMAT: z.enum(["json", "pretty"]).default("json"),

  // Log rotation settings
  LOG_ROTATION_ENABLED: z.coerce.boolean().default(true),
  LOG_ROTATION_FREQUENCY: z.enum(["daily", "hourly", "weekly"]).default("daily"),
  LOG_RETENTION_DAYS: z.coerce.number().min(1).max(365).default(14),
  LOG_COMPRESSION: z.coerce.boolean().default(true),

  // Log rotation boundary alignment (rotate at midnight/top of hour instead of N hours from start)
  LOG_ROTATION_BOUNDARY: z.coerce.boolean().default(true),

  // Use UTC for rotation timestamps (false = use TZ env variable, default Europe/Prague)
  // NOTE: When false, ensure TZ is set correctly in production (e.g., TZ=Europe/Prague)
  LOG_ROTATION_UTC: z.coerce.boolean().default(false),

  // Log compression behavior
  LOG_COMPRESS_ON_ROTATION: z.coerce.boolean().default(true), // Compress only during rotation, not all at once

  // =================================================================
  // DATABASE CONFIGURATION
  // =================================================================
  DATABASE_URL: z
    .string()
    .trim()
    .min(1, "DATABASE_URL is required")
    .regex(/^postgres(?:ql)?:\/\//i, "DATABASE_URL must start with postgres:// or postgresql://")
    .refine(
      v => !/[\s\x00-\x1F\x7F]/.test(v),
      "DATABASE_URL must not contain whitespace/control characters",
    ),

  // =================================================================
  // PERFORMANCE SETTINGS
  // =================================================================
  // Prisma settings
  PRISMA_LOG_LEVEL: z.enum(["info", "warn", "error", "query"]).default("info"),
  PRISMA_QUERY_LOG: z.coerce.boolean().default(true),
  PRISMA_POOL_TIMEOUT: z.coerce.number().default(20000),
  PRISMA_CONNECTION_LIMIT: z.coerce.number().default(5),

  // Compression
  ENABLE_COMPRESSION: z.coerce.boolean().default(true),

  // =================================================================
  // CORS CONFIGURATION
  // =================================================================
  CORS_ORIGIN: z.string().default("*"),
  CORS_METHODS: z.string().default("GET,POST,PUT,DELETE,OPTIONS"),
  CORS_HEADERS: z.string().default("Content-Type,Authorization"),

  // =================================================================
  // RATE LIMITING
  // =================================================================
  RATE_LIMIT_MAX: z.coerce.number().default(100),
  RATE_LIMIT_WINDOW_MS: z.coerce.number().default(900000), // 15 minutes

  // =================================================================
  // HTTPS/SECURITY (Optional for production)
  // =================================================================
  FORCE_HTTPS: z.coerce.boolean().default(false),
  HSTS_MAX_AGE: z.coerce.number().default(31536000), // 1 year

  // =================================================================
  // REQUEST BODY LIMITS
  // =================================================================

  /**
   * Maximum request body size for API endpoints
   * Default: 1MB - sufficient for JSON payloads
   */
  MAX_DEFAULT_BODY_SIZE_BYTES: z.coerce
    .number()
    .int()
    .min(1024, "Minimum body size is 1KB")
    .max(10 * 1024 * 1024, "Maximum default body size is 10MB")
    .default(1 * 1024 * 1024),
});

export type Env = z.infer<typeof EnvSchema>;

// Validate environment variables
const { data: env, error } = EnvSchema.safeParse(process.env);

if (error) {
  console.error("Invalid environment variables:");
  console.error(JSON.stringify(error.flatten().fieldErrors, null, 2));

  process.exit(1);
}

export default env!;
