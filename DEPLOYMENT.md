# Kubernetes Deployment Guide

## Quick Deploy

```bash
# 1. Apply secrets (contains API keys - not in git)
kubectl apply -f k8s/secrets.yaml

# 2. Apply the deployment
kubectl apply -f k8s/alliance-deployment.yaml

# 3. Check status
kubectl get pods -n alliance

# 4. View logs
kubectl logs -f deployment/alliance-app -n alliance
```

## What Happens Automatically

1. **GitHub Actions** (on push to main):
   - Runs tests
   - Builds application
   - Creates Docker image
   - Pushes to Docker Hub: `awsmchrlz/alliance-procurement-and-capacity-building:latest`

2. **Kubernetes Deployment**:
   - Creates namespace: `alliance`
   - Creates ConfigMap with non-sensitive config
   - Creates Secret with API keys and credentials
   - Deploys 2 replicas of the app
   - Sets up service and ingress

## Update Environment Variables

**Non-sensitive config:** Edit `k8s/alliance-deployment.yaml` ConfigMap section

**Secrets (API keys):** Edit `k8s/secrets.yaml`

Then apply changes:

```bash
kubectl apply -f k8s/secrets.yaml
kubectl apply -f k8s/alliance-deployment.yaml
kubectl rollout restart deployment/alliance-app -n alliance
```

## Verify Deployment

```bash
# Check all resources
kubectl get all -n alliance

# Check ingress
kubectl get ingress -n alliance

# Check logs
kubectl logs -f deployment/alliance-app -n alliance

# Check environment variables in pod
kubectl exec -it deployment/alliance-app -n alliance -- env | grep -E "SUPABASE|BREVO"
```

## Troubleshooting

```bash
# Describe pod for events
kubectl describe pod -n alliance -l app=alliance

# Get pod logs with timestamps
kubectl logs -f deployment/alliance-app -n alliance --timestamps

# Check secrets (values are hidden)
kubectl describe secret alliance-secrets -n alliance

# Check configmap
kubectl describe configmap alliance-config -n alliance
```

## Domains

The app is accessible at:
- https://allianceprocurementandcapacitybuilding.org
- https://www.allianceprocurementandcapacitybuilding.org
- https://allianceprocurementandcapacitybuilding.org.zm
- https://www.allianceprocurementandcapacitybuilding.org.zm
