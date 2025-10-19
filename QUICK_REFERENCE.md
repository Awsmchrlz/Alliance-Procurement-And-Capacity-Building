# Quick Reference Guide

## 🚀 Common Commands

### Docker

```bash
# Build image
docker build -t apcb-platform .

# Run container
docker run -d -p 3000:3000 --env-file .env apcb-platform

# View logs
docker logs -f <container-id>

# Stop container
docker stop <container-id>

# Docker Compose
docker-compose up -d
docker-compose down
docker-compose logs -f
```

### Kubernetes

```bash
# Deploy
kubectl apply -f k8s/apcb-deployment.yaml
./k8s/deploy.sh production

# Check status
kubectl get pods -n apcb-system
kubectl get svc -n apcb-system
kubectl get ingress -n apcb-system

# View logs
kubectl logs -f deployment/apcb-app -n apcb-system

# Scale
kubectl scale deployment apcb-app --replicas=5 -n apcb-system

# Update image
kubectl set image deployment/apcb-app apcb=yourusername/apcb-platform:v2.1.0 -n apcb-system

# Rollback
kubectl rollout undo deployment/apcb-app -n apcb-system

# Delete
kubectl delete -f k8s/apcb-deployment.yaml
```

### GitHub Actions

```bash
# Trigger build
git tag v1.0.0
git push origin v1.0.0

# Or push to main
git push origin main
```

## 📝 Configuration Files

| File | Purpose |
|------|---------|
| `.env` | Environment variables |
| `Dockerfile` | Docker image definition |
| `docker-compose.yml` | Local development setup |
| `k8s/apcb-deployment.yaml` | Kubernetes deployment |
| `k8s/secrets.yaml` | Kubernetes secrets (create from example) |
| `.github/workflows/docker-build-push.yml` | CI/CD pipeline |

## 🔑 Required Secrets

### Docker Hub (GitHub Secrets)
- `DOCKERHUB_USERNAME`
- `DOCKERHUB_TOKEN`

### Application (.env or k8s/secrets.yaml)
- `SUPABASE_URL`
- `SUPABASE_SERVICE_ROLE_KEY`
- `SUPABASE_ANON_KEY`
- `RESEND_API_KEY`

## 🌐 URLs

| Environment | URL |
|-------------|-----|
| Local Dev | http://localhost:5173 |
| Local Docker | http://localhost:3000 |
| Production | https://apcb.org |

## 📊 Monitoring

```bash
# Check pod health
kubectl get pods -n apcb-system

# View metrics
kubectl top pods -n apcb-system

# Check HPA
kubectl get hpa -n apcb-system

# View events
kubectl get events -n apcb-system --sort-by='.lastTimestamp'
```

## 🔧 Troubleshooting

```bash
# Pod not starting
kubectl describe pod <pod-name> -n apcb-system
kubectl logs <pod-name> -n apcb-system

# Service issues
kubectl get endpoints -n apcb-system
kubectl describe svc apcb-service -n apcb-system

# Ingress issues
kubectl describe ingress apcb-ingress -n apcb-system

# Port forward for testing
kubectl port-forward svc/apcb-service 3000:80 -n apcb-system
```

## 📚 Documentation

- [README.md](README.md) - Main docs
- [SETUP.md](SETUP.md) - Setup guide
- [k8s/README.md](k8s/README.md) - K8s guide
- [DOCKER_K8S_SETUP.md](DOCKER_K8S_SETUP.md) - Complete setup summary
