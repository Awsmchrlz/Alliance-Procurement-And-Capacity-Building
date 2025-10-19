# Setup Guide

Complete setup instructions for the Alliance Procurement and Capacity Building Platform.

## 📋 Prerequisites

Before you begin, ensure you have:

- Node.js 18 or higher installed
- npm or yarn package manager
- Docker and Docker Compose (for containerized deployment)
- A Supabase account
- A Resend account (for email functionality)
- A Docker Hub account (for CI/CD)

## 🚀 Quick Start

### 1. Clone and Install

```bash
# Clone the repository
git clone https://github.com/yourusername/apcb-platform.git
cd apcb-platform

# Install dependencies
npm install
```

### 2. Configure Environment

```bash
# Copy the example environment file
cp .env.example .env

# Edit .env with your credentials
nano .env
```

Required environment variables:
```env
SUPABASE_URL=https://your-project.supabase.co
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key
SUPABASE_ANON_KEY=your-anon-key
RESEND_API_KEY=your-resend-api-key
```

### 3. Set Up Supabase

#### A. Create Database Tables

1. Go to your Supabase project dashboard
2. Navigate to SQL Editor
3. Run the `database-schema.sql` file

#### B. Configure Storage

1. Go to Storage section
2. Create a new bucket named `payment-evidence`
3. Set bucket to public read, authenticated write

#### C. Configure Authentication

1. Go to Authentication → Email Templates
2. Update the "Reset Password" template redirect URL:
   ```
   {{ .SiteURL }}/reset-password
   ```
3. Go to Authentication → URL Configuration
4. Add your domains to "Redirect URLs":
   ```
   http://localhost:5173/reset-password
   https://your-domain.com/reset-password
   ```

### 4. Run the Application

#### Development Mode
```bash
npm run dev
```
Access at: http://localhost:5173

#### Production Mode
```bash
npm run build
npm start
```
Access at: http://localhost:3000

## 🐳 Docker Setup

### Local Docker Development

```bash
# Build the image
docker build -t apcb-platform .

# Run with docker-compose
docker-compose up -d

# View logs
docker-compose logs -f

# Stop
docker-compose down
```

### Production Docker Deployment

```bash
# Pull from Docker Hub
docker pull yourusername/apcb-platform:latest

# Run with environment variables
docker run -d \
  -p 3000:3000 \
  -e SUPABASE_URL=your_url \
  -e SUPABASE_SERVICE_ROLE_KEY=your_key \
  -e SUPABASE_ANON_KEY=your_anon_key \
  -e RESEND_API_KEY=your_resend_key \
  --name apcb-app \
  yourusername/apcb-platform:latest
```

## 🔄 GitHub Actions Setup

### 1. Configure Docker Hub

1. Create a Docker Hub account if you don't have one
2. Create a new repository: `apcb-platform`
3. Generate an access token:
   - Go to Account Settings → Security
   - Click "New Access Token"
   - Give it a name and select "Read, Write, Delete" permissions
   - Copy the token (you won't see it again!)

### 2. Configure GitHub Secrets

1. Go to your GitHub repository
2. Navigate to Settings → Secrets and variables → Actions
3. Add the following secrets:
   - `DOCKERHUB_USERNAME`: Your Docker Hub username
   - `DOCKERHUB_TOKEN`: Your Docker Hub access token

### 3. Update Workflow

Edit `.github/workflows/docker-build-push.yml`:

```yaml
env:
  DOCKER_IMAGE: your-dockerhub-username/apcb-platform
```

### 4. Trigger Build

Push to main branch or create a version tag:

```bash
# Push to main
git push origin main

# Or create a version tag
git tag v1.0.0
git push origin v1.0.0
```

The workflow will automatically:
- Build the Docker image
- Run security scans
- Push to Docker Hub with appropriate tags

## 👤 First User Setup

The first user to register will automatically become a Super Admin.

1. Start the application
2. Navigate to `/register`
3. Fill in the registration form
4. Submit - you'll be created as Super Admin
5. Login with your credentials

## 🔐 Creating Additional Admin Users

As a Super Admin, you can:

1. Login to the admin dashboard
2. Go to "User Management"
3. Click "Add New User"
4. Fill in the details and select the role:
   - Super Admin: Full access
   - Finance Person: Payment management
   - Event Manager: Event creation and management
   - Ordinary User: Basic access

## 📧 Email Configuration

### Resend Setup

1. Sign up at [resend.com](https://resend.com)
2. Verify your domain
3. Create an API key
4. Add the API key to your `.env` file

### Email Templates

The application sends emails for:
- User registration confirmation
- Event registration confirmation
- Password reset
- Admin notifications

Templates are defined in `server/email-service.ts`

## 🧪 Testing

### Run Tests
```bash
npm test
```

### Test Coverage
```bash
npm run test:coverage
```

### Manual Testing Checklist

- [ ] User registration
- [ ] User login
- [ ] Password reset flow
- [ ] Event registration
- [ ] Sponsorship application
- [ ] Exhibition application
- [ ] Admin dashboard access
- [ ] Payment status updates
- [ ] Delete operations (Super Admin)

## 🔍 Troubleshooting

### Common Issues

#### 1. "Cannot connect to Supabase"
- Check your `SUPABASE_URL` is correct
- Verify your API keys are valid
- Ensure your IP is not blocked

#### 2. "Email not sending"
- Verify `RESEND_API_KEY` is correct
- Check domain verification in Resend
- Review email service logs

#### 3. "Docker build fails"
- Clear Docker cache: `docker system prune -a`
- Check Dockerfile syntax
- Verify all dependencies are in package.json

#### 4. "Password reset not working"
- Check Supabase email template configuration
- Verify redirect URLs are whitelisted
- Check browser console for errors

### Debug Mode

Enable debug logging:
```bash
NODE_ENV=development npm run dev
```

Check logs:
```bash
# Docker logs
docker logs apcb-app

# Docker Compose logs
docker-compose logs -f app
```

## 📊 Monitoring

### Health Check

The application includes a health check endpoint:
```bash
curl http://localhost:3000/api/events
```

### Docker Health Check

Docker automatically monitors the application:
```bash
docker ps
# Look for "healthy" status
```

### Logs

View application logs:
```bash
# Development
npm run dev

# Docker
docker logs -f apcb-app

# Docker Compose
docker-compose logs -f
```

## 🔄 Updates and Maintenance

### Updating the Application

```bash
# Pull latest changes
git pull origin main

# Install new dependencies
npm install

# Rebuild Docker image
docker-compose build

# Restart services
docker-compose up -d
```

### Database Migrations

When database schema changes:

1. Update `database-schema.sql`
2. Run the new SQL in Supabase SQL Editor
3. Test thoroughly before deploying

### Backup Strategy

1. **Database**: Use Supabase automatic backups
2. **Storage**: Enable Supabase storage backups
3. **Code**: Keep in version control (Git)

## 🆘 Support

If you need help:

1. Check this setup guide
2. Review the main README.md
3. Check GitHub Issues
4. Contact: support@apcb.org

## 📚 Additional Resources

- [Supabase Documentation](https://supabase.com/docs)
- [Docker Documentation](https://docs.docker.com)
- [React Documentation](https://react.dev)
- [Express Documentation](https://expressjs.com)

---

**Last Updated**: January 2025
