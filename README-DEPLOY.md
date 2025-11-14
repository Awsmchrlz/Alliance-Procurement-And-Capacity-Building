# 🚀 Alliance Procurement - Deployment

## Overview

This project uses a clean CI/CD pipeline:
1. **Push to GitHub** → Triggers GitHub Actions
2. **GitHub Actions** → Tests, builds, and pushes Docker image to Docker Hub
3. **Kubernetes** → Pulls latest image and deploys

## Files Structure

```
k8s/
├── alliance-deployment.yaml  # Main deployment (committed to git)
└── secrets.yaml              # API keys & secrets (NOT in git, local only)
```

## Deploy to Kubernetes

### Step 1: Apply Secrets
```bash
kubectl apply -f k8s/secrets.yaml
```

### Step 2: Apply Deployment
```bash
kubectl apply -f k8s/alliance-deployment.yaml
```

### Step 3: Verify
```bash
# Check pods
kubectl get pods -n alliance

# Check logs
kubectl logs -f deployment/alliance-app -n alliance
```

## Environment Variables

### Non-Sensitive (in alliance-deployment.yaml)
- `NODE_ENV=production`
- `PORT=5005`
- `FRONTEND_URL=https://allianceprocurementandcapacitybuilding.org`
- `BREVO_SENDER_EMAIL=globaltrainingalliance@gmail.com`
- `BREVO_SENDER_NAME=Alliance Procurement & Capacity Building`
- `ADMIN_EMAIL=chisalecharles23@gmail.com`
- `SUPABASE_URL=https://huwkexajyeacooznhadq.supabase.co`

### Sensitive (in secrets.yaml - not committed)
- `DATABASE_URL` - PostgreSQL connection string
- `SUPABASE_SERVICE_ROLE_KEY` - Supabase service role key
- `SUPABASE_ANON_KEY` - Supabase anonymous key
- `BREVO_API_KEY` - Email service API key
- `SESSION_SECRET` - Session encryption key

## Update Deployment

### Update Non-Sensitive Config
1. Edit `k8s/alliance-deployment.yaml`
2. Apply: `kubectl apply -f k8s/alliance-deployment.yaml`
3. Restart: `kubectl rollout restart deployment/alliance-app -n alliance`

### Update Secrets
1. Edit `k8s/secrets.yaml`
2. Apply: `kubectl apply -f k8s/secrets.yaml`
3. Restart: `kubectl rollout restart deployment/alliance-app -n alliance`

### Update Application Code
1. Push to GitHub main branch
2. GitHub Actions builds and pushes new Docker image
3. Update deployment: `kubectl rollout restart deployment/alliance-app -n alliance`

## Troubleshooting

```bash
# Check pod status
kubectl get pods -n alliance

# View logs
kubectl logs -f deployment/alliance-app -n alliance

# Check environment variables
kubectl exec -it deployment/alliance-app -n alliance -- env | grep -E "SUPABASE|BREVO"

# Describe pod for events
kubectl describe pod -n alliance -l app=alliance

# Check secrets (values hidden)
kubectl describe secret alliance-secrets -n alliance
```

## Domains

The application is accessible at:
- https://allianceprocurementandcapacitybuilding.org
- https://www.allianceprocurementandcapacitybuilding.org
- https://allianceprocurementandcapacitybuilding.org.zm
- https://www.allianceprocurementandcapacitybuilding.org.zm

## CI/CD Pipeline

GitHub Actions workflow (`.github/workflows/docker-build-push.yml`):
1. **Test** - Runs TypeScript type checking
2. **Build** - Builds the application
3. **Docker** - Builds and pushes image to Docker Hub

Docker image: `awsmchrlz/alliance-procurement-and-capacity-building:latest`
