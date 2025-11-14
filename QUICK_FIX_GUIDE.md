# 🚀 Quick Fix Guide - Get Your App Working Again

## The Problem
1. ❌ Brevo API key was exposed and invalidated
2. ❌ Missing SUPABASE_ANON_KEY in your .env
3. ❌ Login and password reset not working

## The Solution (5 Minutes)

### Step 1: Get Your Supabase Anon Key
```bash
# Go to: https://supabase.com/dashboard/project/huwkexajyeacooznhadq/settings/api
# Copy the "anon public" key
# It looks like: eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

### Step 2: Generate New Brevo API Key
```bash
# Go to: https://app.brevo.com/settings/keys/api
# 1. Delete the old exposed key
# 2. Click "Generate a new API key"
# 3. Copy the new key (starts with xkeysib-)
```

### Step 3: Update Your .env File
```bash
# Edit your .env file and add/update these lines:
SUPABASE_ANON_KEY=your-anon-key-from-step-1
BREVO_API_KEY=your-new-key-from-step-2
SESSION_SECRET=$(openssl rand -base64 32)
```

### Step 4: Deploy to Kubernetes
```bash
# Create secrets from your updated .env
./k8s/create-secrets.sh

# Deploy the application
kubectl apply -f k8s/alliance-deployment.yaml

# Restart pods to pick up new secrets
kubectl rollout restart deployment/alliance-app -n alliance

# Watch the pods restart
kubectl get pods -n alliance -w
```

### Step 5: Verify It's Working
```bash
# Check pod logs
kubectl logs -f deployment/alliance-app -n alliance

# You should see:
# ✅ Server running on port 5005
# ✅ No Brevo API errors
```

## Test Login
1. Go to your site: https://allianceprocurementandcapacitybuilding.org/login
2. Try logging in with: chisale@gmail.com
3. Should work now! ✅

## Test Password Reset
1. Go to: https://allianceprocurementandcapacitybuilding.org/forgot-password
2. Enter your email
3. Should receive reset email ✅

## If Still Having Issues

### Check Secrets Are Loaded
```bash
kubectl describe secret alliance-secrets -n alliance
# Should show all your environment variables (values hidden)
```

### Check Pod Logs for Errors
```bash
kubectl logs -f deployment/alliance-app -n alliance | grep -i error
```

### Verify Environment Variables in Pod
```bash
kubectl exec -it deployment/alliance-app -n alliance -- env | grep SUPABASE
kubectl exec -it deployment/alliance-app -n alliance -- env | grep BREVO
```

## Security Checklist
- ✅ Removed secrets from k8s deployment file
- ✅ Added .env to .gitignore
- ✅ Created secure secret management script
- ✅ Regenerated exposed API keys
- ✅ Using Kubernetes secrets properly

## Need Help?
Check the logs and look for specific error messages. Common issues:
- "API Key is not enabled" → Brevo key not updated
- "Invalid token" → Supabase anon key missing or wrong
- "Connection refused" → Database URL issue
