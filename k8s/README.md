# Kubernetes Deployment Guide

## Prerequisites

- Kubernetes cluster (v1.24+)
- kubectl configured
- Nginx Ingress Controller installed
- Persistent storage provisioner

## Quick Deploy

```bash
# Apply all resources
kubectl apply -f k8s/apcb-deployment.yaml

# Or use kustomize
kubectl apply -k k8s/
```

## Configuration

### 1. Update Secrets

Edit `k8s/apcb-deployment.yaml` and update the secrets:

```yaml
stringData:
  SUPABASE_SERVICE_ROLE_KEY: "your-actual-key"
  SUPABASE_ANON_KEY: "your-actual-key"
  RESEND_API_KEY: "your-actual-key"
```

### 2. Update Domain

Replace `apcb.org` with your domain in the Ingress section.

### 3. Update Docker Image

Replace `yourusername/apcb-platform` with your Docker Hub image.

## Verify Deployment

```bash
# Check pods
kubectl get pods -n apcb-system

# Check services
kubectl get svc -n apcb-system

# Check ingress
kubectl get ingress -n apcb-system

# View logs
kubectl logs -f deployment/apcb-app -n apcb-system
```

## Scaling

```bash
# Manual scaling
kubectl scale deployment apcb-app --replicas=5 -n apcb-system

# HPA will auto-scale based on CPU/memory
```

## Troubleshooting

```bash
# Describe pod
kubectl describe pod <pod-name> -n apcb-system

# Get events
kubectl get events -n apcb-system --sort-by='.lastTimestamp'

# Port forward for testing
kubectl port-forward svc/apcb-service 3000:80 -n apcb-system
```
