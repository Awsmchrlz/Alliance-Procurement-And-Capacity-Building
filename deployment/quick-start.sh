#!/bin/bash

# Alliance Procurement - Quick Start Deployment Script
# This script gets your application up and running quickly on a fresh VPS
# Usage: curl -sSL https://raw.githubusercontent.com/yourusername/your-repo/main/deployment/quick-start.sh | bash

set -e  # Exit on any error

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Configuration
APP_NAME="alliance-procurement"
APP_DIR="/var/www/alliance-procurement"
REPO_URL="https://github.com/yourusername/Alliance-Procurement-And-Capacity-Building-v2.git"

# Functions
log() {
    echo -e "${GREEN}[$(date '+%Y-%m-%d %H:%M:%S')] ✓ $1${NC}"
}

warn() {
    echo -e "${YELLOW}[$(date '+%Y-%m-%d %H:%M:%S')] ⚠ $1${NC}"
}

error() {
    echo -e "${RED}[$(date '+%Y-%m-%d %H:%M:%S')] ✗ ERROR: $1${NC}"
    exit 1
}

info() {
    echo -e "${BLUE}[$(date '+%Y-%m-%d %H:%M:%S')] ℹ $1${NC}"
}

# Check if running as root
if [[ $EUID -eq 0 ]]; then
    error "This script should not be run as root. Please run as a regular user with sudo privileges."
fi

# Welcome message
echo -e "${BLUE}"
echo "=============================================="
echo "  Alliance Procurement - Quick Start Setup"
echo "=============================================="
echo -e "${NC}"
echo "This script will:"
echo "• Install Node.js, PM2, and Nginx"
echo "• Clone and build the application"
echo "• Configure basic server setup"
echo "• Start the application"
echo
read -p "Press Enter to continue or Ctrl+C to cancel..."

# Update system
log "Updating system packages..."
sudo apt update && sudo apt upgrade -y

# Install essential packages
log "Installing essential packages..."
sudo apt install -y curl wget git unzip software-properties-common build-essential

# Install Node.js 18 LTS
log "Installing Node.js 18 LTS..."
if ! command -v node &> /dev/null; then
    curl -fsSL https://deb.nodesource.com/setup_lts.x | sudo -E bash -
    sudo apt-get install -y nodejs
else
    info "Node.js already installed: $(node --version)"
fi

# Verify Node.js version
NODE_VERSION=$(node -v | cut -d'v' -f2 | cut -d'.' -f1)
if [ "$NODE_VERSION" -lt 18 ]; then
    error "Node.js version 18 or higher is required. Current version: $(node -v)"
fi

# Install PM2
log "Installing PM2 process manager..."
if ! command -v pm2 &> /dev/null; then
    sudo npm install -g pm2
else
    info "PM2 already installed: $(pm2 --version)"
fi

# Install Nginx
log "Installing Nginx..."
if ! command -v nginx &> /dev/null; then
    sudo apt install nginx -y
    sudo systemctl start nginx
    sudo systemctl enable nginx
else
    info "Nginx already installed"
fi

# Setup directories
log "Setting up application directories..."
sudo mkdir -p $APP_DIR
sudo chown -R $USER:$USER $APP_DIR

sudo mkdir -p /var/log/alliance-app
sudo chown -R $USER:$USER /var/log/alliance-app

sudo mkdir -p /var/www/uploads
sudo chown -R $USER:www-data /var/www/uploads
sudo chmod -R 755 /var/www/uploads

# Clone repository
log "Cloning application repository..."
if [ -d "$APP_DIR/.git" ]; then
    info "Repository already exists, pulling latest changes..."
    cd $APP_DIR
    git pull origin main
else
    # Check if directory is empty
    if [ "$(ls -A $APP_DIR 2>/dev/null)" ]; then
        warn "Directory $APP_DIR is not empty. Please provide your repository URL:"
        read -p "Enter your git repository URL: " REPO_URL
    fi

    git clone $REPO_URL $APP_DIR
fi

cd $APP_DIR

# Install dependencies
log "Installing application dependencies..."
npm install

# Setup environment file
log "Setting up environment configuration..."
if [ ! -f ".env.production" ]; then
    if [ -f "deployment/.env.production" ]; then
        cp deployment/.env.production .env.production
    else
        # Create basic environment file
        cat > .env.production <<EOF
# Alliance Procurement - Production Environment
NODE_ENV=production
PORT=3000
HOST=0.0.0.0

# Database Configuration - UPDATE THESE VALUES
VITE_DATABASE_URL=postgresql://postgres:YOUR_PASSWORD@db.huwkexajyeacooznhadq.supabase.co:5432/postgres
VITE_SUPABASE_URL=https://db.huwkexajyeacooznhadq.supabase.co
VITE_SUPABASE_ANON_KEY=your-supabase-anon-key

# Security - GENERATE A SECURE SECRET
SESSION_SECRET=$(openssl rand -base64 32)

# CORS
ALLOWED_ORIGINS=http://localhost:3000,http://$(curl -s ifconfig.me):3000
TRUST_PROXY=true
EOF
    fi

    warn "Environment file created at .env.production"
    warn "IMPORTANT: You MUST update the database credentials in .env.production"
    echo
    echo "Please update these values in .env.production:"
    echo "• VITE_DATABASE_URL"
    echo "• VITE_SUPABASE_ANON_KEY"
    echo
    read -p "Press Enter after updating the environment file, or Ctrl+C to exit and update later..."
fi

# Build application
log "Building application..."
npm run build

if [ ! -f "dist/index.js" ]; then
    error "Build failed. dist/index.js not found."
fi

# Setup PM2 configuration
log "Setting up PM2 configuration..."
cat > ecosystem.config.js <<EOF
module.exports = {
  apps: [{
    name: '$APP_NAME',
    script: './dist/index.js',
    instances: 1,
    exec_mode: 'cluster',
    autorestart: true,
    watch: false,
    max_memory_restart: '1G',
    env_production: {
      NODE_ENV: 'production',
      PORT: 3000,
      HOST: '0.0.0.0'
    },
    log_file: '/var/log/alliance-app/combined.log',
    out_file: '/var/log/alliance-app/out.log',
    error_file: '/var/log/alliance-app/error.log',
    log_date_format: 'YYYY-MM-DD HH:mm:ss Z'
  }]
};
EOF

# Stop existing PM2 processes
pm2 stop $APP_NAME 2>/dev/null || true
pm2 delete $APP_NAME 2>/dev/null || true

# Start application with PM2
log "Starting application with PM2..."
pm2 start ecosystem.config.js --env production

# Save PM2 configuration
pm2 save

# Setup PM2 startup script
log "Setting up PM2 startup script..."
sudo env PATH=$PATH:/usr/bin pm2 startup systemd -u $USER --hp $HOME

# Basic Nginx configuration
log "Setting up basic Nginx configuration..."
sudo tee /etc/nginx/sites-available/$APP_NAME > /dev/null <<EOF
server {
    listen 80;
    server_name $(curl -s ifconfig.me) localhost;

    client_max_body_size 20M;

    # API routes
    location /api/ {
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade \$http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host \$host;
        proxy_set_header X-Real-IP \$remote_addr;
        proxy_set_header X-Forwarded-For \$proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto \$scheme;
        proxy_cache_bypass \$http_upgrade;
    }

    # Static files
    location / {
        root $APP_DIR/dist/client;
        index index.html;
        try_files \$uri \$uri/ /index.html;
    }

    # Uploaded files
    location /uploads/ {
        alias /var/www/uploads/;
        expires 1d;
        add_header Cache-Control "public";
    }

    # Health check
    location /health {
        access_log off;
        return 200 "healthy\\n";
        add_header Content-Type text/plain;
    }
}
EOF

# Enable Nginx site
sudo ln -sf /etc/nginx/sites-available/$APP_NAME /etc/nginx/sites-enabled/
sudo rm -f /etc/nginx/sites-enabled/default

# Test and reload Nginx
sudo nginx -t
if [ $? -eq 0 ]; then
    sudo systemctl reload nginx
    log "Nginx configured and reloaded successfully"
else
    error "Nginx configuration test failed"
fi

# Configure firewall
log "Configuring firewall..."
sudo ufw --force enable
sudo ufw allow ssh
sudo ufw allow 'Nginx Full'

# Wait for application to start
log "Waiting for application to start..."
sleep 10

# Health check
SERVER_IP=$(curl -s ifconfig.me)
if curl -f http://localhost:3000/health > /dev/null 2>&1; then
    log "Application health check passed"
else
    warn "Application health check failed. Check PM2 logs: pm2 logs $APP_NAME"
fi

# Success message
echo
echo -e "${GREEN}=============================================="
echo "  🎉 Deployment completed successfully!"
echo "==============================================={NC}"
echo
echo -e "${BLUE}Your application is now running at:${NC}"
echo "• Local: http://localhost:3000"
echo "• Public: http://$SERVER_IP"
echo
echo -e "${BLUE}Useful commands:${NC}"
echo "• Check status: pm2 status"
echo "• View logs: pm2 logs $APP_NAME"
echo "• Restart app: pm2 restart $APP_NAME"
echo "• Check nginx: sudo systemctl status nginx"
echo
echo -e "${YELLOW}Next steps:${NC}"
echo "1. Point your domain to this server IP: $SERVER_IP"
echo "2. Update Nginx config with your domain name"
echo "3. Set up SSL with Let's Encrypt:"
echo "   sudo apt install certbot python3-certbot-nginx -y"
echo "   sudo certbot --nginx -d yourdomain.com"
echo "4. Review and update .env.production with production values"
echo "5. Set up monitoring and backups"
echo
echo -e "${GREEN}🔐 Security reminders:${NC}"
echo "• Change default SSH port"
echo "• Set up key-based SSH authentication"
echo "• Configure fail2ban"
echo "• Keep system updated regularly"
echo
echo "For detailed configuration, see: VPS_DEPLOYMENT_GUIDE.md"
echo
log "Quick start deployment completed! 🚀"
