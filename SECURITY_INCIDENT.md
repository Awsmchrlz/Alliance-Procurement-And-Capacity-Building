# 🚨 Security Incident Report - API Keys Exposed

## What Happened
Your API keys were accidentally exposed in the k8s deployment file that was committed to git.

## Exposed Keys
- ❌ Brevo API Key (xkeysib-***REDACTED***)
- ❌ Supabase Service Role Key (eyJhbG***REDACTED***)
- ❌ Database URL with credentials

## Immediate Actions Required

### 1. Regenerate Brevo API Key (URGENT)
1. Go to https://app.brevo.com/settings/keys/api
2. Delete the old exposed key (starts with xkeysib-)
3. Create a new API key
4. Update your `.env` file with the new key

### 2. Get Your Supabase Anon Key
1. Go to your Supabase dashboard: https://supabase.com/dashboard/project/huwkexajyeacooznhadq
2. Go to Settings > API
3. Copy the "anon public" key
4. Add it to your `.env` file as `SUPABASE_ANON_KEY=...`

### 3. Consider Rotating Supabase Keys (Recommended)
1. In Supabase dashboard, go to Settings > API
2. Consider regenerating your service role key if you're concerned about exposure
3. Update your `.env` file with new keys

### 4. Update Your .env File
```bash
# Add the missing SUPABASE_ANON_KEY
SUPABASE_ANON_KEY=your-anon-key-from-supabase-dashboard

# Replace with NEW Brevo API key
BREVO_API_KEY=your-new-brevo-api-key

# Generate a strong session secret (32+ characters)
SESSION_SECRET=$(openssl rand -base64 32)
```

### 5. Deploy with Secure Secrets
```bash
# Create Kubernetes secrets from your updated .env
./k8s/create-secrets.sh

# Deploy the application
kubectl apply -f k8s/alliance-deployment.yaml

# Restart pods to pick up new secrets
kubectl rollout restart deployment/alliance-app -n alliance
```

## Why Login is Failing

### Issue 1: Missing SUPABASE_ANON_KEY
Your `.env` file is missing `SUPABASE_ANON_KEY`. This is needed for client-side Supabase authentication.

### Issue 2: Brevo API Key Disabled
The Brevo API key was invalidated after exposure, causing email failures. This doesn't affect login directly, but prevents welcome emails and password reset emails.

### Issue 3: Password Reset Not Working
Password reset requires:
- Valid SUPABASE_ANON_KEY (missing)
- Valid BREVO_API_KEY (invalidated)
- Proper email configuration

## Prevention for Future

### ✅ What We Fixed
1. Removed secrets from k8s deployment file
2. Created secure secret management script
3. Added .env.production.template for reference
4. Updated documentation

### ✅ Best Practices Going Forward
1. Never commit `.env` files to git
2. Use `./k8s/create-secrets.sh` to manage Kubernetes secrets
3. Rotate API keys regularly
4. Use different keys for dev/staging/production
5. Consider using sealed-secrets or external secret managers

## Timeline
- **Incident**: API keys exposed in k8s/alliance-deployment.yaml
- **Detection**: User reported Brevo API key invalidated
- **Response**: Removed secrets from deployment file, created secure management system
- **Next Steps**: User needs to regenerate keys and redeploy

## Status
🔴 **CRITICAL** - Requires immediate action to restore functionality
