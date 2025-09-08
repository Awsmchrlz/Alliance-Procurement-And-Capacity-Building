#!/bin/bash

# Alliance Procurement Application Deployment Script
# Usage: ./deploy.sh [production|staging] [initial|update]
# Example: ./deploy.sh production initial

set -e  # Exit on any error

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Configuration
ENVIRONMENT=${1:-production}
DEPLOY_TYPE=${2:-update}
APP_NAME="alliance-procurement-app"
APP_DIR="/var/www/alliance-procurement"
LOG_DIR="/var/log/alliance-app"
NGINX_CONFIG="/etc/nginx/sites-available/alliance-procurement"
DOMAIN_NAME=${DOMAIN_NAME:-"yourdomain.com"}
DB_BACKUP_DIR="/var/backups/alliance-app"

# Functions
log() {
    echo -e "${GREEN}[$(date '+%Y-%m-%d %H:%M:%S')] $1${NC}"
}

warn() {
    echo -e "${YELLOW}[$(date '+%Y-%m-%d %H:%M:%S')] WARNING: $1${NC}"
}

error() {
    echo -e "${RED}[$(date '+%Y-%m-%d %H:%M:%S')] ERROR: $1${NC}"
    exit 1
}

info() {
    echo -e "${BLUE}[$(date '+%Y-%m-%d %H:%M:%S')] INFO: $1${NC}"
}

# Check if running as root
check_root() {
    if [[ $EUID -eq 0 ]]; then
        error "This script should not be run as root. Please run as a regular user with sudo privileges."
    fi
}

# Check system requirements
check_requirements() {
    log "Checking system requirements..."

    # Check if Node.js is installed
    if ! command -v node &> /dev/null; then
        error "Node.js is not installed. Please install Node.js 18+ first."
    fi

    # Check Node.js version
    NODE_VERSION=$(node -v | cut -d'v' -f2 | cut -d'.' -f1)
    if [ "$NODE_VERSION" -lt 18 ]; then
        error "Node.js version 18 or higher is required. Current version: $(node -v)"
    fi

    # Check if PM2 is installed
    if ! command -v pm2 &> /dev/null; then
        warn "PM2 not found. Installing PM2..."
        sudo npm install -g pm2
    fi

    # Check if nginx is installed
    if ! command -v nginx &> /dev/null; then
        warn "Nginx not found. Installing nginx..."
        sudo apt update
        sudo apt install nginx -y
    fi

    log "System requirements check completed."
}

# Setup directories and permissions
setup_directories() {
    log "Setting up directories..."

    # Create application directory
    sudo mkdir -p $APP_DIR
    sudo chown -R $USER:$USER $APP_DIR

    # Create log directory
    sudo mkdir -p $LOG_DIR
    sudo chown -R $USER:$USER $LOG_DIR

    # Create upload directory
    sudo mkdir -p /var/www/uploads
    sudo chown -R $USER:www-data /var/www/uploads
    sudo chmod -R 755 /var/www/uploads

    # Create backup directory
    sudo mkdir -p $DB_BACKUP_DIR
    sudo chown -R $USER:$USER $DB_BACKUP_DIR

    # Create certbot directory for Let's Encrypt
    sudo mkdir -p /var/www/certbot
    sudo chown -R $USER:www-data /var/www/certbot

    log "Directories setup completed."
}

# Clone or update repository
deploy_code() {
    log "Deploying application code..."

    if [ "$DEPLOY_TYPE" = "initial" ]; then
        if [ -d "$APP_DIR/.git" ]; then
            warn "Git repository already exists. Pulling latest changes..."
            cd $APP_DIR
            git pull origin main
        else
            info "Please clone your repository manually to $APP_DIR"
            info "Example: git clone https://github.com/yourusername/your-repo.git $APP_DIR"
            read -p "Press enter after cloning the repository..."
        fi
    else
        if [ ! -d "$APP_DIR/.git" ]; then
            error "No git repository found in $APP_DIR. Please run initial deployment first."
        fi

        cd $APP_DIR
        log "Pulling latest changes from repository..."
        git pull origin main
    fi

    log "Code deployment completed."
}

# Install dependencies and build
build_application() {
    log "Installing dependencies and building application..."

    cd $APP_DIR

    # Clean install
    rm -rf node_modules
    rm -f package-lock.json

    # Install dependencies
    npm install --production=false

    # Run database migrations if needed
    if [ -f "drizzle.config.ts" ]; then
        log "Running database migrations..."
        npm run db:push || warn "Database migration failed. Please check manually."
    fi

    # Build the application
    log "Building application..."
    npm run build

    if [ ! -f "dist/index.js" ]; then
        error "Build failed. dist/index.js not found."
    fi

    log "Application build completed."
}

# Setup environment variables
setup_environment() {
    log "Setting up environment variables..."

    cd $APP_DIR

    if [ ! -f ".env.production" ]; then
        if [ -f "deployment/.env.production" ]; then
            cp deployment/.env.production .env.production
            warn "Environment file copied from template. Please update it with your actual values:"
            warn "nano .env.production"
            read -p "Press enter after updating the environment file..."
        else
            error "No environment file found. Please create .env.production with your configuration."
        fi
    else
        info "Environment file already exists."
    fi

    # Verify critical environment variables
    source .env.production

    if [ -z "$VITE_DATABASE_URL" ] || [ -z "$VITE_SUPABASE_URL" ] || [ -z "$VITE_SUPABASE_ANON_KEY" ]; then
        error "Critical environment variables are missing. Please check your .env.production file."
    fi

    log "Environment setup completed."
}

# Configure PM2
setup_pm2() {
    log "Configuring PM2..."

    cd $APP_DIR

    # Stop existing processes
    pm2 stop $APP_NAME 2>/dev/null || true
    pm2 delete $APP_NAME 2>/dev/null || true

    # Copy PM2 configuration
    if [ -f "deployment/ecosystem.config.js" ]; then
        cp deployment/ecosystem.config.js .

        # Update the configuration with actual paths
        sed -i "s|/var/www/alliance-procurement|$APP_DIR|g" ecosystem.config.js
    else
        error "PM2 ecosystem configuration not found."
    fi

    # Start the application
    pm2 start ecosystem.config.js --env $ENVIRONMENT

    # Save PM2 configuration
    pm2 save

    # Setup PM2 startup script
    sudo env PATH=$PATH:/usr/bin pm2 startup systemd -u $USER --hp $HOME

    log "PM2 configuration completed."
}

# Configure Nginx
setup_nginx() {
    log "Configuring Nginx..."

    # Copy nginx configuration
    if [ -f "$APP_DIR/deployment/nginx.conf" ]; then
        sudo cp $APP_DIR/deployment/nginx.conf $NGINX_CONFIG

        # Update domain name in nginx config
        sudo sed -i "s/yourdomain.com/$DOMAIN_NAME/g" $NGINX_CONFIG

        # Enable the site
        sudo ln -sf $NGINX_CONFIG /etc/nginx/sites-enabled/alliance-procurement

        # Remove default nginx site
        sudo rm -f /etc/nginx/sites-enabled/default

        # Test nginx configuration
        sudo nginx -t

        if [ $? -eq 0 ]; then
            # Reload nginx
            sudo systemctl reload nginx
            log "Nginx configuration completed."
        else
            error "Nginx configuration test failed."
        fi
    else
        error "Nginx configuration file not found."
    fi
}

# Setup SSL with Let's Encrypt
setup_ssl() {
    log "Setting up SSL with Let's Encrypt..."

    # Install certbot if not installed
    if ! command -v certbot &> /dev/null; then
        sudo apt update
        sudo apt install certbot python3-certbot-nginx -y
    fi

    # Obtain SSL certificate
    sudo certbot --nginx -d $DOMAIN_NAME -d www.$DOMAIN_NAME --non-interactive --agree-tos --email admin@$DOMAIN_NAME

    if [ $? -eq 0 ]; then
        log "SSL certificate obtained successfully."

        # Setup automatic renewal
        echo "0 12 * * * /usr/bin/certbot renew --quiet" | sudo crontab -
        log "SSL auto-renewal setup completed."
    else
        warn "SSL certificate setup failed. You may need to configure it manually."
    fi
}

# Setup firewall
setup_firewall() {
    log "Configuring firewall..."

    # Enable UFW if not already enabled
    sudo ufw --force enable

    # Allow SSH
    sudo ufw allow ssh

    # Allow HTTP and HTTPS
    sudo ufw allow 'Nginx Full'

    # Show status
    sudo ufw status

    log "Firewall configuration completed."
}

# Setup monitoring and logging
setup_monitoring() {
    log "Setting up monitoring and logging..."

    # Setup log rotation
    sudo tee /etc/logrotate.d/alliance-app > /dev/null <<EOF
$LOG_DIR/*.log {
    daily
    missingok
    rotate 14
    compress
    notifempty
    create 0640 $USER $USER
    postrotate
        pm2 reload $APP_NAME
    endscript
}
EOF

    # Setup basic monitoring script
    cat > $APP_DIR/monitor.sh <<EOF
#!/bin/bash
# Basic health check script
curl -f http://localhost:3000/health > /dev/null 2>&1
if [ \$? -ne 0 ]; then
    echo "Application health check failed at \$(date)" >> $LOG_DIR/monitor.log
    pm2 restart $APP_NAME
fi
EOF

    chmod +x $APP_DIR/monitor.sh

    # Add to crontab for every 5 minutes
    (crontab -l 2>/dev/null; echo "*/5 * * * * $APP_DIR/monitor.sh") | crontab -

    log "Monitoring setup completed."
}

# Backup database (if needed)
backup_database() {
    if [ "$DEPLOY_TYPE" = "update" ]; then
        log "Creating database backup..."

        BACKUP_FILE="$DB_BACKUP_DIR/backup_$(date +%Y%m%d_%H%M%S).sql"

        # This is a placeholder - adjust based on your actual database setup
        # If using Supabase, you might want to use their backup tools or pg_dump
        warn "Database backup functionality needs to be implemented based on your specific setup."

        log "Database backup completed (placeholder)."
    fi
}

# Health check
health_check() {
    log "Performing health check..."

    sleep 10  # Wait for application to start

    # Check if PM2 process is running
    if pm2 list | grep -q $APP_NAME; then
        info "PM2 process is running."
    else
        error "PM2 process is not running."
    fi

    # Check if application responds
    if curl -f http://localhost:3000/health > /dev/null 2>&1; then
        info "Application health check passed."
    else
        warn "Application health check failed. Check logs: pm2 logs $APP_NAME"
    fi

    # Check nginx status
    if sudo systemctl is-active --quiet nginx; then
        info "Nginx is running."
    else
        error "Nginx is not running."
    fi

    log "Health check completed."
}

# Display post-deployment information
post_deployment_info() {
    log "Deployment completed successfully!"
    echo
    info "Application Details:"
    info "- App Directory: $APP_DIR"
    info "- Log Directory: $LOG_DIR"
    info "- Domain: $DOMAIN_NAME"
    info "- Environment: $ENVIRONMENT"
    echo
    info "Useful Commands:"
    info "- Check app status: pm2 status"
    info "- View logs: pm2 logs $APP_NAME"
    info "- Restart app: pm2 restart $APP_NAME"
    info "- Check nginx: sudo systemctl status nginx"
    info "- View nginx logs: sudo tail -f /var/log/nginx/alliance-procurement.error.log"
    echo
    info "Next Steps:"
    info "1. Update DNS records to point to this server"
    info "2. Test the application at https://$DOMAIN_NAME"
    info "3. Configure monitoring and backup solutions"
    info "4. Set up log monitoring and alerts"
}

# Main deployment function
main() {
    log "Starting deployment process..."
    log "Environment: $ENVIRONMENT"
    log "Deploy Type: $DEPLOY_TYPE"

    check_root
    check_requirements
    setup_directories

    if [ "$DEPLOY_TYPE" = "update" ]; then
        backup_database
    fi

    deploy_code
    setup_environment
    build_application
    setup_pm2

    if [ "$DEPLOY_TYPE" = "initial" ]; then
        setup_nginx
        setup_firewall

        if [ -n "$DOMAIN_NAME" ] && [ "$DOMAIN_NAME" != "yourdomain.com" ]; then
            setup_ssl
        else
            warn "Domain name not set or using placeholder. Skipping SSL setup."
        fi

        setup_monitoring
    fi

    health_check
    post_deployment_info
}

# Trap errors and cleanup
trap 'error "Deployment failed. Check the logs above for details."' ERR

# Check if domain name is provided for initial deployment
if [ "$DEPLOY_TYPE" = "initial" ] && [ -z "$DOMAIN_NAME" ]; then
    read -p "Enter your domain name (e.g., example.com): " DOMAIN_NAME
    export DOMAIN_NAME
fi

# Run main function
main

log "Deployment script completed!"
