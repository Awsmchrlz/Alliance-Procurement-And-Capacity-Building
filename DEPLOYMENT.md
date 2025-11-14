# Kubernetes Deployment Guide

## Initial Setup

### 1. Create Secrets
```bash
./k8s/create-secrets.sh
```

This creates a Kubernetes secret with:
- DATABASE_URL
- SUPABASE_URL
- SUPABASE_SERVICE_ROLE_KEY
- SUPABASE_ANON_KEY
- BREVO_API_KEY
- SESSION_SECRET

### 2. Deploy Application
```bash
kubectl apply -f k8s/alliance-deployment.yaml
```

This creates:
- Namespace: `alliance`
- ConfigMap: Non-sensitive configuration
- Deployment: 2 replicas of the app
- Service: Internal load balancer
- Ingress: External access

## Verify Deployment

```bash
# Check all resources
kubectl get all -n alliance

# View pod logs
kubectl logs -f deployment/alliance-app -n alliance

# Check pod status
kubectl describe pod -n alliance -l app=alliance
```

## Update Application

### Update Code
1. Push to GitHub main branch
2. GitHub Actions builds and pushes Docker image
3. Restart deployment:
```bash
kubectl rollout restart deployment/alliance-app -n alliance
```

### Update Secrets
1. Edit `k8s/create-secrets.sh`
2. Run: `./k8s/create-secrets.sh`
3. Restart: `kubectl rollout restart deployment/alliance-app -n alliance`

### Update Configuration
1. Edit `k8s/alliance-deployment.yaml` (ConfigMap section)
2. Apply: `kubectl apply -f k8s/alliance-deployment.yaml`
3. Restart: `kubectl rollout restart deployment/alliance-app -n alliance`

## Troubleshooting

```bash
# View recent logs
kubectl logs --tail=100 deployment/alliance-app -n alliance

# Check environment variables
kubectl exec -it deployment/alliance-app -n alliance -- env | sort

# Check secrets (values hidden)
kubectl describe secret alliance-secrets -n alliance

# Check events
kubectl get events -n alliance --sort-by='.lastTimestamp'
```

## Domains

The application is accessible at:
- https://allianceprocurementandcapacitybuilding.org
- https://www.allianceprocurementandcapacitybuilding.org
- https://allianceprocurementandcapacitybuilding.org.zm
- https://www.allianceprocurementandcapacitybuilding.org.zm

## Architecture

- **Replicas**: 2 (high availability)
- **Resources**: 256Mi-1Gi memory, 200m-1000m CPU
- **Health Checks**: Liveness and readiness probes
- **Session Affinity**: ClientIP (sticky sessions)
- **Image**: `awsmchrlz/alliance-procurement-and-capacity-building:latest`
