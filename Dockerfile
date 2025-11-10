# ============================================
# Stage 1: Build
# ============================================
FROM node:20-alpine AS builder

WORKDIR /app

# Copy package files
COPY package*.json ./

# Install dependencies (including dev dependencies for build)
RUN npm install && npm cache clean --force

# Copy source code
COPY . .

# Build the application
RUN npm run build

# ============================================
# Stage 2: Production
# ============================================
FROM node:20-alpine

# Install security updates and runtime dependencies
RUN apk update && apk upgrade && \
    apk add --no-cache dumb-init && \
    rm -rf /var/cache/apk/*

# Create non-root user
RUN addgroup -g 1001 -S nodejs && \
    adduser -S apcb -u 1001 -G nodejs

WORKDIR /app

# Copy only production dependencies from builder
COPY --from=builder --chown=apcb:nodejs /app/node_modules ./node_modules

# Copy built application
COPY --from=builder --chown=apcb:nodejs /app/dist ./dist

# Copy necessary runtime files
COPY --from=builder --chown=apcb:nodejs /app/package*.json ./
COPY --from=builder --chown=apcb:nodejs /app/db ./db

# Set environment
ENV NODE_ENV=production

# Expose port
EXPOSE 5001

# Switch to non-root user
USER apcb

# Health check
HEALTHCHECK --interval=30s --timeout=10s --start-period=40s --retries=3 \
  CMD node -e "require('http').get('http://localhost:5001/api/events', (r) => process.exit(r.statusCode === 200 ? 0 : 1))"

# Use dumb-init for proper signal handling
ENTRYPOINT ["dumb-init", "--"]

# Start the application
CMD ["node", "dist/index.js"]
