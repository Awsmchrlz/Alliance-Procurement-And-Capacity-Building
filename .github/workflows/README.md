# GitHub Actions CI/CD Workflow

## Overview

This workflow provides automated testing, building, and Docker image publishing for the Alliance Procurement platform.

## Workflow Structure

### 🔄 Triggers

- **Pull Requests** to `main` branch → Runs tests and build
- **Push to `main`** branch → Runs tests, build, AND pushes to Docker Hub
- **Manual trigger** → Can be run manually from GitHub Actions tab

### 📋 Jobs

#### 1. Test Job
**Runs on:** All PRs and pushes to main

- Checks out code
- Sets up Node.js 20
- Installs dependencies
- Runs TypeScript type checking (`npm run check`)
- Reports test results in GitHub summary

#### 2. Build Job
**Runs on:** All PRs and pushes to main (after tests pass)

- Checks out code
- Sets up Node.js 20
- Installs dependencies
- Builds the application (`npm run build`)
- Verifies build artifacts exist
- Reports build results in GitHub summary

#### 3. Docker Job
**Runs on:** ONLY when pushing to `main` branch (after tests and build pass)

- Checks out code
- Sets up Docker Buildx
- Logs in to Docker Hub
- Builds Docker image
- Pushes to Docker Hub with tags:
  - `latest` - Always points to the newest main build
  - `main-{sha}` - Specific commit SHA for traceability
- Uses layer caching for faster builds
- Reports Docker image details in GitHub summary

## Required Secrets

Add these secrets in your GitHub repository settings:

1. **DOCKER_USERNAME** - Your Docker Hub username
2. **DOCKER_PASSWORD** - Your Docker Hub password or access token

### How to Add Secrets

1. Go to your repository on GitHub
2. Click **Settings** → **Secrets and variables** → **Actions**
3. Click **New repository secret**
4. Add each secret with its value

## Workflow Behavior

### On Pull Request

```
PR opened/updated → Test Job → Build Job → ✅ Done
```

- Tests and builds your code
- Does NOT push to Docker Hub
- Ensures code quality before merging

### On Merge to Main

```
Merge to main → Test Job → Build Job → Docker Job → ✅ Image on Docker Hub
```

- Tests and builds your code
- Pushes Docker image to Docker Hub
- Image is ready for deployment

## Docker Image Tags

After merging to main, your image will be available as:

```bash
# Latest version
docker pull YOUR_USERNAME/apcb-platform:latest

# Specific commit
docker pull YOUR_USERNAME/apcb-platform:main-abc1234
```

## Viewing Results

### GitHub Actions Tab

1. Go to your repository
2. Click **Actions** tab
3. Click on any workflow run
4. View job details and logs

### GitHub Summary

Each job creates a summary visible in the workflow run:

- ✅ Tests Passed
- 🏗️ Build Complete (with artifact list)
- 🐳 Docker Image Published (with pull commands)

## Local Testing

Before pushing, test locally:

```bash
# Run type check
npm run check

# Build application
npm run build

# Build Docker image
docker build -t test-image .

# Run Docker image
docker run -p 5001:5001 --env-file .env test-image
```

## Troubleshooting

### Tests Fail

- Check TypeScript errors in the logs
- Fix errors locally and push again
- Run `npm run check` locally first

### Build Fails

- Check build logs for errors
- Ensure all dependencies are in package.json
- Run `npm run build` locally first

### Docker Push Fails

- Verify DOCKER_USERNAME secret is set correctly
- Verify DOCKER_PASSWORD secret is set correctly
- Check Docker Hub credentials are valid
- Ensure you have push access to the repository

### Workflow Doesn't Trigger

- Check branch name is exactly `main`
- Ensure you're not only changing .md files (ignored)
- Check workflow file syntax is valid YAML

## Customization

### Change Docker Image Name

Edit the `env` section in the workflow:

```yaml
env:
  DOCKER_IMAGE: YOUR_USERNAME/YOUR_IMAGE_NAME
```

### Add More Tests

Add test steps in the `test` job:

```yaml
- name: Run unit tests
  run: npm test

- name: Run integration tests
  run: npm run test:integration
```

### Change Node Version

Update the `node-version` in both jobs:

```yaml
- name: Setup Node.js
  uses: actions/setup-node@v4
  with:
    node-version: '20'  # Change this
```

## Best Practices

1. **Always test locally first** before pushing
2. **Use pull requests** for code review
3. **Don't commit secrets** to the repository
4. **Tag releases** for production deployments
5. **Monitor workflow runs** for failures

## Workflow File Location

`.github/workflows/docker-build-push.yml`

## Support

If you encounter issues:

1. Check the workflow logs in GitHub Actions
2. Verify all secrets are set correctly
3. Test the build locally
4. Check Docker Hub for image availability
