# 🚀 Deploy to Kubernetes

## Quick Deploy (2 Commands)

```bash
# 1. Create secrets
./k8s/create-secrets.sh

# 2. Deploy application
kubectl apply -f k8s/alliance-deployment.yaml
```

## Verify

```bash
# Check pods
kubectl get pods -n alliance

# View logs
kubectl logs -f deployment/alliance-app -n alliance
```

## Update Application

After pushing code to GitHub:

```bash
kubectl rollout restart deployment/alliance-app -n alliance
```

## Access

https://allianceprocurementandcapacitybuilding.org

## What's Configured

✅ Database connection
✅ Supabase (URL, Service Role Key, Anon Key)
✅ Brevo email API
✅ Session security
✅ All environment variables
✅ 2 replicas for high availability
✅ Health checks
✅ Ingress for all domains
