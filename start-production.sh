#!/bin/bash

# Production startup script for Namecheap shared hosting
# Memory-efficient Node.js application launcher

echo "🚀 Starting Alliance Procurement application in production mode..."

# Set memory limits and optimizations
export NODE_ENV=production
export NODE_OPTIONS="--max-old-space-size=256 --optimize-for-size --gc-interval=100"

# Memory monitoring function
monitor_memory() {
    while true; do
        sleep 300  # Check every 5 minutes
        MEMORY_USAGE=$(ps -o pid,vsz,rss,comm -p $$ | tail -1 | awk '{print $3}')
        MEMORY_MB=$((MEMORY_USAGE / 1024))

        echo "$(date): Memory usage: ${MEMORY_MB}MB RSS"

        # If memory usage exceeds 400MB, restart the application
        if [ $MEMORY_MB -gt 400 ]; then
            echo "$(date): Memory usage too high (${MEMORY_MB}MB), restarting..."
            kill -TERM $$
            sleep 2
            exec "$0" "$@"
        fi
    done &
}

# Cleanup function
cleanup() {
    echo "$(date): Cleaning up..."

    # Kill background processes
    jobs -p | xargs -r kill

    # Force garbage collection if available
    if command -v node >/dev/null 2>&1; then
        node -e "if (global.gc) global.gc();" 2>/dev/null || true
    fi

    echo "$(date): Cleanup complete"
    exit 0
}

# Set up signal handlers
trap cleanup SIGTERM SIGINT SIGQUIT

# Check if required files exist
if [ ! -f "dist/index-production.js" ]; then
    echo "❌ Production build not found. Running build..."
    npm run build:server:memory || {
        echo "❌ Build failed!"
        exit 1
    }
fi

# Check if environment variables are set
if [ -z "$SUPABASE_URL" ] || [ -z "$SUPABASE_SERVICE_ROLE_KEY" ]; then
    echo "⚠️  Warning: Supabase environment variables not set"

    # Try to load from .env file
    if [ -f ".env" ]; then
        echo "📄 Loading environment from .env file..."
        export $(grep -v '^#' .env | xargs)
    fi
fi

# Log startup information
echo "📊 System Information:"
echo "  Node.js version: $(node --version)"
echo "  Available memory: $(free -h 2>/dev/null | grep '^Mem:' | awk '{print $2}' || echo 'Unknown')"
echo "  Process ID: $$"
echo "  Working directory: $(pwd)"
echo "  NODE_OPTIONS: $NODE_OPTIONS"

# Start memory monitoring in background
monitor_memory

# Create logs directory if it doesn't exist
mkdir -p logs

# Start the application with memory monitoring
echo "🌟 Starting Node.js application..."

# Use exec to replace shell with node process (better for signal handling)
exec node \
    --expose-gc \
    --max-old-space-size=256 \
    --optimize-for-size \
    --gc-interval=100 \
    dist/index-production.js \
    2>&1 | tee -a logs/production.log

# This line should never be reached due to exec
echo "❌ Application exited unexpectedly"
exit 1
