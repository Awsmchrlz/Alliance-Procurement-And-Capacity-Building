# Multi-stage Dockerfile for Alliance Procurement and Capacity Building Application
# Optimized for production deployment

# Stage 1: Dependencies
FROM node:18-alpine AS deps
WORKDIR /app

# Install system dependencies
RUN apk add --no-cache libc6-compat

# Copy package files
COPY package*.json ./

# Install dependencies
RUN npm ci --only=production --silent && \
    npm cache clean --force

# Stage 2: Builder
FROM node:18-alpine AS builder
WORKDIR /app

# Install build dependencies
RUN apk add --no-cache python3 make g++

# Copy package files
COPY package*.json ./

# Install all dependencies (including dev)
RUN npm ci --silent

# Copy source code
COPY . .

# Build the application
RUN npm run build

# Stage 3: Production
FROM node:18-alpine AS runner
WORKDIR /app

# Install dumb-init for proper signal handling
RUN apk add --no-cache dumb-init curl

# Create non-root user
RUN addgroup -g 1001 -S nodejs && \
    adduser -S apcb -u 1001 -G nodejs

# Copy production dependencies from deps stage
COPY --from=deps --chown=apcb:nodejs /app/node_modules ./node_modules

# Copy built application from builder stage
COPY --from=builder --chown=apcb:nodejs /app/dist ./dist
COPY --from=builder --chown=apcb:nodejs /app/package*.json ./

# Copy necessary config files
COPY --chown=apcb:nodejs drizzle.config.ts ./
COPY --chown=apcb:nodejs tsconfig.json ./

# Create directories for runtime
RUN mkdir -p /app/uploads /app/logs /tmp && \
    chown -R apcb:nodejs /app/uploads /app/logs /tmp

# Switch to non-root user
USER apcb

# Environment variables
ENV NODE_ENV=production \
    PORT=3000 \
    HOST=0.0.0.0

# Expose port
EXPOSE 3000

# Health check
HEALTHCHECK --interval=30s --timeout=10s --start-period=40s --retries=3 \
    CMD curl -f http://localhost:3000/api/events || exit 1

# Start application
ENTRYPOINT ["dumb-init", "--"]
CMD ["node", "dist/index.js"]

# Metadata
LABEL maintainer="APCB Team" \
      version="2.0.0" \
      description="Alliance Procurement and Capacity Building Platform" \
      org.opencontainers.image.source="https://github.com/yourusername/apcb-platform"
