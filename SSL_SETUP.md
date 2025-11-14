# SSL Certificate Setup Guide

## Prerequisites
- Domain DNS pointing to your Kubernetes cluster IP
- cert-manager installed in cluster
- nginx-ingress-controller installed

## Step-by-Step Setup

### 1. Install cert-manager (if not already installed)

```bash
kubectl apply -f https://github.com/cert-manager/cert-manager/releases/download/v1.13.0/cert-manager.yaml

# Wait for cert-manager to be ready
kubectl wait --for=condition=ready pod -l app.kubernetes.io/instance=cert-manager -n cert-manager --timeout=300s
```

### 2. Create Let's Encrypt Issuer

```bash
kubectl apply -f k8s/cert-issuer.yaml
```

### 3. Verify Issuer is Ready

```bash
kubectl get clusterissuer letsencrypt-prod
```

Should show: `READY: True`

### 4. Apply Updated Ingress with SSL

```bash
kubectl apply -f k8s/alliance-deployment.yaml
```

### 5. Check Certificate Status

```bash
# Check certificates
kubectl get certificate -n alliance

# Check certificate details
kubectl describe certificate alliance-org-tls -n alliance
kubectl describe certificate alliance-org-zm-tls -n alliance

# Check certificate requests
kubectl get certificaterequest -n alliance
```

### 6. Monitor Certificate Issuance

```bash
# Watch certificate status (takes 1-5 minutes)
kubectl get certificate -n alliance -w

# Check cert-manager logs if issues
kubectl logs -n cert-manager -l app=cert-manager
```

## Expected Output

After 1-5 minutes, you should see:

```
NAME                  READY   SECRET                AGE
alliance-org-tls      True    alliance-org-tls      2m
alliance-org-zm-tls   True    alliance-org-zm-tls   2m
```

## Verify SSL is Working

```bash
# Test .org domain
curl -I https://allianceprocurementandcapacitybuilding.org

# Test .org.zm domain
curl -I https://allianceprocurementandcapacitybuilding.org.zm
```

Both should return `200 OK` with SSL certificate info.

## Troubleshooting

### Certificate Stuck in "Pending"

```bash
# Check certificate events
kubectl describe certificate alliance-org-tls -n alliance

# Check challenge status
kubectl get challenge -n alliance

# Check ingress
kubectl describe ingress alliance-ingress -n alliance
```

### Common Issues

1. **DNS not pointing to cluster**
   - Verify: `nslookup allianceprocurementandcapacitybuilding.org`
   - Should return your cluster IP

2. **Port 80 not accessible**
   - Let's Encrypt needs HTTP (port 80) for validation
   - Ensure firewall allows port 80

3. **Rate limit hit**
   - Let's Encrypt has rate limits
   - Wait 1 hour and try again
   - Use staging issuer for testing

### Use Staging Issuer for Testing

If you want to test without hitting rate limits:

```yaml
apiVersion: cert-manager.io/v1
kind: ClusterIssuer
metadata:
  name: letsencrypt-staging
spec:
  acme:
    server: https://acme-staging-v02.api.letsencrypt.org/directory
    email: chisalecharles23@gmail.com
    privateKeySecretRef:
      name: letsencrypt-staging
    solvers:
    - http01:
        ingress:
          class: nginx
```

Then update ingress annotation to: `cert-manager.io/cluster-issuer: "letsencrypt-staging"`

## Certificate Auto-Renewal

cert-manager automatically renews certificates 30 days before expiry. No manual intervention needed!

## Manual Certificate Renewal (if needed)

```bash
# Delete certificate to force renewal
kubectl delete certificate alliance-org-tls -n alliance

# Reapply ingress
kubectl apply -f k8s/alliance-deployment.yaml
```

## Check Certificate Expiry

```bash
# Get certificate details
kubectl get secret alliance-org-tls -n alliance -o jsonpath='{.data.tls\.crt}' | base64 -d | openssl x509 -noout -dates
```

## Summary

- ✅ Free SSL certificates from Let's Encrypt
- ✅ Auto-renewal every 60 days
- ✅ Covers all 4 domains (.org and .org.zm with www)
- ✅ HTTPS redirect enabled
- ✅ No manual certificate management needed
