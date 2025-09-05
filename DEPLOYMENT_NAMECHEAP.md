# Namecheap Deployment Guide - Memory Optimized

This guide provides step-by-step instructions for deploying your Alliance Procurement application to Namecheap shared hosting while addressing WebAssembly memory limitations.

## 🚨 Memory Error Solution

The `WebAssembly.instantiate(): Out of memory` error occurs due to Namecheap's strict memory limits on shared hosting. This deployment configuration addresses these limitations.

## Prerequisites

- Namecheap shared hosting account with Node.js support
- Domain configured and pointing to your hosting
- SSH access enabled (if available)
- Node.js 18+ supported by your hosting plan

## 📦 Pre-Deployment Setup

### 1. Environment Configuration

Copy the production environment template:
```bash
cp .env.production .env
```

Update `.env` with your actual values:
```bash
# Required - Replace with your actual Supabase credentials
SUPABASE_URL=https://your-project.supabase.co
SUPABASE_ANON_KEY=your_anon_key_here
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key_here

# Update with your domain
APP_URL=https://yourdomain.com
CORS_ORIGIN=https://yourdomain.com

# Generate a secure session secret
SESSION_SECRET=your_very_secure_random_string_here
```

### 2. Build the Application

Build with memory optimizations:
```bash
npm install
npm run build:server:memory
```

This creates an optimized production build in the `dist/` directory.

## 🚀 Deployment Methods

### Method A: cPanel File Manager (Recommended for Beginners)

1. **Access cPanel**
   - Log into your Namecheap account
   - Go to cPanel → File Manager
   - Navigate to `public_html` (or your domain's folder)

2. **Upload Files**
   - Upload these files/folders to your web root:
     - `dist/` (entire folder)
     - `public/` (entire folder)
     - `node_modules/` (entire folder) *
     - `.htaccess`
     - `package.json`
     - `.env`
     - `start-production.sh`

   *Note: Some hosts prefer you run `npm install` on the server instead of uploading node_modules

3. **Set Permissions**
   - Make `start-production.sh` executable (chmod 755)

4. **Configure Node.js App**
   - In cPanel, go to "Node.js Apps"
   - Create new application:
     - Node.js version: 18.x or higher
     - Application mode: Production
     - Application root: `/public_html` (or your domain folder)
     - Application startup file: `dist/index-production.js`
     - Environment variables: Add your `.env` values

### Method B: SSH Deployment (Advanced)

If you have SSH access:

1. **Connect via SSH**
   ```bash
   ssh username@yourserver.com
   cd public_html
   ```

2. **Clone/Upload Your Code**
   ```bash
   # If using Git
   git clone https://github.com/yourusername/your-repo.git .
   
   # Or upload via SCP/SFTP
   ```

3. **Install and Build**
   ```bash
   npm install --production
   npm run build:server:memory
   ```

4. **Start Application**
   ```bash
   chmod +x start-production.sh
   ./start-production.sh
   ```

## 🔧 Memory Optimization Features

Your deployment includes several memory optimizations:

### Server Optimizations
- **Memory Limits**: Max 256MB heap size
- **Garbage Collection**: Aggressive GC every 100 operations
- **Connection Pooling**: Limited to 5 concurrent DB connections
- **Caching**: Smart caching with automatic cleanup
- **Static File Serving**: Optimized with compression

### Application Optimizations
- **Reduced Dependencies**: Minimal production bundle
- **Memory Monitoring**: Automatic restart if memory exceeds 400MB
- **Request Limits**: 5MB request size limit
- **Session Management**: Memory-efficient sessions

## 📁 File Structure After Deployment

```
public_html/
├── dist/
│   └── index-production.js     # Optimized server bundle
├── public/
│   ├── index.html             # Client application
│   └── assets/                # Static assets
├── node_modules/              # Production dependencies
├── .htaccess                  # Apache configuration
├── .env                       # Environment variables
├── package.json               # Dependencies
└── start-production.sh        # Startup script
```

## 🔍 Troubleshooting

### Memory Issues

If you still encounter memory errors:

1. **Check Current Usage**
   ```bash
   curl https://yourdomain.com/api/health
   ```

2. **Monitor Logs**
   - Check `logs/production.log` for memory usage
   - Look for memory warnings in cPanel error logs

3. **Reduce Memory Further**
   - Edit `package.json` and change `--max-old-space-size=256` to `--max-old-space-size=128`
   - Disable features in `.env`:
     ```
     ENABLE_REALTIME=false
     ENABLE_DETAILED_LOGGING=false
     MAX_CACHE_SIZE=25
     ```

### Common Issues

**"Cannot find module" errors:**
- Ensure all dependencies are installed: `npm install --production`
- Check file paths are correct in your hosting environment

**404 errors for API routes:**
- Verify `.htaccess` is uploaded and working
- Check that mod_rewrite is enabled in your hosting

**Database connection errors:**
- Verify Supabase credentials in `.env`
- Check firewall settings allow outbound HTTPS connections

**File upload issues:**
- Verify `public/uploads/` directory exists and is writable
- Check hosting file size limits

## 📊 Performance Monitoring

### Built-in Health Check
Visit `https://yourdomain.com/api/health` to see:
- Current memory usage
- Server uptime
- System status

### Memory Monitoring
The application automatically:
- Logs memory usage every 5 minutes
- Restarts if memory exceeds 400MB
- Runs garbage collection every 30 seconds

## 🔒 Security Notes

1. **Environment Variables**: Never commit `.env` to version control
2. **File Permissions**: Ensure sensitive files aren't web-accessible
3. **HTTPS**: Always use HTTPS in production
4. **Regular Updates**: Keep dependencies updated

## 🆘 Support

If you continue to experience issues:

1. **Check Hosting Limits**
   - Contact Namecheap support to verify your memory limits
   - Consider upgrading to VPS if shared hosting limits are too restrictive

2. **Optimize Further**
   - Reduce `MAX_CACHE_SIZE` to 10
   - Disable non-essential features
   - Consider splitting into microservices

3. **Alternative Deployment**
   - Consider Vercel, Netlify, or Railway for better Node.js support
   - Use Namecheap only for static file hosting

## 📈 Scaling Options

As your application grows:

1. **Upgrade Hosting**: Move to VPS or dedicated server
2. **Database Optimization**: Implement database connection pooling
3. **CDN**: Use Cloudflare or similar for static assets
4. **Load Balancing**: Implement multiple server instances

---

**Last Updated**: December 2024
**Tested With**: Namecheap Shared Hosting, Node.js 18+, Supabase