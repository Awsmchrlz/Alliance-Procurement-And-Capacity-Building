# 🐳 Docker Guide

## Image Optimizations

This Docker image is optimized for production with:

### Multi-Stage Build
- **Stage 1 (Builder)**: Builds the application with all dependencies
- **Stage 2 (Production)**: Only includes runtime dependencies and built code
- **Result**: Smaller image size, faster deployments

### Security Features
- ✅ Non-root user (apcb:nodejs)
- ✅ Alpine Linux base (minimal attack surface)
- ✅ Security updates applied
- ✅ No dev dependencies in production
- ✅ Proper signal handling with dumb-init

### Performance Features
- ✅ Layer caching optimization
- ✅ Production-only dependencies
- ✅ Health check included
- ✅ Efficient file copying

## Image Size

Expected sizes:
- **Builder stage**: ~800MB (temporary)
- **Final image**: ~200-250MB
- **Compressed**: ~80-100MB

## Quick Start

### Build Locally
```bash
docker build -t apcb-platform .
```

### Test Locally
```bash
./docker-test.sh
```

### Run Locally
```bash
docker run -p 5001:5001 --env-file .env apcb-platform
```

## Production Deployment

### Via GitHub Actions (Recommended)
1. Push to main branch
2. GitHub Actions automatically builds and pushes
3. Image available at: `awsmchrlz/apcb-platform:latest`

### Manual Push
```bash
# Build
docker build -t awsmchrlz/apcb-platform:latest .

# Test
./docker-test.sh

# Login
docker login

# Push
docker push awsmchrlz/apcb-platform:latest
```

## Environment Variables

Required at runtime:
```bash
NODE_ENV=production
PORT=5001
DATABASE_URL=postgresql://...
SUPABASE_URL=https://...
SUPABASE_SERVICE_ROLE_KEY=...
SUPABASE_ANON_KEY=...
BREVO_API_KEY=...
SESSION_SECRET=...
FRONTEND_URL=https://...
ADMIN_EMAIL=...
```

## Health Check

The image includes a health check that:
- Runs every 30 seconds
- Checks `/api/events` endpoint
- Marks container unhealthy after 3 failures
- Useful for orchestration (Docker Compose, Kubernetes)

## Docker Compose

```yaml
version: '3.8'

services:
  app:
    image: awsmchrlz/apcb-platform:latest
    ports:
      - "5001:5001"
    environment:
      - NODE_ENV=production
      - PORT=5001
      # Add other env vars
    restart: unless-stopped
    healthcheck:
      test: ["CMD", "node", "-e", "require('http').get('http://localhost:5001/api/events', (r) => process.exit(r.statusCode === 200 ? 0 : 1))"]
      interval: 30s
      timeout: 10s
      retries: 3
```

## Troubleshooting

### Build fails
```bash
# Clean build
docker build --no-cache -t apcb-platform .

# Check logs
docker build -t apcb-platform . 2>&1 | tee build.log
```

### Container won't start
```bash
# Check logs
docker logs container-name

# Run interactively
docker run -it --rm apcb-platform sh

# Check health
docker inspect container-name | grep Health -A 10
```

### Image too large
```bash
# Check image size
docker images apcb-platform

# Analyze layers
docker history apcb-platform --no-trunc

# Use dive for detailed analysis
dive apcb-platform
```

## Best Practices

1. **Always use .dockerignore** - Excludes unnecessary files
2. **Multi-stage builds** - Keeps final image small
3. **Layer caching** - Order commands by change frequency
4. **Security scanning** - Use tools like Trivy
5. **Health checks** - Enable container orchestration
6. **Non-root user** - Improves security
7. **Version tags** - Use semantic versioning

## CI/CD Integration

The GitHub Actions workflow:
1. Builds on every PR (test only)
2. Pushes to Docker Hub on merge to main
3. Tags with `latest` and `main-{sha}`
4. Uses layer caching for speed

## Monitoring

### Check container status
```bash
docker ps
docker stats container-name
```

### View logs
```bash
docker logs -f container-name
docker logs --tail 100 container-name
```

### Execute commands
```bash
docker exec -it container-name sh
docker exec container-name node -v
```

## Cleanup

### Remove old images
```bash
docker image prune -a
```

### Remove stopped containers
```bash
docker container prune
```

### Full cleanup
```bash
docker system prune -a --volumes
```

## Security

### Scan for vulnerabilities
```bash
# Using Trivy
docker run --rm -v /var/run/docker.sock:/var/run/docker.sock \
  aquasec/trivy image apcb-platform

# Using Docker Scout
docker scout cves apcb-platform
```

### Update base image
```bash
# Pull latest Alpine
docker pull node:20-alpine

# Rebuild
docker build --pull -t apcb-platform .
```

## Performance Tips

1. **Use .dockerignore** - Reduces build context
2. **Order layers wisely** - Put changing files last
3. **Combine RUN commands** - Reduces layers
4. **Clean up in same layer** - Reduces image size
5. **Use multi-stage builds** - Only ship what's needed

## Support

For issues:
- Check logs: `docker logs container-name`
- Verify env vars: `docker exec container-name env`
- Test health: `docker inspect container-name`
- Review build: `docker history apcb-platform`
