# Server API Template

[![Node.js](https://img.shields.io/badge/Node.js-≥20.0.0-339933?logo=node.js&logoColor=white)](https://nodejs.org/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.9-3178C6?logo=typescript&logoColor=white)](https://www.typescriptlang.org/)
[![Hono](https://img.shields.io/badge/Hono-4.11-E36002?logo=hono&logoColor=white)](https://hono.dev/)
[![Prisma](https://img.shields.io/badge/Prisma-7.1-2D3748?logo=prisma&logoColor=white)](https://www.prisma.io/)

> Boilerplate API server with health checks, metrics, OpenAPI docs, and a PostgreSQL-ready Prisma setup.

## Features

- **RFC 9457 Error Handling** - Problem Details format with response envelope pattern
- **OpenAPI Documentation** - Auto-generated API docs with Scalar UI at `/reference`
- **Type Safety** - Full TypeScript with Zod schema validation
- **Kubernetes Ready** - Health probes (`/health/live`, `/health/ready`, `/health`)
- **Observability** - Prometheus metrics endpoint at `/metrics`
- **Security & Ops** - Rate limiting, CORS, CSP, access/app logs

## Tech Stack

| Category | Technology |
|----------|------------|
| **Framework** | [Hono](https://hono.dev/) with OpenAPIHono |
| **Runtime** | Node.js ≥20.0.0 |
| **Language** | TypeScript 5.9 (strict mode) |
| **Database** | PostgreSQL + [Prisma ORM 7.1](https://www.prisma.io/) |
| **API Docs** | OpenAPI 3.0 + [Scalar UI](https://github.com/scalar/scalar) |
| **Validation** | [Zod](https://zod.dev/) schemas |
| **Logging** | [Pino](https://getpino.io/) (structured JSON) |
| **Testing** | [Vitest](https://vitest.dev/) |

## Getting Started

### Prerequisites

- Node.js ≥20.0.0
- PostgreSQL (or Docker)

### Installation

```bash
# Install dependencies
pnpm install

# Start local PostgreSQL (optional)
docker compose -f docker-compose.db.yaml up -d

# Configure environment
cp .env.example .env
# Edit .env with your settings

# Generate Prisma client
pnpm exec prisma generate

# Run database migrations
pnpm exec prisma migrate dev
```

### Environment Variables

```env
# Application
NODE_ENV=development
PORT=9999
LOG_LEVEL=info

# Database
DATABASE_URL="postgresql://postgres:postgres@localhost:5432/template"

# CORS
CORS_ORIGIN=http://localhost:3000
CORS_METHODS=GET,POST,PUT,DELETE,OPTIONS
CORS_HEADERS=Content-Type,Authorization

# Rate Limiting
RATE_LIMIT_WINDOW_MS=60000
RATE_LIMIT_MAX=100

# Logging
LOG_DIR=logs
ENABLE_ACCESS_LOG=true
ENABLE_APP_LOG=true
LOG_ROTATION_ENABLED=true
LOG_RETENTION_DAYS=14
```

## Scripts

```bash
pnpm run dev          # Development server with hot reload
pnpm run build        # TypeScript compilation to dist/
pnpm run start        # Production server
pnpm run lint         # ESLint (strict CI mode)
pnpm run lint:local   # ESLint (development mode)
pnpm run lint:fix     # Auto-fix ESLint issues
pnpm run test         # Run tests
pnpm run test:watch   # Run tests in watch mode
```

## API Reference

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/` | API information (envelope response) |
| GET | `/health` | Full health check with diagnostics |
| GET | `/health/live` | Liveness probe (Kubernetes) |
| GET | `/health/ready` | Readiness probe (Kubernetes) |
| GET | `/metrics` | Prometheus metrics |
| GET | `/reference` | API documentation (Scalar UI) |
| GET | `/doc` | OpenAPI specification (JSON) |

## Database

### Models

`prisma/schema.prisma` contains a single `Example` model as a starting point.

### Commands

```bash
pnpm exec prisma generate        # Generate client (output: src/generated/prisma/)
pnpm exec prisma migrate dev     # Run migrations
pnpm exec prisma studio          # Database GUI
```

## Logging

```text
logs/
├── access.log        # HTTP request/response logs
├── access.log.1.gz   # Rotated + compressed
├── app.log           # Application logs
└── app.log.1.gz      # Rotated + compressed
```
