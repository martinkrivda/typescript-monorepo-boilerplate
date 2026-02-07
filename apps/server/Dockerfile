# syntax=docker/dockerfile:1

# Multi-stage build for production Node.js TypeScript application
# Based on latest Docker and Node.js best practices (2025)

# -----------------------------------------------------------------------------
# Build Stage - Compile TypeScript and build dependencies
# -----------------------------------------------------------------------------
FROM node:25.6-alpine AS builder

# Install dumb-init for proper signal handling and security packages
RUN apk add --no-cache dumb-init && \
    apk upgrade --no-cache

# Create app user for security (non-root)
RUN addgroup -g 1001 -S nodejs && \
    adduser -S app -u 1001

# Set working directory
WORKDIR /app

# Enable corepack (pnpm)
RUN corepack enable

# Copy workspace files first for better caching
COPY pnpm-workspace.yaml ./
COPY package.json pnpm-lock.yaml ./
COPY apps/server/package.json ./apps/server/package.json
COPY apps/server/prisma ./apps/server/prisma

# Install dependencies for the server workspace
RUN pnpm install --filter ./apps/server... --frozen-lockfile

# Copy source code and configuration files
COPY apps/server ./apps/server
COPY tsconfig.json ./tsconfig.json

# Generate Prisma client
RUN pnpm --filter ./apps/server... prisma generate

# Build the application
RUN pnpm --filter ./apps/server... build

# Prune to production dependencies
RUN pnpm --filter ./apps/server... prune --prod

# -----------------------------------------------------------------------------
# Production Stage - Minimal runtime image
# -----------------------------------------------------------------------------
FROM node:25.6-alpine AS production

# Install dumb-init and security updates
RUN apk add --no-cache dumb-init && \
    apk upgrade --no-cache

# Create app user for security (non-root)
RUN addgroup -g 1001 -S nodejs && \
    adduser -S app -u 1001

# Set working directory
WORKDIR /app

# Copy built application from builder stage
COPY --from=builder --chown=app:nodejs /app/apps/server/dist ./dist
COPY --from=builder --chown=app:nodejs /app/apps/server/node_modules ./node_modules
COPY --from=builder --chown=app:nodejs /app/apps/server/package.json ./package.json
COPY --from=builder --chown=app:nodejs /app/apps/server/prisma ./prisma
COPY --from=builder --chown=app:nodejs /app/apps/server/generated ./generated

# Set proper permissions
RUN chown -R app:nodejs /app

# Switch to non-root user
USER app

# Expose default port (can be overridden at runtime with -p flag)
# Note: EXPOSE is documentation only and build-time, actual port binding happens at runtime
EXPOSE 9999

# Set Node.js environment variables for production
ENV NODE_ENV=production
ENV NODE_OPTIONS="--max-old-space-size=1024"

# Use dumb-init to handle signals properly and start the application
ENTRYPOINT ["dumb-init", "--"]
CMD ["node", "dist/index.js"]
