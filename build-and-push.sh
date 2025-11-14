#!/bin/bash
set -e

echo "🐳 Building and Pushing Docker Image"
echo "====================================="
echo ""

# Check if Docker is running
if ! docker info > /dev/null 2>&1; then
    echo "❌ Docker is not running!"
    echo "Please start Docker Desktop and run this script again."
    exit 1
fi

echo "✅ Docker is running"
echo ""

# Build the image
echo "🔨 Building Docker image..."
docker build -t awsmchrlz/alliance-procurement-and-capacity-building:latest .

if [ $? -ne 0 ]; then
    echo "❌ Build failed!"
    exit 1
fi

echo ""
echo "✅ Build successful!"
echo ""

# Push to Docker Hub
echo "📤 Pushing to Docker Hub..."
docker push awsmchrlz/alliance-procurement-and-capacity-building:latest

if [ $? -ne 0 ]; then
    echo "❌ Push failed! Make sure you're logged in to Docker Hub:"
    echo "   docker login"
    exit 1
fi

echo ""
echo "✅ Successfully pushed to Docker Hub!"
echo ""
echo "🚀 Next steps:"
echo "   1. Restart Kubernetes deployment:"
echo "      kubectl rollout restart deployment/alliance-app -n alliance"
echo ""
echo "   2. Watch pods restart:"
echo "      kubectl get pods -n alliance -w"
