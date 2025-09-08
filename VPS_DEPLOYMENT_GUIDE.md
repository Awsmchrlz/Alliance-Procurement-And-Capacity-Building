# VPS Deployment Guide - Alliance Procurement & Capacity Building v2

This comprehensive guide will walk you through deploying your Alliance Procurement and Capacity Building application on a Virtual Private Server (VPS).

## Table of Contents

1. [Prerequisites](#prerequisites)
2. [Server Preparation](#server-preparation)
3. [Deployment Methods](#deployment-methods)
4. [Environment Configuration](#environment-configuration)
5. [Security Setup](#security-setup)
6. [Monitoring & Maintenance](#monitoring--maintenance)
7. [Troubleshooting](#troubleshooting)
8. [Scaling Considerations](#scaling-considerations)

## Prerequisites

### System Requirements

- **VPS Specifications (Minimum)**:
  - 2 CPU cores
  - 4GB RAM
  - 50GB SSD storage
  - Ubuntu 20.04+ or CentOS 8+

- **Domain & DNS**:
  - Domain name pointed to your VPS IP
  - SSL certificate capability (Let's Encrypt recommended)

- **External Services**:
  - Supabase account with database configured
  - SendGrid account for email services (optional)

### Local Requirements

- Git access to your repository
- SSH access to your VPS
- Basic command line knowledge

## Server Preparation

### 1. Initial Server Setup

```bash
# Update system packages
sudo apt update && sudo apt upgrade -y

# Install essential packages
sudo apt install -y curl wget git unzip software-properties-common

# Create a non-root user (if not already done)
sudo adduser deployment
sudo usermod -aG sudo deployment

# Switch to the deployment user
su - deployment
```

### 2. Install Node.js 18+

```bash
# Install Node.js 18 LTS
curl -fsSL https://deb.nodesource.com/setup_lts.x | sudo -E bash -
sudo apt-get install -y nodejs

# Verify installation
node --version  # Should be 18+
npm --version
```

### 3. Install PM2 Process Manager

```bash
# Install PM2 globally
sudo npm install -g pm2

# Verify installation
pm2 --version
```

### 4. Install and Configure Nginx

```bash
# Install Nginx
sudo apt install nginx -y

# Start and enable Nginx
sudo systemctl start nginx
sudo systemctl enable nginx

# Test Nginx is running
sudo systemctl status nginx
```

### 5. Configure Firewall

```bash
# Enable UFW firewall
sudo ufw enable

# Allow SSH, HTTP, and HTTPS
sudo ufw allow ssh
sudo ufw allow 'Nginx Full'

# Check firewall status
sudo ufw status
```

## Deployment Methods

Choose one of the following deployment methods based on your preference and requirements:

### Method 1: Automated Script Deployment (Recommended)

This is the easiest method using the provided deployment script.

#### Step 1: Clone Repository

```bash
# Create application directory
sudo mkdir -p /var/www/alliance-procurement
sudo chown -R $USER:$USER /var/www/alliance-procurement

# Clone your repository
git clone https://github.com/yourusername/Alliance-Procurement-And-Capacity-Building-v2.git /var/www/alliance-procurement

cd /var/www/alliance-procurement
```

#### Step 2: Run Deployment Script

```bash
# Make deployment script executable
chmod +x deployment/deploy.sh

# Set your domain name
export DOMAIN_NAME="yourdomain.com"

# Run initial deployment
./deployment/deploy.sh production initial
```

The script will:
- Install all dependencies
- Build the application
- Configure PM2
- Set up Nginx
- Configure SSL with Let's Encrypt
- Set up monitoring

### Method 2: Manual Deployment

For more control over the deployment process:

#### Step 1: Clone and Build

```bash
# Clone repository
git clone https://github.com/yourusername/Alliance-Procurement-And-Capacity-Building-v2.git /var/www/alliance-procurement
cd /var/www/alliance-procurement

# Install dependencies
npm install

# Build the application
npm run build
```

#### Step 2: Configure Environment

```bash
# Copy environment template
cp deployment/.env.production .env.production

# Edit with your actual values
nano .env.production
```

#### Step 3: Configure PM2

```bash
# Copy PM2 configuration
cp deployment/ecosystem.config.js .

# Start the application
pm2 start ecosystem.config.js --env production

# Save PM2 configuration
pm2 save

# Set up PM2 startup
pm2 startup
```

#### Step 4: Configure Nginx

```bash
# Copy Nginx configuration
sudo cp deployment/nginx.conf /etc/nginx/sites-available/alliance-procurement

# Update domain name in config
sudo sed -i 's/yourdomain.com/your-actual-domain.com/g' /etc/nginx/sites-available/alliance-procurement

# Enable the site
sudo ln -s /etc/nginx/sites-available/alliance-procurement /etc/nginx/sites-enabled/

# Remove default site
sudo rm /etc/nginx/sites-enabled/default

# Test and reload Nginx
sudo nginx -t
sudo systemctl reload nginx
```

#### Step 5: Set up SSL

```bash
# Install Certbot
sudo apt install certbot python3-certbot-nginx -y

# Obtain SSL certificate
sudo certbot --nginx -d your-domain.com -d www.your-domain.com
```

### Method 3: Docker Deployment

For containerized deployment:

#### Step 1: Install Docker

```bash
# Install Docker
curl -fsSL https://get.docker.com -o get-docker.sh
sh get-docker.sh

# Install Docker Compose
sudo curl -L "https://github.com/docker/compose/releases/latest/download/docker-compose-$(uname -s)-$(uname -m)" -o /usr/local/bin/docker-compose
sudo chmod +x /usr/local/bin/docker-compose

# Add user to docker group
sudo usermod -aG docker $USER
newgrp docker
```

#### Step 2: Deploy with Docker Compose

```bash
# Clone repository
git clone https://github.com/yourusername/Alliance-Procurement-And-Capacity-Building-v2.git /var/www/alliance-procurement
cd /var/www/alliance-procurement

# Copy environment file
cp deployment/.env.production .env.production

# Update docker-compose.yml with your domain
sed -i 's/yourdomain.com/your-actual-domain.com/g' docker-compose.yml

# Build and start services
docker-compose up -d

# Set up SSL (run once)
docker-compose --profile ssl-setup run --rm certbot
```

## Environment Configuration

### Required Environment Variables

Create and configure your `.env.production` file:

```bash
# Server Configuration
NODE_ENV=production
PORT=3000
HOST=0.0.0.0

# Database Configuration
VITE_DATABASE_URL=postgresql://postgres:[PASSWORD]@db.huwkexajyeacooznhadq.supabase.co:5432/postgres

# Supabase Configuration
VITE_SUPABASE_URL=https://db.huwkexajyeacooznhadq.supabase.co
VITE_SUPABASE_ANON_KEY=your-anon-key

# Session Security
SESSION_SECRET=your-super-secure-session-secret

# Email Configuration (if using SendGrid)
SENDGRID_API_KEY=your-sendgrid-key
FROM_EMAIL=noreply@yourdomain.com

# Security
ALLOWED_ORIGINS=https://yourdomain.com,https://www.yourdomain.com
TRUST_PROXY=true
```

### Generating Secure Secrets

```bash
# Generate session secret
openssl rand -base64 32

# Generate JWT secret (if used)
openssl rand -hex 64
```

## Security Setup

### 1. Set Up Fail2Ban

```bash
# Install Fail2Ban
sudo apt install fail2ban -y

# Create Nginx jail configuration
sudo tee /etc/fail2ban/jail.local > /dev/null <<EOF
[DEFAULT]
bantime = 3600
findtime = 600
maxretry = 5

[sshd]
enabled = true

[nginx-http-auth]
enabled = true

[nginx-limit-req]
enabled = true
port = http,https
logpath = /var/log/nginx/*error.log
EOF

# Restart Fail2Ban
sudo systemctl restart fail2ban
```

### 2. Configure Additional Security Headers

The provided Nginx configuration includes security headers, but you can enhance them:

```bash
# Add to your Nginx configuration
add_header Content-Security-Policy "default-src 'self'; script-src 'self' 'unsafe-inline'; style-src 'self' 'unsafe-inline';" always;
add_header X-Content-Type-Options "nosniff" always;
add_header X-Frame-Options "DENY" always;
```

### 3. Regular Security Updates

```bash
# Set up automatic security updates
sudo apt install unattended-upgrades -y
sudo dpkg-reconfigure unattended-upgrades
```

## Monitoring & Maintenance

### 1. Application Monitoring

```bash
# Check PM2 status
pm2 status

# View application logs
pm2 logs alliance-procurement-app

# Monitor resources
pm2 monit
```

### 2. System Monitoring

```bash
# Check system resources
htop

# Check disk usage
df -h

# Check memory usage
free -h

# Check active connections
ss -tuln
```

### 3. Nginx Monitoring

```bash
# Check Nginx status
sudo systemctl status nginx

# View Nginx logs
sudo tail -f /var/log/nginx/alliance-procurement.access.log
sudo tail -f /var/log/nginx/alliance-procurement.error.log
```

### 4. Automated Backups

Create a backup script:

```bash
#!/bin/bash
# /home/deployment/backup.sh

BACKUP_DIR="/var/backups/alliance-app"
DATE=$(date +%Y%m%d_%H%M%S)

# Create backup directory
mkdir -p $BACKUP_DIR

# Backup application files
tar -czf $BACKUP_DIR/app_backup_$DATE.tar.gz /var/www/alliance-procurement

# Backup database (adjust for your setup)
# If using local PostgreSQL:
# pg_dump alliance_db > $BACKUP_DIR/db_backup_$DATE.sql

# Remove backups older than 7 days
find $BACKUP_DIR -name "*.tar.gz" -mtime +7 -delete
find $BACKUP_DIR -name "*.sql" -mtime +7 -delete

echo "Backup completed: $DATE"
```

Add to crontab:

```bash
# Edit crontab
crontab -e

# Add daily backup at 2 AM
0 2 * * * /home/deployment/backup.sh >> /var/log/backup.log 2>&1
```

### 5. SSL Certificate Renewal

```bash
# Test automatic renewal
sudo certbot renew --dry-run

# Check certificate expiration
sudo certbot certificates
```

## Troubleshooting

### Common Issues and Solutions

#### 1. Application Won't Start

```bash
# Check PM2 logs
pm2 logs alliance-procurement-app --lines 50

# Check if port is in use
sudo lsof -i :3000

# Restart the application
pm2 restart alliance-procurement-app
```

#### 2. Nginx Configuration Errors

```bash
# Test Nginx configuration
sudo nginx -t

# Check Nginx error logs
sudo tail -f /var/log/nginx/error.log

# Reload Nginx configuration
sudo systemctl reload nginx
```

#### 3. Database Connection Issues

```bash
# Test database connection
node -e "
const { createClient } = require('@supabase/supabase-js');
const client = createClient(process.env.VITE_SUPABASE_URL, process.env.VITE_SUPABASE_ANON_KEY);
console.log('Connection test completed');
"
```

#### 4. SSL Certificate Issues

```bash
# Renew certificate manually
sudo certbot renew

# Check certificate status
sudo certbot certificates

# Debug SSL issues
openssl s_client -connect yourdomain.com:443 -servername yourdomain.com
```

#### 5. High Memory Usage

```bash
# Check memory usage by process
ps aux --sort=-%mem | head

# Restart PM2 process if memory leak
pm2 restart alliance-procurement-app

# Check for memory leaks in application logs
pm2 logs alliance-procurement-app | grep -i "memory\|heap"
```

### Performance Optimization

#### 1. Enable Gzip Compression

Already configured in the provided Nginx configuration, but verify:

```bash
# Test gzip is working
curl -H "Accept-Encoding: gzip" -I http://yourdomain.com
```

#### 2. Optimize PM2 Settings

```bash
# Adjust PM2 instances based on CPU cores
pm2 scale alliance-procurement-app 4  # For 4 CPU cores
```

#### 3. Database Connection Optimization

Add connection pooling settings to your environment:

```bash
# Add to .env.production
DB_POOL_MIN=2
DB_POOL_MAX=10
DB_POOL_IDLE_TIMEOUT=30000
```

## Scaling Considerations

### Vertical Scaling (Single Server)

1. **Increase server resources** (CPU, RAM, storage)
2. **Optimize PM2 instances** based on CPU cores
3. **Implement Redis** for session storage
4. **Use CDN** for static assets

### Horizontal Scaling (Multiple Servers)

1. **Load Balancer** (nginx, HAProxy, or cloud LB)
2. **Shared Database** (already using Supabase)
3. **Shared Session Storage** (Redis cluster)
4. **Container Orchestration** (Docker Swarm, Kubernetes)

### Example Load Balancer Configuration

```nginx
upstream alliance_backend {
    least_conn;
    server 10.0.1.10:3000 max_fails=3 fail_timeout=30s;
    server 10.0.1.11:3000 max_fails=3 fail_timeout=30s;
    server 10.0.1.12:3000 max_fails=3 fail_timeout=30s;
}
```

## Maintenance Schedule

### Daily Tasks
- Monitor application logs
- Check system resources
- Verify backup completion

### Weekly Tasks
- Review security logs
- Update application dependencies
- Check SSL certificate expiration

### Monthly Tasks
- System security updates
- Performance review
- Backup verification
- Security audit

## Support and Resources

### Useful Commands Reference

```bash
# Application Management
pm2 start ecosystem.config.js --env production
pm2 stop alliance-procurement-app
pm2 restart alliance-procurement-app
pm2 reload alliance-procurement-app
pm2 delete alliance-procurement-app

# Nginx Management
sudo systemctl start nginx
sudo systemctl stop nginx
sudo systemctl restart nginx
sudo systemctl reload nginx
sudo nginx -t

# SSL Certificate Management
sudo certbot certificates
sudo certbot renew
sudo certbot delete

# System Monitoring
htop
iotop
nethogs
df -h
free -h

# Log Monitoring
tail -f /var/log/nginx/alliance-procurement.access.log
tail -f /var/log/nginx/alliance-procurement.error.log
pm2 logs alliance-procurement-app
journalctl -u nginx -f
```

### Getting Help

1. **Application Logs**: Check PM2 logs for application-specific issues
2. **System Logs**: Use `journalctl` for system-level debugging
3. **Nginx Logs**: Check access and error logs for web server issues
4. **Community Resources**: 
   - Nginx documentation
   - PM2 documentation
   - Node.js best practices
   - Supabase documentation

---

**Note**: Replace `yourdomain.com` and other placeholder values with your actual configuration throughout this guide.

This deployment guide provides multiple deployment strategies and comprehensive maintenance procedures. Choose the method that best fits your technical expertise and infrastructure requirements.