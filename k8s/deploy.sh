#!/bin/bash
# APCB Kubernetes Deployment Script

set -e

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Configuration
NAMESPACE="apcb-system"
DEPLOYMENT_NAME="apcb-app"
ENVIRONMENT="${1:-production}"

echo -e "${GREEN}🚀 Starting APCB Deployment${NC}"
echo -e "${YELLOW}Environment: ${ENVIRONMENT}${NC}"
echo ""

# Check if kubectl is installed
if ! command -v kubectl &> /dev/null; then
    echo -e "${RED}❌ kubectl is not installed${NC}"
    exit 1
fi

# Check if cluster is accessible
if ! kubectl cluster-info &> /dev/null; then
    echo -e "${RED}❌ Cannot connect to Kubernetes cluster${NC}"
    exit 1
fi

echo -e "${GREEN}✅ Kubernetes cluster is accessible${NC}"

# Create namespace if it doesn't exist
if ! kubectl get namespace ${NAMESPACE} &> /dev/null; then
    echo -e "${YELLOW}📦 Creating namespace: ${NAMESPACE}${NC}"
    kubectl create namespace ${NAMESPACE}
else
    echo -e "${GREEN}✅ Namespace ${NAMESPACE} already exists${NC}"
fi

# Apply configuration based on environment
if [ "${ENVIRONMENT}" == "production" ]; then
    echo -e "${YELLOW}🔧 Deploying to production...${NC}"
    kubectl apply -k k8s/overlays/production/
elif [ "${ENVIRONMENT}" == "staging" ]; then
    echo -e "${YELLOW}🔧 Deploying to staging...${NC}"
    kubectl apply -k k8s/overlays/staging/
else
    echo -e "${YELLOW}🔧 Deploying base configuration...${NC}"
    kubectl apply -f k8s/apcb-deployment.yaml
fi

# Wait for deployment to be ready
echo -e "${YELLOW}⏳ Waiting for deployment to be ready...${NC}"
kubectl rollout status deployment/${DEPLOYMENT_NAME} -n ${NAMESPACE} --timeout=5m

# Check pod status
echo -e "${GREEN}📊 Pod Status:${NC}"
kubectl get pods -n ${NAMESPACE} -l app=apcb

# Check service status
echo -e "${GREEN}🌐 Service Status:${NC}"
kubectl get svc -n ${NAMESPACE}

# Check ingress status
echo -e "${GREEN}🔗 Ingress Status:${NC}"
kubectl get ingress -n ${NAMESPACE}

echo ""
echo -e "${GREEN}✅ Deployment completed successfully!${NC}"
echo ""
echo -e "${YELLOW}Useful commands:${NC}"
echo -e "  View logs:        kubectl logs -f deployment/${DEPLOYMENT_NAME} -n ${NAMESPACE}"
echo -e "  Scale:            kubectl scale deployment/${DEPLOYMENT_NAME} --replicas=3 -n ${NAMESPACE}"
echo -e "  Port forward:     kubectl port-forward svc/apcb-service 3000:80 -n ${NAMESPACE}"
echo -e "  Delete:           kubectl delete -f k8s/apcb-deployment.yaml"
