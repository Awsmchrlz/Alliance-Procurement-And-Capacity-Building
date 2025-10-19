#!/bin/bash
# Docker Build Test Script

set -e

# Colors
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m'

echo -e "${BLUE}╔════════════════════════════════════════════════════════╗${NC}"
echo -e "${BLUE}║  Testing Docker Build                                  ║${NC}"
echo -e "${BLUE}╚════════════════════════════════════════════════════════╝${NC}"
echo ""

# Check if Docker is running
if ! docker info &> /dev/null; then
    echo -e "${RED}✗ Docker is not running${NC}"
    exit 1
fi

echo -e "${GREEN}✓${NC} Docker is running"
echo ""

# Build the image
echo -e "${YELLOW}Building Docker image...${NC}"
if docker build -t apcb-platform:test . ; then
    echo -e "${GREEN}✓${NC} Docker image built successfully"
else
    echo -e "${RED}✗${NC} Docker build failed"
    exit 1
fi

echo ""

# Check image size
IMAGE_SIZE=$(docker images apcb-platform:test --format "{{.Size}}")
echo -e "${BLUE}Image size: ${IMAGE_SIZE}${NC}"

echo ""

# Inspect the image
echo -e "${YELLOW}Inspecting image...${NC}"
docker inspect apcb-platform:test > /dev/null 2>&1
if [ $? -eq 0 ]; then
    echo -e "${GREEN}✓${NC} Image inspection passed"
    
    # Check for expected files
    echo -e "${YELLOW}Checking image contents...${NC}"
    
    if docker run --rm apcb-platform:test ls /app/dist/index.js > /dev/null 2>&1; then
        echo -e "${GREEN}✓${NC} dist/index.js exists"
    else
        echo -e "${RED}✗${NC} dist/index.js not found"
        exit 1
    fi
    
    if docker run --rm apcb-platform:test ls /app/node_modules > /dev/null 2>&1; then
        echo -e "${GREEN}✓${NC} node_modules exists"
    else
        echo -e "${RED}✗${NC} node_modules not found"
        exit 1
    fi
else
    echo -e "${RED}✗${NC} Image inspection failed"
    exit 1
fi

echo ""

# Test if the container can start (without actually running it)
echo -e "${YELLOW}Testing container startup...${NC}"
CONTAINER_ID=$(docker create apcb-platform:test)
if [ $? -eq 0 ]; then
    echo -e "${GREEN}✓${NC} Container can be created"
    docker rm $CONTAINER_ID > /dev/null
else
    echo -e "${RED}✗${NC} Container creation failed"
    exit 1
fi

echo ""

# Clean up
echo -e "${YELLOW}Cleaning up test image...${NC}"
docker rmi apcb-platform:test > /dev/null 2>&1
echo -e "${GREEN}✓${NC} Test image removed"

echo ""
echo -e "${GREEN}╔════════════════════════════════════════════════════════╗${NC}"
echo -e "${GREEN}║  All Docker tests passed!                              ║${NC}"
echo -e "${GREEN}╚════════════════════════════════════════════════════════╝${NC}"
echo ""
echo -e "${BLUE}Your Docker setup is working correctly.${NC}"
echo ""
echo -e "${YELLOW}To build for production:${NC}"
echo "  docker build -t yourusername/apcb-platform:latest ."
echo ""
echo -e "${YELLOW}To run locally:${NC}"
echo "  docker-compose up -d"
