/**
 * OpenAPI Configuration
 *
 * Contains OpenAPI/Scalar documentation configuration.
 *
 * NOTE: JSON import uses ESM import attributes (`with { type: "json" }`).
 * This requires:
 * - Node.js 20+ (supports import attributes)
 * - TypeScript with `resolveJsonModule: true` and `module: "NodeNext"` or `"ESNext"`
 *
 * @module config/openapi
 */
import { Scalar } from "@scalar/hono-api-reference";

import type { AppOpenAPI } from "@/types";

import packageJSON from "../../../../package.json" with { type: "json" };

/**
 * OpenAPI configuration constants
 */
export const OPENAPI_CONFIG = {
  version: packageJSON.version,
  title: "API Template",
  docPath: "/doc",
  referencePath: "/reference",
} as const;

/**
 * Configure OpenAPI documentation endpoints
 * @param app - Hono OpenAPI application instance
 */
export function configureOpenAPI(app: AppOpenAPI) {
  app.doc(OPENAPI_CONFIG.docPath, {
    openapi: "3.0.0",
    info: {
      version: OPENAPI_CONFIG.version,
      title: OPENAPI_CONFIG.title,
    },
    servers: [
      {
        url: "",
        description: "API Server",
      },
    ],
  });

  app.get(
    OPENAPI_CONFIG.referencePath,
    Scalar({
      url: `${OPENAPI_CONFIG.docPath}?cache=${Date.now()}`,
      theme: "kepler",
      layout: "classic",
      defaultHttpClient: {
        targetKey: "js",
        clientKey: "fetch",
      },
    }),
  );
};
