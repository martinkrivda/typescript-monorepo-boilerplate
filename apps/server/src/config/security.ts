/**
 * Security Configuration
 *
 * Contains Content Security Policy (CSP) configuration
 * and other security-related settings.
 *
 * @module config/security
 */

/**
 * Content Security Policy (CSP) Configuration
 * Centralized management of allowed domains and sources
 */
export const CSP_CONFIG = {
  // Trusted CDN providers
  CDN_PROVIDERS: [
    "https://cdn.jsdelivr.net",
    "https://unpkg.com",
    "https://cdnjs.cloudflare.com",
  ],

  // Font providers
  FONT_PROVIDERS: [
    "https://fonts.gstatic.com",
    "https://fonts.googleapis.com",
  ],

  // API documentation tools
  API_DOCS: [
    "https://cdn.jsdelivr.net", // Scalar API Reference
    "https://unpkg.com", // Alternative CDN for docs
  ],

  // Analytics and monitoring (if needed)
  ANALYTICS: [
    // Add analytics domains here when needed
    // 'https://www.google-analytics.com',
  ],

  // Development specific sources
  DEVELOPMENT: {
    LOCALHOST: [
      "http://localhost:*",
      "ws://localhost:*",
      "http://127.0.0.1:*",
    ],
    DEV_TOOLS: [
      // Add development-specific sources here
    ],
  },
} as const;

/**
 * Build CSP directive based on environment
 * @param nodeEnv - Current NODE_ENV value
 * @returns CSP directives object for hono/secure-headers
 */
export type CSPDirectiveMap = Record<string, string[]>;

export function buildCSPDirectives(
  nodeEnv: string = "development",
  nonce?: string,
): CSPDirectiveMap {
  const isDevelopment = nodeEnv === "development";
  const nonceSource = nonce ? [`'nonce-${nonce}'`] : [];

  return {
    defaultSrc: ["'self'"],

    scriptSrc: [
      "'self'",
      ...nonceSource,
      ...CSP_CONFIG.CDN_PROVIDERS,
      ...CSP_CONFIG.API_DOCS,
      ...(isDevelopment ? CSP_CONFIG.DEVELOPMENT.LOCALHOST : []),
    ],

    styleSrc: [
      "'self'",
      ...nonceSource,
      ...CSP_CONFIG.CDN_PROVIDERS,
      ...CSP_CONFIG.FONT_PROVIDERS,
      ...(isDevelopment ? CSP_CONFIG.DEVELOPMENT.LOCALHOST : []),
    ],

    connectSrc: [
      "'self'",
      ...CSP_CONFIG.CDN_PROVIDERS,
      ...CSP_CONFIG.API_DOCS,
      ...(isDevelopment ? CSP_CONFIG.DEVELOPMENT.LOCALHOST : []),
    ],

    fontSrc: [
      "'self'",
      ...CSP_CONFIG.CDN_PROVIDERS,
      ...CSP_CONFIG.FONT_PROVIDERS,
      "data:", // For embedded fonts
    ],

    imgSrc: [
      "'self'",
      "data:", // For base64 images
      "blob:", // For generated images
      ...CSP_CONFIG.CDN_PROVIDERS,
    ],

    mediaSrc: [
      "'self'",
      "data:",
      "blob:",
    ],

    objectSrc: ["'none'"], // Security best practice

    frameSrc: [
      "'self'",
      // Add frame sources here if needed
    ],

    // Additional security directives
    baseUri: ["'self'"],
    formAction: ["'self'"],
    frameAncestors: ["'none'"], // Prevents embedding in frames
  };
};

const directiveKeyMap: Record<string, string> = {
  defaultSrc: "default-src",
  scriptSrc: "script-src",
  styleSrc: "style-src",
  connectSrc: "connect-src",
  fontSrc: "font-src",
  imgSrc: "img-src",
  mediaSrc: "media-src",
  objectSrc: "object-src",
  frameSrc: "frame-src",
  baseUri: "base-uri",
  formAction: "form-action",
  frameAncestors: "frame-ancestors",
};

export function buildCSPHeaderValue(
  nodeEnv: string = "development",
  nonce?: string,
) {
  const directives = buildCSPDirectives(nodeEnv, nonce);

  return Object.entries(directives)
    .map(([key, values]) => {
      const directive = directiveKeyMap[key] ?? key;
      return `${directive} ${values.join(" ")}`;
    })
    .join("; ");
}

/**
 * Environment-specific configuration
 */
export const ENV_CONFIG = {
  DEVELOPMENT: {
    LOG_LEVEL: "debug",
    ENABLE_QUERY_LOG: true,
    ENABLE_CSP: false, // Can be disabled for easier development
  },

  PRODUCTION: {
    LOG_LEVEL: "error",
    ENABLE_QUERY_LOG: false,
    ENABLE_CSP: true, // Always enabled in production
  },

  TEST: {
    LOG_LEVEL: "silent",
    ENABLE_QUERY_LOG: false,
    ENABLE_CSP: false,
  },
} as const;

/**
 * Check if CSP should be enabled for current environment
 */
export function isCSPEnabled(nodeEnv: string) {
  const envKey = nodeEnv.toUpperCase() as keyof typeof ENV_CONFIG;
  return ENV_CONFIG[envKey]?.ENABLE_CSP ?? true;
};
