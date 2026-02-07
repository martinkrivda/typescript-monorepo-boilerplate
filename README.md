# TypeScript Monorepo Boilerplate

Minimal pnpm + Turbo monorepo with a Vite client and Hono server.

## Contents

- `apps/client` - Vite + React frontend
- `apps/server` - Hono + Prisma backend
- `packages/*` - shared libraries (optional)
- `tools/*` - tooling (optional)
- `docs/PROJECT.md` - project documentation

## Requirements

- Node.js (see `.nvmrc`)
- pnpm `>=10.20.0`

## Setup

Activate pnpm via Corepack:

```bash
corepack enable
corepack prepare pnpm@latest-10 --activate
```

Install dependencies:

```bash
pnpm install
```

Run guided setup:

```bash
pnpm setup:dev
```

Build scripts for Prisma/SWC/esbuild are allowlisted via root `pnpm.onlyBuiltDependencies`.

## Environment

- `apps/server/.env` (use `apps/server/.env.example` as a base)
- `apps/client/.env.local` (use `apps/client/.env.local.example` as a base)

Root `.env*` files are intentionally not used by app runtime.
Environment reference lives in `docs/ENV_REFERENCE.md`.

## Dev

Start local PostgreSQL for server:

```bash
docker compose -f apps/server/docker-compose.db.yaml up -d
```

Generate Prisma client and run migrations:

```bash
pnpm db:generate
pnpm db:migrate
```

Start client + server:

```bash
pnpm dev
```

GraphQL endpoint:

- HTTP: `http://localhost:3001/graphql`
- WS (subscriptions): `ws://localhost:3001/graphql`

## Build

```bash
pnpm build
```

## Lint

```bash
pnpm lint
```

## Test

```bash
pnpm test
```

## Database (server)

```bash
pnpm db:generate
pnpm db:migrate
```

`apps/server/.env.example` includes both `DATABASE_URL` and `SHADOW_DATABASE_URL`.

## Structure

```
.
├── apps/
│   ├── client/
│   └── server/
├── packages/
├── tools/
├── turbo.json
└── pnpm-workspace.yaml
```

## Apps

- Client: `apps/client`
- Server: `apps/server`
