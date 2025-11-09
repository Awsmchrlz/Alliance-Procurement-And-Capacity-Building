#!/bin/bash

# Docker Hub Push Script for Alliance Procurement Application
# This script builds and pushes the Docker image to Docker Hub

set -e  # Exit on error

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

echo -e "${GREEN}=== Alliance Procurement Docker Build & Push ===${NC}\n"

# Check if Docker is running
if ! docker info > /dev/null 2>&1; then
    echo -e "${RED}Error: Docker is not running. Please start Docker and try again.${NC}"
    exit 1
fi

# Get Docker Hub username
read -p "Enter your Docker Hub username: " DOCKER_USERNAME

if [ -z "$DOCKER_USERNAME" ]; then
    echo -e "${RED}Error: Docker Hub username is required${NC}"
    exit 1
fi

# Get image name (default: alliance-procurement)
read -p "Enter image name [alliance-procurement]: " IMAGE_NAME
IMAGE_NAME=${IMAGE_NAME:-alliance-procurement}

# Get version tag (default: latest)
read -p "Enter version tag [latest]: " VERSION_TAG
VERSION_TAG=${VERSION_TAG:-latest}

# Full image name
FULL_IMAGE_NAME="${DOCKER_USERNAME}/${IMAGE_NAME}:${VERSION_TAG}"

echo -e "\n${YELLOW}Building Docker image: ${FULL_IMAGE_NAME}${NC}\n"

# Build the Docker image
docker build -t "${FULL_IMAGE_NAME}" .

if [ $? -ne 0 ]; then
    echo -e "${RED}Error: Docker build failed${NC}"
    exit 1
fi

echo -e "\n${GREEN}✓ Docker image built successfully${NC}\n"

# Also tag as latest if not already
if [ "$VERSION_TAG" != "latest" ]; then
    docker tag "${FULL_IMAGE_NAME}" "${DOCKER_USERNAME}/${IMAGE_NAME}:latest"
    echo -e "${GREEN}✓ Tagged as latest${NC}\n"
fi

# Login to Docker Hub
echo -e "${YELLOW}Logging in to Docker Hub...${NC}\n"
docker login

if [ $? -ne 0 ]; then
    echo -e "${RED}Error: Docker Hub login failed${NC}"
    exit 1
fi

echo -e "\n${GREEN}✓ Logged in to Docker Hub${NC}\n"

# Push the image
echo -e "${YELLOW}Pushing image to Docker Hub: ${FULL_IMAGE_NAME}${NC}\n"
docker push "${FULL_IMAGE_NAME}"

if [ $? -ne 0 ]; then
    echo -e "${RED}Error: Docker push failed${NC}"
    exit 1
fi

# Push latest tag if created
if [ "$VERSION_TAG" != "latest" ]; then
    echo -e "\n${YELLOW}Pushing latest tag...${NC}\n"
    docker push "${DOCKER_USERNAME}/${IMAGE_NAME}:latest"
fi

echo -e "\n${GREEN}=== SUCCESS ===${NC}"
echo -e "${GREEN}✓ Image pushed to Docker Hub: ${FULL_IMAGE_NAME}${NC}"
if [ "$VERSION_TAG" != "latest" ]; then
    echo -e "${GREEN}✓ Also available as: ${DOCKER_USERNAME}/${IMAGE_NAME}:latest${NC}"
fi

echo -e "\n${YELLOW}To pull this image on another machine:${NC}"
echo -e "  docker pull ${FULL_IMAGE_NAME}"

echo -e "\n${YELLOW}To run this image:${NC}"
echo -e "  docker run -p 5001:5001 --env-file .env ${FULL_IMAGE_NAME}"

echo -e "\n${YELLOW}Or use docker-compose:${NC}"
echo -e "  Update docker-compose.yml to use: image: ${FULL_IMAGE_NAME}"
echo -e "  Then run: docker-compose up -d"

echo -e "\n${GREEN}Done!${NC}\n"
