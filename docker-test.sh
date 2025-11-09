#!/bin/bash

# Docker Image Test Script
# Tests the Docker image locally before pushing

set -e

GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m'

IMAGE_NAME="apcb-platform:test"

echo -e "${YELLOW}=== Docker Image Test ===${NC}\n"

# Build the image
echo -e "${YELLOW}Building Docker image...${NC}"
docker build -t ${IMAGE_NAME} .

if [ $? -ne 0 ]; then
    echo -e "${RED}❌ Build failed${NC}"
    exit 1
fi

echo -e "${GREEN}✅ Build successful${NC}\n"

# Check image size
echo -e "${YELLOW}Image size:${NC}"
docker images ${IMAGE_NAME} --format "table {{.Repository}}\t{{.Tag}}\t{{.Size}}"
echo ""

# Check image layers
echo -e "${YELLOW}Image layers:${NC}"
docker history ${IMAGE_NAME} --no-trunc --format "table {{.CreatedBy}}\t{{.Size}}" | head -20
echo ""

# Test run (with mock env vars)
echo -e "${YELLOW}Testing container startup...${NC}"
docker run --rm -d \
  --name apcb-test \
  -p 5001:5001 \
  -e NODE_ENV=production \
  -e PORT=5001 \
  -e DATABASE_URL=postgresql://test:test@localhost:5432/test \
  -e SUPABASE_URL=https://test.supabase.co \
  -e SUPABASE_SERVICE_ROLE_KEY=test-key \
  -e SUPABASE_ANON_KEY=test-key \
  -e SESSION_SECRET=test-secret \
  ${IMAGE_NAME}

# Wait for container to start
echo -e "${YELLOW}Waiting for container to start...${NC}"
sleep 5

# Check if container is running
if docker ps | grep -q apcb-test; then
    echo -e "${GREEN}✅ Container started successfully${NC}\n"
    
    # Show logs
    echo -e "${YELLOW}Container logs:${NC}"
    docker logs apcb-test
    echo ""
    
    # Stop container
    echo -e "${YELLOW}Stopping test container...${NC}"
    docker stop apcb-test
    echo -e "${GREEN}✅ Test complete${NC}\n"
else
    echo -e "${RED}❌ Container failed to start${NC}"
    docker logs apcb-test 2>/dev/null || true
    docker rm -f apcb-test 2>/dev/null || true
    exit 1
fi

# Summary
echo -e "${GREEN}=== Test Summary ===${NC}"
echo -e "Image: ${IMAGE_NAME}"
echo -e "Status: ${GREEN}Ready for production${NC}"
echo ""
echo -e "${YELLOW}Next steps:${NC}"
echo -e "1. Tag for Docker Hub: docker tag ${IMAGE_NAME} YOUR_USERNAME/apcb-platform:latest"
echo -e "2. Push to Docker Hub: docker push YOUR_USERNAME/apcb-platform:latest"
echo ""
