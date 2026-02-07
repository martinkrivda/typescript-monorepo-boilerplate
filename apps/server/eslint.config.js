import antfu from "@antfu/eslint-config";

export default antfu({
  type: "app",
  typescript: true,
  formatters: true,
  stylistic: {
    indent: 2,
    semi: true,
    quotes: "double",
  },
  ignores: ["**/migrations/*"],
  // Report unused eslint-disable directives as errors
  linterOptions: {
    reportUnusedDisableDirectives: "error",
  },
}, {
  rules: {
    "import/no-cycle": ["error"],
    "no-console": ["warn"],
    "antfu/no-top-level-await": ["off"],
    "node/prefer-global/process": ["off"],
    "node/no-process-env": ["error"],
    "perfectionist/sort-imports": ["error", {
      tsconfigRootDir: ".",
    }],
    "unicorn/filename-case": ["error", {
      case: "kebabCase",
      ignore: ["README.md"],
    }],
  },
}, {
  // Prevent barrel imports inside modules to avoid circular dependencies
  files: ["src/modules/**/*.ts"],
  rules: {
    "no-restricted-imports": ["error", {
      paths: [
        {
          name: "@/schemas",
          message: "Import directly from schema files (e.g., @/schemas/common.schema) or use relative imports (./auth.schema) inside modules to avoid circular dependencies.",
        },
        {
          name: "@/schemas/index",
          message: "Import directly from schema files (e.g., @/schemas/common.schema) or use relative imports (./auth.schema) inside modules to avoid circular dependencies.",
        },
      ],
    }],
  },
}, {
  // ==============================================================
  // BANNED PACKAGES: Prevent reintroduction of removed dependencies
  // ==============================================================
  rules: {
    "no-restricted-imports": ["error", {
      patterns: [
        {
          group: ["stoker", "stoker/*"],
          message: "stoker is banned. Use @/lib/http-status and @/lib/openapi/helpers instead.",
        },
      ],
    }],
  },
}, {
  // ==============================================================
  // DEPENDENCY RULES: Enforce layered architecture
  // ==============================================================
  // Layer hierarchy (lower -> higher):
  //   utils/ -> config/ -> lib/ -> modules/
  //
  // Rules:
  //   - utils/ MUST NOT import from config/, lib/, modules/
  //   - config/ MUST NOT import from lib/, modules/
  //   - lib/ MAY import from config/, utils/
  //   - modules/ MAY import from all layers
  //
  // Coverage:
  //   - @typescript-eslint/no-restricted-imports: static + type-only imports
  //   - Includes both @/ alias AND relative paths (../**/config, etc.)
  //   - no-restricted-syntax: dynamic import(), require(), createRequire()
  //   - Ban node:module/module imports to prevent createRequire alias bypass
  // ==============================================================

  // utils/ layer - pure functions, no dependencies on higher layers
  files: ["src/utils/**/*.ts"],
  rules: {
    "no-restricted-imports": "off",
    "@typescript-eslint/no-restricted-imports": ["error", {
      paths: [
        // Ban node:module to prevent createRequire alias bypass
        {
          name: "node:module",
          message: "node:module is forbidden in utils/ - prevents createRequire bypass.",
        },
        {
          name: "module",
          message: "module is forbidden in utils/ - prevents createRequire bypass.",
        },
      ],
      patterns: [
        {
          group: ["@/config", "@/config/*", "**/../**/config", "**/../**/config/*"],
          message: "utils/ must be pure - cannot import from config/.",
        },
        {
          group: ["@/lib", "@/lib/*", "**/../**/lib", "**/../**/lib/*"],
          message: "utils/ must be pure - cannot import from lib/.",
        },
        {
          group: ["@/modules", "@/modules/*", "**/../**/modules", "**/../**/modules/*"],
          message: "utils/ must be pure - cannot import from modules/.",
        },
      ],
    }],
  },
}, {
  // config/ layer - configuration only, no business logic
  files: ["src/config/**/*.ts"],
  rules: {
    "no-restricted-imports": "off",
    "@typescript-eslint/no-restricted-imports": ["error", {
      paths: [
        // Ban node:module to prevent createRequire alias bypass
        {
          name: "node:module",
          message: "node:module is forbidden in config/ - prevents createRequire bypass.",
        },
        {
          name: "module",
          message: "module is forbidden in config/ - prevents createRequire bypass.",
        },
      ],
      patterns: [
        {
          group: ["@/lib", "@/lib/*", "**/../**/lib", "**/../**/lib/*"],
          message: "config/ cannot import from lib/.",
        },
        {
          group: ["@/modules", "@/modules/*", "**/../**/modules", "**/../**/modules/*"],
          message: "config/ cannot import from modules/.",
        },
      ],
    }],
  },
}, {
  // ==============================================================
  // BAN DYNAMIC import() AND require() IN PURE LAYERS
  // ==============================================================
  files: ["src/utils/**/*.ts", "src/config/**/*.ts"],
  rules: {
    "no-restricted-syntax": ["error",
      {
        selector: "ImportExpression",
        message: "Dynamic import() is forbidden in utils/ and config/ - layers must remain pure and statically analyzable.",
      },
      {
        selector: "CallExpression[callee.name='require']",
        message: "require() is forbidden in utils/ and config/ - use static imports only.",
      },
      {
        selector: "CallExpression[callee.name='createRequire']",
        message: "createRequire() is forbidden in utils/ and config/ - layers must remain pure ESM.",
      },
    ],
  },
}, {
  // ==============================================================
  // FILE-SPECIFIC OVERRIDES (replaces inline eslint-disable comments)
  // ==============================================================

  // env.ts - must access process.env (its purpose), uses control chars for validation
  files: ["src/config/env.ts"],
  rules: {
    "node/no-process-env": "off",
    "no-control-regex": "off",
  },
}, {
  // CLI - needs console.log for user output
  files: ["src/cli.ts"],
  rules: {
    "no-console": "off",
  },
}, {
  // Server entry point - startup log is acceptable
  files: ["src/index.ts"],
  rules: {
    "no-console": "off",
  },
}, {
  // Background jobs - console output for cron/standalone execution
  files: ["src/jobs/**/*.ts", "src/modules/**/**.job.ts"],
  rules: {
    "no-console": "off",
  },
}, {
  // Access logger fallback - console.error when logger fails
  files: ["src/middlewares/access-logger.ts"],
  rules: {
    "no-console": "off",
  },
}, {
  // Sanitize utils - regex for control characters is intentional
  files: ["src/utils/sanitize.ts"],
  rules: {
    "no-control-regex": "off",
  },
}, {
  // Types - empty object type is intentional for Hono schema generics
  files: ["src/types/index.ts"],
  rules: {
    "ts/no-empty-object-type": "off",
  },
});
