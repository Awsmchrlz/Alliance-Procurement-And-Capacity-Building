#!/bin/bash
set -e

echo "🚀 Starting Alliance Procurement deployment..."

# Colors for output
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m' # No Color

# Check if kubectl is available
if ! command -v kubectl &> /dev/null; then
    echo -e "${RED}❌ kubectl not found. Please install kubectl first.${NC}"
    exit 1
fi

# Step 1: Apply all resources (namespace, configmap, deployment, service, and ingress)
echo -e "${YELLOW}📦 Applying all resources...${NC}"
kubectl apply -f alliance-deployment.yaml
echo -e "${GREEN}✅ Resources applied${NC}"

# Step 2: Apply cert-manager ClusterIssuer (if exists)
if [ -f "cert-issuer.yaml" ]; then
    echo -e "${YELLOW}🔒 Applying cert-manager ClusterIssuer...${NC}"
    kubectl apply -f cert-issuer.yaml
    echo -e "${GREEN}✅ ClusterIssuer applied${NC}"
fi

# Step 3: Wait for deployment to be ready
echo -e "${YELLOW}⏳ Waiting for deployment to be ready (this may take a minute)...${NC}"
kubectl rollout status deployment/alliance-app -n alliance --timeout=300s

# Step 4: Check pod status
echo -e "${YELLOW}📊 Pod status:${NC}"
kubectl get pods -n alliance

# Step 5: Check service
echo -e "${YELLOW}🌐 Service status:${NC}"
kubectl get svc -n alliance

# Step 6: Check ingress
echo -e "${YELLOW}🔗 Ingress status:${NC}"
kubectl get ingress -n alliance

# Step 7: Check certificates (if cert-manager is installed)
if kubectl get crd certificates.cert-manager.io &> /dev/null; then
    echo -e "${YELLOW}📜 Certificate status:${NC}"
    kubectl get certificates -n alliance 2>/dev/null || echo "No certificates yet (will be created automatically)"
fi

echo ""
echo -e "${GREEN}✅ Deployment complete!${NC}"
echo ""
echo "📋 Useful commands:"
echo "  View logs:        kubectl logs -f deployment/alliance-app -n alliance"
echo "  Restart pods:     kubectl rollout restart deployment/alliance-app -n alliance"
echo "  Port forward:     kubectl port-forward -n alliance svc/alliance-service 8080:80"
echo "  Describe ingress: kubectl describe ingress alliance-ingress -n alliance"
echo ""
