# Docker Deployment Guide

## 🐳 Building and Pushing to Docker Hub

### Prerequisites

1. **Docker installed and running**
   ```bash
   docker --version
   ```

2. **Docker Hub account**
   - Sign up at https://hub.docker.com if you don't have one

3. **All TypeScript errors fixed** ✅
   - All tests passing
   - Code ready for production

### Quick Start - Automated Script

The easiest way to build and push:

```bash
./docker-push.sh
```

This script will:
1. Check if Docker is running
2. Ask for your Docker Hub username
3. Ask for image name (default: alliance-procurement)
4. Ask for version tag (default: latest)
5. Build the Docker image
6. Login to Docker Hub
7. Push the image

### Manual Build and Push

If you prefer manual control:

#### Step 1: Build the Image

```bash
# Replace YOUR_USERNAME with your Docker Hub username
docker build -t YOUR_USERNAME/alliance-procurement:latest .
```

Example:
```bash
docker build -t johndoe/alliance-procurement:latest .
```

#### Step 2: Tag with Version (Optional)

```bash
# Tag with specific version
docker tag YOUR_USERNAME/alliance-procurement:latest YOUR_USERNAME/alliance-procurement:v1.0.0
```

#### Step 3: Login to Docker Hub

```bash
docker login
```

Enter your Docker Hub username and password when prompted.

#### Step 4: Push to Docker Hub

```bash
# Push latest tag
docker push YOUR_USERNAME/alliance-procurement:latest

# Push version tag (if created)
docker push YOUR_USERNAME/alliance-procurement:v1.0.0
```

### Verify the Push

1. Go to https://hub.docker.com
2. Login to your account
3. Navigate to your repositories
4. You should see `alliance-procurement` listed

## 🚀 Deploying from Docker Hub

### On Any Server

Once pushed to Docker Hub, you can pull and run on any server:

```bash
# Pull the image
docker pull YOUR_USERNAME/alliance-procurement:latest

# Run the container
docker run -d \
  -p 5001:5001 \
  --name alliance-procurement \
  --env-file .env \
  YOUR_USERNAME/alliance-procurement:latest
```

### Using Docker Compose

Update your `docker-compose.yml`:

```yaml
version: '3.8'

services:
  app:
    image: YOUR_USERNAME/alliance-procurement:latest  # Changed from build
    ports:
      - "5001:5001"
    environment:
      - NODE_ENV=production
      - PORT=5001
      - DATABASE_URL=${DATABASE_URL}
      - SUPABASE_URL=${SUPABASE_URL}
      - SUPABASE_SERVICE_ROLE_KEY=${SUPABASE_SERVICE_ROLE_KEY}
      - SUPABASE_ANON_KEY=${SUPABASE_ANON_KEY}
      - BREVO_API_KEY=${BREVO_API_KEY}
      - SESSION_SECRET=${SESSION_SECRET}
      - FRONTEND_URL=${FRONTEND_URL}
      - ADMIN_EMAIL=${ADMIN_EMAIL}
    restart: unless-stopped
```

Then deploy:

```bash
docker-compose pull  # Pull latest image
docker-compose up -d  # Start the container
```

## 📦 What's Included in the Image

The Docker image includes:

- ✅ Node.js 20 Alpine (lightweight)
- ✅ All application code
- ✅ Built client and server
- ✅ Database migrations (`db/migrations/`)
- ✅ All dependencies
- ✅ Security updates
- ✅ Non-root user for security
- ✅ Health check configuration

## 🔒 Security Best Practices

1. **Never commit .env file**
   - Already in .gitignore ✅
   - Pass environment variables at runtime

2. **Use secrets management**
   - For production, use Docker secrets or Kubernetes secrets
   - Don't expose sensitive data in docker-compose.yml

3. **Keep image updated**
   - Rebuild regularly to get security updates
   - Use version tags for production

## 🧪 Testing the Image Locally

Before pushing to Docker Hub, test locally:

```bash
# Build
docker build -t alliance-procurement:test .

# Run with your .env file
docker run -p 5001:5001 --env-file .env alliance-procurement:test

# Test the application
curl http://localhost:5001/api/events
```

## 📊 Image Size Optimization

Current optimizations:
- ✅ Alpine Linux base (smaller than standard Node)
- ✅ Multi-stage build (if needed, can be added)
- ✅ npm cache cleaned after install
- ✅ Only production dependencies in final image

To check image size:
```bash
docker images | grep alliance-procurement
```

## 🔄 CI/CD Integration

### GitHub Actions Example

Create `.github/workflows/docker-publish.yml`:

```yaml
name: Docker Build and Push

on:
  push:
    branches: [ main ]
    tags: [ 'v*' ]

jobs:
  build:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      
      - name: Login to Docker Hub
        uses: docker/login-action@v2
        with:
          username: ${{ secrets.DOCKER_USERNAME }}
          password: ${{ secrets.DOCKER_PASSWORD }}
      
      - name: Build and push
        uses: docker/build-push-action@v4
        with:
          context: .
          push: true
          tags: |
            ${{ secrets.DOCKER_USERNAME }}/alliance-procurement:latest
            ${{ secrets.DOCKER_USERNAME }}/alliance-procurement:${{ github.sha }}
```

## 🐛 Troubleshooting

### Build Fails

```bash
# Check Docker is running
docker info

# Check Dockerfile syntax
docker build --no-cache -t test .

# View build logs
docker build -t test . 2>&1 | tee build.log
```

### Push Fails

```bash
# Re-login to Docker Hub
docker logout
docker login

# Check image exists
docker images | grep alliance-procurement

# Try pushing again
docker push YOUR_USERNAME/alliance-procurement:latest
```

### Container Won't Start

```bash
# Check logs
docker logs alliance-procurement

# Check environment variables
docker exec alliance-procurement env

# Check if port is already in use
lsof -i :5001
```

## 📝 Version Tagging Strategy

Recommended tagging:

```bash
# Latest (always points to newest)
YOUR_USERNAME/alliance-procurement:latest

# Semantic versioning
YOUR_USERNAME/alliance-procurement:v1.0.0
YOUR_USERNAME/alliance-procurement:v1.0.1

# Git commit SHA (for traceability)
YOUR_USERNAME/alliance-procurement:abc1234

# Environment-specific
YOUR_USERNAME/alliance-procurement:production
YOUR_USERNAME/alliance-procurement:staging
```

## ✅ Pre-Push Checklist

Before pushing to Docker Hub:

- [ ] All TypeScript errors fixed
- [ ] All tests passing
- [ ] .env file not committed
- [ ] Dockerfile builds successfully
- [ ] Image tested locally
- [ ] Environment variables documented
- [ ] Version tag decided
- [ ] Docker Hub credentials ready

## 🎯 Next Steps After Push

1. **Update deployment documentation**
   - Document the Docker Hub image name
   - Update deployment scripts

2. **Configure production server**
   - Pull the image
   - Set up environment variables
   - Configure reverse proxy (nginx)
   - Set up SSL certificates

3. **Set up monitoring**
   - Container health checks
   - Log aggregation
   - Performance monitoring

4. **Database setup**
   - Run migrations (see DOCUMENTS_SETUP_GUIDE.md)
   - Create storage bucket
   - Apply storage policies

## 📞 Support

If you encounter issues:
- Check Docker logs: `docker logs alliance-procurement`
- Verify environment variables are set
- Ensure all required services (Supabase) are accessible
- Check firewall rules and port availability

---

**Ready to push!** Run `./docker-push.sh` to get started. 🚀
