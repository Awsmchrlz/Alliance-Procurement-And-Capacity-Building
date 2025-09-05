#!/bin/bash

# Namecheap Ultra-Low Memory Startup Script
# Designed for shared hosting with severe memory constraints

echo "🔧 Starting Alliance Procurement (Namecheap Ultra-Low Memory Mode)..."

# Set ultra-conservative memory limits
export NODE_ENV=production
export NODE_OPTIONS="--max-old-space-size=128 --optimize-for-size --gc-interval=50"

# Function to check memory usage
check_memory() {
    if command -v free >/dev/null 2>&1; then
        AVAILABLE_MEM=$(free -m | awk 'NR==2{printf "%.0f", $7}')
        echo "💾 Available memory: ${AVAILABLE_MEM}MB"

        if [ "$AVAILABLE_MEM" -lt 100 ]; then
            echo "⚠️  Very low memory detected, using minimal configuration"
            export USE_MINIMAL=true
        fi
    fi
}

# Function to kill existing processes
cleanup_existing() {
    echo "🧹 Cleaning up existing processes..."

    # Kill any existing Node.js processes on our port
    PID=$(lsof -ti:${PORT:-5005} 2>/dev/null)
    if [ ! -z "$PID" ]; then
        echo "🔪 Killing existing process on port ${PORT:-5005}: $PID"
        kill -9 $PID 2>/dev/null || true
        sleep 2
    fi

    # Clean up any zombie Node processes
    pkill -f "node.*index" 2>/dev/null || true
    sleep 1
}

# Function to monitor memory and restart if needed
monitor_and_restart() {
    local PID=$1
    while kill -0 $PID 2>/dev/null; do
        sleep 60  # Check every minute

        if command -v ps >/dev/null 2>&1; then
            MEMORY_USAGE=$(ps -o pid,vsz,rss,comm -p $PID 2>/dev/null | tail -1 | awk '{print $3}' 2>/dev/null || echo "0")
            MEMORY_MB=$((MEMORY_USAGE / 1024))

            if [ $MEMORY_MB -gt 200 ]; then
                echo "⚠️  Memory usage too high (${MEMORY_MB}MB), restarting..."
                kill -TERM $PID 2>/dev/null
                sleep 5
                kill -9 $PID 2>/dev/null || true
                exec "$0" "$@"
            fi
        fi
    done
}

# Function to handle shutdown
shutdown() {
    echo "🛑 Shutting down..."

    if [ ! -z "$APP_PID" ]; then
        kill -TERM $APP_PID 2>/dev/null || true
        sleep 3
        kill -9 $APP_PID 2>/dev/null || true
    fi

    # Force garbage collection before exit
    node -e "if (global.gc) global.gc();" 2>/dev/null || true

    exit 0
}

# Set up signal handlers
trap shutdown SIGTERM SIGINT SIGQUIT

# Check system resources
check_memory

# Clean up any existing processes
cleanup_existing

# Verify build exists
if [ ! -f "dist/index-production.js" ] && [ ! -f "dist/index-minimal.js" ]; then
    echo "❌ No production build found!"
    echo "📦 Building application..."

    if [ "$USE_MINIMAL" = "true" ]; then
        npm run build:minimal || {
            echo "❌ Minimal build failed!"
            exit 1
        }
    else
        npm run build:production || {
            echo "❌ Production build failed!"
            exit 1
        }
    fi
fi

# Verify client build exists
if [ ! -f "public/index.html" ]; then
    echo "❌ Client build missing!"
    echo "📦 Building client..."
    npm run build:client || {
        echo "❌ Client build failed!"
        exit 1
    }
fi

# Set port (Namecheap often uses different ports)
export PORT=${PORT:-5005}

# Log system information
echo "📊 System Information:"
echo "  Node.js: $(node --version 2>/dev/null || echo 'Not found')"
echo "  Memory limit: 128MB heap"
echo "  Port: $PORT"
echo "  Working dir: $(pwd)"
echo "  Process ID: $$"

# Choose which build to run based on memory constraints
if [ "$USE_MINIMAL" = "true" ] || [ -f "dist/index-minimal.js" ] && [ ! -f "dist/index-production.js" ]; then
    echo "🚀 Starting minimal server (ultra-low memory mode)..."
    SERVER_FILE="dist/index-minimal.js"
    MEMORY_LIMIT=128
else
    echo "🚀 Starting optimized production server..."
    SERVER_FILE="dist/index-production.js"
    MEMORY_LIMIT=256
fi

# Create logs directory
mkdir -p logs

# Start the application with maximum memory constraints
echo "▶️  Launching Node.js application..."

# Use nohup to ensure process continues even if SSH disconnects
nohup node \
    --expose-gc \
    --max-old-space-size=$MEMORY_LIMIT \
    --optimize-for-size \
    --gc-interval=50 \
    --max-semi-space-size=1 \
    --initial-old-space-size=4 \
    --no-global-gc-scheduling \
    --memory-reducer \
    $SERVER_FILE \
    > logs/namecheap.log 2>&1 &

APP_PID=$!

echo "✅ Application started with PID: $APP_PID"
echo "📄 Logs: logs/namecheap.log"

# Wait a moment and check if the process is still running
sleep 3

if kill -0 $APP_PID 2>/dev/null; then
    echo "✅ Server is running successfully"

    # Start background memory monitoring
    monitor_and_restart $APP_PID &
    MONITOR_PID=$!

    # Wait for the main process
    wait $APP_PID

    # Clean up monitor
    kill $MONITOR_PID 2>/dev/null || true
else
    echo "❌ Server failed to start"
    echo "📄 Last 20 lines of log:"
    tail -20 logs/namecheap.log 2>/dev/null || echo "No log file found"
    exit 1
fi

echo "🏁 Application has exited"
