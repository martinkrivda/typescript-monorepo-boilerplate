# =============================================================================
# BUILD STAGE
# =============================================================================
FROM node:25.6.0-alpine AS builder

# Set working directory
WORKDIR /app

# Install pnpm
RUN corepack enable && corepack prepare pnpm@10.20.0 --activate

# Copy workspace files
COPY pnpm-workspace.yaml ./
COPY package.json pnpm-lock.yaml ./
COPY apps/client/package.json ./apps/client/package.json
COPY apps/client/nginx.conf ./apps/client/nginx.conf

# Install dependencies for the client workspace
RUN pnpm install --filter ./apps/client... --frozen-lockfile

# Copy source code
COPY apps/client ./apps/client

# Build the application
RUN pnpm --filter ./apps/client... run build

# =============================================================================
# PRODUCTION STAGE (NGINX)
# =============================================================================
FROM nginx:1.29.1-alpine AS production

# Install curl for health checks
RUN apk add --no-cache curl

# Copy custom nginx configuration
COPY --from=builder /app/apps/client/nginx.conf /etc/nginx/nginx.conf

# Copy built app to nginx
COPY --from=builder /app/apps/client/dist /usr/share/nginx/html

# Create non-root user
RUN addgroup -g 1001 -S nodejs
RUN adduser -S nginxuser -u 1001

# Set ownership
RUN chown -R nginxuser:nodejs /usr/share/nginx/html && \
    chown -R nginxuser:nodejs /var/cache/nginx && \
    chown -R nginxuser:nodejs /var/log/nginx && \
    chown -R nginxuser:nodejs /etc/nginx/conf.d

# Switch to non-root user
USER nginxuser

# Expose port
EXPOSE 3000

# Health check
HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
  CMD curl -f http://localhost:3000/ || exit 1

# Start nginx
CMD ["nginx", "-g", "daemon off;"]
