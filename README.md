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

## Environment

- `apps/server/.env` (use `apps/server/.env.example` as a base)
- `apps/client/.env` (use `apps/client/.env.example` as a base)

## Dev

```bash
pnpm dev
```

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
