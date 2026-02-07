# Environment Reference

This monorepo uses per-app environment files only. Root `.env*` files are not part of application runtime.

## Server (`apps/server`)

Runtime file:
- `apps/server/.env`

Template:
- `apps/server/.env.example`

Main variables:
- `PORT`: HTTP listen port for the server (default `3001`).
- `DATABASE_URL`: PostgreSQL connection string (required).
- `SHADOW_DATABASE_URL`: Shadow database URL used by Prisma migrations.
- `JWT_SECRET`: Secret used to validate Bearer JWT tokens on protected endpoints.
- `API_BASE_URL`: Optional absolute base URL for generated links/problem types.
- `CORS_ORIGIN`, `CORS_METHODS`, `CORS_HEADERS`: CORS configuration.
- `RATE_LIMIT_WINDOW_MS`, `RATE_LIMIT_MAX`: Rate-limit configuration.

## Client (`apps/client`)

Runtime file:
- `apps/client/.env.local`

Template:
- `apps/client/.env.local.example`

Main variables:
- `VITE_API_BASE_URL`: API base URL used by the frontend.
- `VITE_PUBLIC_URL`: Public URL of the frontend app.
- `VITE_DEBUG_LOGGING`: Enables extra client debug logging when `true`.
- `VITE_DEFAULT_LANGUAGE`: Default i18n language.

Only variables prefixed with `VITE_` are exposed to client-side code. Do not put secrets into `VITE_*` variables.

## Turborepo

`turbo.json` declares env keys via `globalEnv` with `envMode: "strict"` so env changes correctly affect task hashing/cache behavior.
