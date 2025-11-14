#!/bin/bash
# Alliance Procurement - Secure Kubernetes Secrets Creator
# This script creates Kubernetes secrets from your local .env file

set -e

echo "🔐 Alliance Procurement - Kubernetes Secrets Setup"
echo "=================================================="
echo ""

# Check if .env file exists
if [ ! -f ".env" ]; then
    echo "❌ .env file not found in current directory"
    echo "Please create a .env file with your production values"
    exit 1
fi

# Check if kubectl is available
if ! command -v kubectl &> /dev/null; then
    echo "❌ kubectl not found. Please install kubectl first."
    exit 1
fi

echo "📋 Found .env file"
echo ""

# Create namespace if it doesn't exist
echo "Creating namespace 'alliance'..."
kubectl create namespace alliance --dry-run=client -o yaml | kubectl apply -f -

echo ""
echo "Creating secrets from .env file..."

# Delete existing secret if it exists
kubectl delete secret alliance-secrets -n alliance --ignore-not-found=true

# Create secret from .env file
kubectl create secret generic alliance-secrets \
  --from-env-file=.env \
  -n alliance

echo ""
echo "✅ Secrets created successfully!"
echo ""
echo "🔍 To verify secrets:"
echo "   kubectl get secrets -n alliance"
echo "   kubectl describe secret alliance-secrets -n alliance"
echo ""
echo "🚀 To deploy the application:"
echo "   kubectl apply -f k8s/alliance-deployment.yaml"
echo ""
echo "⚠️  Security reminder:"
echo "   - Never commit .env file to git"
echo "   - Rotate your API keys regularly"
echo "   - Use RBAC to restrict secret access"
