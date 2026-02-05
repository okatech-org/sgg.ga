# =============================================================================
# SGG Digital Backend - Dockerfile
# Multi-stage build for Google Cloud Run
# =============================================================================

# Stage 1: Build
FROM node:20-alpine AS builder

WORKDIR /app

# Install dependencies for native modules
RUN apk add --no-cache python3 make g++

# Copy package files
COPY package.json package-lock.json* ./

# Install dependencies
RUN npm ci --only=production=false

# Copy source code
COPY . .

# Build TypeScript
RUN npm run build

# Prune dev dependencies
RUN npm prune --production

# Stage 2: Production
FROM node:20-alpine AS production

WORKDIR /app

# Security: Run as non-root user
RUN addgroup -g 1001 -S nodejs
RUN adduser -S sgg -u 1001

# Copy built assets and dependencies
COPY --from=builder --chown=sgg:nodejs /app/dist ./dist
COPY --from=builder --chown=sgg:nodejs /app/node_modules ./node_modules
COPY --from=builder --chown=sgg:nodejs /app/package.json ./

# Set environment
ENV NODE_ENV=production
ENV PORT=8080

# Switch to non-root user
USER sgg

# Expose port
EXPOSE 8080

# Health check
HEALTHCHECK --interval=30s --timeout=10s --start-period=5s --retries=3 \
  CMD node -e "require('http').get('http://localhost:8080/api/health', (r) => process.exit(r.statusCode === 200 ? 0 : 1))"

# Start the application
CMD ["node", "dist/server.js"]
