# Multi-stage Dockerfile for Alliance Procurement and Capacity Building Application

# Stage 1: Build Stage
FROM node:18-alpine AS builder

# Set working directory
WORKDIR /app

# Install system dependencies for building native modules
RUN apk add --no-cache \
    python3 \
    make \
    g++ \
    git

# Copy package files
COPY package*.json ./

# Install all dependencies (including devDependencies for building)
RUN npm ci --only=production=false --silent

# Copy source code
COPY . .

# Build the application
RUN npm run build

# Stage 2: Production Stage
FROM node:18-alpine AS production

# Install dumb-init for proper signal handling
RUN apk add --no-cache dumb-init

# Create app directory and user
RUN addgroup -g 1001 -S nodejs && \
    adduser -S alliance -u 1001

WORKDIR /app

# Copy package files
COPY package*.json ./

# Install only production dependencies
RUN npm ci --only=production --silent && \
    npm cache clean --force

# Copy built application from builder stage
COPY --from=builder --chown=alliance:nodejs /app/dist ./dist
COPY --from=builder --chown=alliance:nodejs /app/client ./client

# Copy any additional files needed at runtime
COPY --chown=alliance:nodejs drizzle.config.ts ./
COPY --chown=alliance:nodejs tsconfig.json ./

# Create directories for uploads and logs
RUN mkdir -p /app/uploads /app/logs && \
    chown -R alliance:nodejs /app/uploads /app/logs

# Switch to non-root user
USER alliance

# Set environment variables
ENV NODE_ENV=production
ENV PORT=3000
ENV HOST=0.0.0.0

# Expose port
EXPOSE 3000

# Health check
HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
    CMD node -e "require('http').get('http://localhost:3000/health', (res) => { process.exit(res.statusCode === 200 ? 0 : 1) })"

# Start the application with dumb-init for proper signal handling
ENTRYPOINT ["dumb-init", "--"]
CMD ["npm", "start"]

# Labels for better maintainability
LABEL maintainer="Alliance Procurement Team"
LABEL version="2.0"
LABEL description="Alliance Procurement and Capacity Building Application"
LABEL org.opencontainers.image.source="https://github.com/yourusername/Alliance-Procurement-And-Capacity-Building-v2"
