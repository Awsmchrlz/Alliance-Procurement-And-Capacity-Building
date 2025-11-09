# 🔧 Fix GitHub Secrets

## Issue
Docker login is failing with "incorrect username or password"

## Solution

### Step 1: Verify Your Docker Hub Credentials

1. Go to https://hub.docker.com
2. Login with your credentials
3. Verify your username is: **awsmchlz** (lowercase, no 'r')

### Step 2: Create a New Access Token

**Important:** Don't use your Docker Hub password directly. Use an access token instead.

1. Go to https://hub.docker.com/settings/security
2. Click **New Access Token**
3. Name: `GitHub Actions`
4. Permissions: **Read, Write, Delete**
5. Click **Generate**
6. **Copy the token immediately** (you won't see it again)

### Step 3: Update GitHub Secrets

1. Go to: https://github.com/Awsmchrlz/Alliance-Procurement-And-Capacity-Building/settings/secrets/actions

2. **Update or Create DOCKER_USERNAME:**
   - Click on `DOCKER_USERNAME` (or New repository secret)
   - Name: `DOCKER_USERNAME`
   - Value: `awsmchlz` (exactly as shown, lowercase)
   - Click **Update secret** (or Add secret)

3. **Update or Create DOCKER_PASSWORD:**
   - Click on `DOCKER_PASSWORD` (or New repository secret)
   - Name: `DOCKER_PASSWORD`
   - Value: Paste the access token you just created
   - Click **Update secret** (or Add secret)

### Step 4: Verify Secrets Are Set

You should see:
```
DOCKER_USERNAME    Updated X minutes ago
DOCKER_PASSWORD    Updated X minutes ago
```

### Step 5: Re-run the Workflow

1. Go to: https://github.com/Awsmchrlz/Alliance-Procurement-And-Capacity-Building/actions
2. Click on the failed workflow run
3. Click **Re-run all jobs** (top right)

Or push a new commit:
```bash
git commit --allow-empty -m "Trigger workflow"
git push
```

## Common Issues

### Issue: "Username not found"
- **Fix:** Make sure username is exactly `awsmchlz` (lowercase, no 'r')

### Issue: "Incorrect password"
- **Fix:** Use an access token, not your Docker Hub password
- Generate new token at: https://hub.docker.com/settings/security

### Issue: "Repository not found"
- **Fix:** The repository will be created automatically on first push
- Make sure you're logged into Docker Hub

## Verify It Works

After updating secrets, the workflow should:
1. ✅ Login to Docker Hub successfully
2. ✅ Build the Docker image
3. ✅ Push to: `awsmchlz/alliance-procurement-and-capacity-building:latest`

## Your Docker Image

After successful push, your image will be at:
```bash
docker pull awsmchlz/alliance-procurement-and-capacity-building:latest
```

## Security Note

- ✅ Access tokens are more secure than passwords
- ✅ You can revoke tokens anytime
- ✅ Tokens can have limited permissions
- ✅ Never commit tokens to your repository

## Need Help?

If still failing:
1. Double-check username spelling: `awsmchlz`
2. Regenerate access token
3. Update both secrets in GitHub
4. Re-run workflow

---

**Repository**: https://github.com/Awsmchrlz/Alliance-Procurement-And-Capacity-Building
**Docker Hub**: https://hub.docker.com/u/awsmchlz
