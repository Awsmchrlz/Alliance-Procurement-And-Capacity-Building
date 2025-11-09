FROM node:20-alpine

# Install security updates and build dependencies
RUN apk update && apk upgrade && \
    apk add --no-cache dumb-init python3 make g++

# Create non-root user
RUN addgroup -g 1001 -S nodejs && adduser -S apcb -u 1001

WORKDIR /app

# Copy package files
COPY package*.json ./

# Install ALL dependencies (including optional ones for Alpine)
RUN npm ci --include=optional && npm cache clean --force

# Copy source code and migrations
COPY . .

# Build the application
RUN npm run build

# Ensure migrations are included
RUN ls -la db/migrations/ || echo "No migrations folder"

# Change ownership to non-root user
RUN chown -R apcb:nodejs /app

# Expose port
EXPOSE 5001

# Switch to non-root user
USER apcb

# Use dumb-init for proper signal handling
ENTRYPOINT ["dumb-init", "--"]

# Start the application (migrations run automatically in server/index.ts)
CMD ["node", "dist/index.js"]
