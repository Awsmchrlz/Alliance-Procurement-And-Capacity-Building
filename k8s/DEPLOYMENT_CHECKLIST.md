# Kubernetes Deployment Checklist

## Pre-Deployment

### Infrastructure
- [ ] Kubernetes cluster is running (v1.24+)
- [ ] kubectl is configured and can access the cluster
- [ ] Nginx Ingress Controller is installed
- [ ] Persistent storage provisioner is available
- [ ] Monitoring stack is installed (optional: Prometheus/Grafana)

### Configuration
- [ ] Docker image is built and pushed to Docker Hub
- [ ] Secrets are prepared (Supabase keys, Resend API key)
- [ ] Domain DNS is configured
- [ ] SSL certificates are ready (if not using Cloudflare)

## Deployment Steps

### 1. Update Configuration Files

```bash
# Update image name in k8s/apcb-deployment.yaml
sed -i 's/yourusername/your-actual-username/g' k8s/apcb-deployment.yaml

# Update domain in ingress section
sed -i 's/apcb.org/your-domain.com/g' k8s/apcb-deployment.yaml
```

### 2. Create Secrets

```bash
# Copy example secrets
cp k8s/secrets.example.yaml k8s/secrets.yaml

# Edit with your actual secrets
nano k8s/secrets.yaml

# Apply secrets
kubectl apply -f k8s/secrets.yaml
```

### 3. Deploy Application

```bash
# Option A: Direct apply
kubectl apply -f k8s/apcb-deployment.yaml

# Option B: Use deployment script
./k8s/deploy.sh production

# Option C: Use kustomize
kubectl apply -k k8s/overlays/production/
```

### 4. Verify Deployment

```bash
# Check namespace
kubectl get namespace apcb-system

# Check pods
kubectl get pods -n apcb-system

# Check services
kubectl get svc -n apcb-system

# Check ingress
kubectl get ingress -n apcb-system

# Check HPA
kubectl get hpa -n apcb-system
```

### 5. Test Application

```bash
# Port forward for local testing
kubectl port-forward svc/apcb-service 3000:80 -n apcb-system

# Test in browser
open http://localhost:3000

# Or test via curl
curl http://localhost:3000/api/events
```

## Post-Deployment

### Monitoring
- [ ] Check pod logs: `kubectl logs -f deployment/apcb-app -n apcb-system`
- [ ] Verify metrics endpoint (if configured)
- [ ] Set up alerts in Prometheus/Grafana
- [ ] Configure uptime monitoring

### Security
- [ ] Verify network policies are applied
- [ ] Check RBAC permissions
- [ ] Review security context settings
- [ ] Scan for vulnerabilities

### Performance
- [ ] Monitor resource usage
- [ ] Verify HPA is working
- [ ] Check response times
- [ ] Load test the application

### Backup
- [ ] Verify PVC backups are configured
- [ ] Test restore procedure
- [ ] Document backup locations

## Rollback Procedure

If deployment fails:

```bash
# Check what went wrong
kubectl describe pod <pod-name> -n apcb-system
kubectl logs <pod-name> -n apcb-system

# Rollback to previous version
kubectl rollout undo deployment/apcb-app -n apcb-system

# Or rollback to specific revision
kubectl rollout history deployment/apcb-app -n apcb-system
kubectl rollout undo deployment/apcb-app --to-revision=2 -n apcb-system
```

## Troubleshooting

### Pods not starting
```bash
kubectl describe pod <pod-name> -n apcb-system
kubectl logs <pod-name> -n apcb-system
```

### Service not accessible
```bash
kubectl get endpoints -n apcb-system
kubectl describe svc apcb-service -n apcb-system
```

### Ingress not working
```bash
kubectl describe ingress apcb-ingress -n apcb-system
kubectl logs -n ingress-nginx deployment/ingress-nginx-controller
```

### Storage issues
```bash
kubectl get pvc -n apcb-system
kubectl describe pvc apcb-storage-pvc -n apcb-system
```

## Maintenance

### Update Application
```bash
# Update image tag
kubectl set image deployment/apcb-app apcb=yourusername/apcb-platform:v2.1.0 -n apcb-system

# Or edit deployment
kubectl edit deployment apcb-app -n apcb-system
```

### Scale Application
```bash
# Manual scaling
kubectl scale deployment apcb-app --replicas=5 -n apcb-system

# HPA will auto-scale based on metrics
```

### Update Secrets
```bash
# Edit secrets
kubectl edit secret apcb-secrets -n apcb-system

# Restart pods to pick up new secrets
kubectl rollout restart deployment/apcb-app -n apcb-system
```

## Clean Up

To remove the deployment:

```bash
# Delete all resources
kubectl delete -f k8s/apcb-deployment.yaml

# Or delete namespace (removes everything)
kubectl delete namespace apcb-system
```
