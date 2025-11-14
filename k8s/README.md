# Kubernetes Deployment Guide

## Secure Secrets Management

This deployment uses Kubernetes secrets to securely manage sensitive environment variables.

### Setup Steps

1. **Create your production .env file** (in project root):
```bash
# Copy from .env.example and fill in your production values
cp .env.example .env
```

2. **Generate a new Brevo API key** (your old one was exposed):
   - Go to https://app.brevo.com/settings/keys/api
   - Create a new API key
   - Update your .env file with the new key

3. **Create Kubernetes secrets**:
```bash
./k8s/create-secrets.sh
```

4. **Deploy the application**:
```bash
kubectl apply -f k8s/alliance-deployment.yaml
```

### Manual Secret Creation

If you prefer to create secrets manually:

```bash
# Create namespace
kubectl create namespace alliance

# Create secrets
kubectl create secret generic alliance-secrets \
  --from-literal=DATABASE_URL="your-database-url" \
  --from-literal=SUPABASE_URL="your-supabase-url" \
  --from-literal=SUPABASE_SERVICE_ROLE_KEY="your-service-role-key" \
  --from-literal=SUPABASE_ANON_KEY="your-anon-key" \
  --from-literal=BREVO_API_KEY="your-brevo-api-key" \
  --from-literal=SESSION_SECRET="your-session-secret" \
  --from-literal=ADMIN_EMAIL="your-admin-email" \
  -n alliance
```

### Updating Secrets

To update secrets after deployment:

```bash
# Update your .env file with new values
# Then recreate the secret
kubectl delete secret alliance-secrets -n alliance
./k8s/create-secrets.sh

# Restart pods to pick up new secrets
kubectl rollout restart deployment/alliance-app -n alliance
```

### Verify Deployment

```bash
# Check pods
kubectl get pods -n alliance

# Check logs
kubectl logs -f deployment/alliance-app -n alliance

# Check secrets (won't show values)
kubectl describe secret alliance-secrets -n alliance
```

### Security Best Practices

- ✅ Never commit .env files to git
- ✅ Use different secrets for dev/staging/production
- ✅ Rotate API keys regularly
- ✅ Use RBAC to restrict secret access
- ✅ Consider using sealed-secrets or external secret managers for production
