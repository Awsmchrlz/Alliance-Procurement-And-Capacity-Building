# 🚀 Production Deployment Guide

**Alliance Procurement and Capacity Building Event Management System**

This guide covers complete production deployment from development to live system.

---

## ✅ **Pre-Deployment Checklist**

### Code Quality
- [ ] All TypeScript errors resolved
- [ ] Tests passing (if applicable)
- [ ] Code reviewed and approved
- [ ] Git repository clean with latest changes
- [ ] Production environment variables prepared

### Infrastructure
- [ ] Supabase production project created
- [ ] Email service (Resend) configured
- [ ] Domain name purchased and configured
- [ ] SSL certificate ready
- [ ] CDN configured (optional but recommended)

### Security
- [ ] Environment variables secured
- [ ] API keys rotated for production
- [ ] Database RLS policies tested
- [ ] CORS settings configured
- [ ] Rate limiting implemented

---

## 🗄️ **Database Deployment**

### 1. Supabase Setup

**Create Production Project:**
1. Go to [supabase.com](https://supabase.com)
2. Create new project
3. Choose your region (closest to users)
4. Set strong database password
5. Note down project URL and keys

**Deploy Schema:**
1. Copy entire `database-schema.sql` content
2. Open Supabase SQL Editor
3. Paste and execute the script
4. Verify tables created successfully

**Configure Storage:**
```sql
-- Create storage bucket for payment evidence
INSERT INTO storage.buckets (id, name, public) 
VALUES ('registrations', 'registrations', false);

-- Set up RLS policies for bucket
CREATE POLICY "Users can upload their own evidence" ON storage.objects
FOR INSERT WITH CHECK (bucket_id = 'registrations' AND auth.uid()::text = (storage.foldername(name))[1]);

CREATE POLICY "Users can view their own evidence" ON storage.objects
FOR SELECT USING (bucket_id = 'registrations' AND auth.uid()::text = (storage.foldername(name))[1]);
```

### 2. Environment Variables

Create `.env` in project root:
```env
# Database (Production)
SUPABASE_URL=https://your-project.supabase.co
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key

# Email Service
RESEND_API_KEY=re_your-production-key
FROM_EMAIL=noreply@yourdomain.com

# Server Config
PORT=3000
NODE_ENV=production

# Security
JWT_SECRET=your-super-secure-jwt-secret
CORS_ORIGIN=https://yourdomain.com
```

---

## 🎨 **Frontend Deployment**

### Option 1: Vercel (Recommended)

**Setup:**
1. Connect GitHub repository to Vercel
2. Configure build settings:
   - **Build Command**: `cd client && npm run build`
   - **Output Directory**: `client/dist`
   - **Install Command**: `npm install`

**Environment Variables in Vercel:**
```env
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_ANON_KEY=your-anon-key
VITE_SUPABASE_EVIDENCE_BUCKET=registrations
VITE_API_URL=https://api.yourdomain.com
```

**Deploy:**
```bash
# Via Vercel CLI
npm i -g vercel
vercel --prod
```

### Option 2: Netlify

**Setup:**
1. Connect GitHub repository
2. Build settings:
   - **Build Command**: `cd client && npm run build`
   - **Publish Directory**: `client/dist`
   - **Base Directory**: `/`

**Environment Variables:**
Same as Vercel above.

### Option 3: Manual Deployment

**Build Locally:**
```bash
cd client
npm run build
# Upload dist/ folder to your web server
```

---

## ⚙️ **Backend Deployment**

### Option 1: Railway (Recommended)

**Setup:**
1. Connect GitHub repository to Railway
2. Configure service:
   - **Start Command**: `npm start`
   - **Build Command**: `npm run build`

**Environment Variables:**
Add all variables from `.env` file above.

**Deploy:**
```bash
# Via Railway CLI
npm i -g @railway/cli
railway login
railway deploy
```

### Option 2: Heroku

**Setup:**
```bash
# Install Heroku CLI
npm install -g heroku

# Login and create app
heroku login
heroku create your-app-name

# Set environment variables
heroku config:set SUPABASE_URL=https://your-project.supabase.co
heroku config:set SUPABASE_SERVICE_ROLE_KEY=your-key
heroku config:set RESEND_API_KEY=your-key
heroku config:set FROM_EMAIL=noreply@yourdomain.com
heroku config:set NODE_ENV=production

# Deploy
git push heroku main
```

### Option 3: VPS/Server Deployment

**Server Setup (Ubuntu):**
```bash
# Update system
sudo apt update && sudo apt upgrade -y

# Install Node.js 18
curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
sudo apt-get install -y nodejs

# Install PM2 for process management
npm install -g pm2

# Clone repository
git clone https://github.com/your-username/Alliance-Procurement-And-Capacity-Building.git
cd Alliance-Procurement-And-Capacity-Building

# Install dependencies
npm install

# Build application
npm run build

# Create environment file
sudo nano .env
# Add your production environment variables

# Start with PM2
pm2 start dist/index.js --name "alliance-api"
pm2 startup
pm2 save

# Configure Nginx
sudo apt install nginx
sudo nano /etc/nginx/sites-available/alliance-api
```

**Nginx Configuration:**
```nginx
server {
    listen 80;
    server_name api.yourdomain.com;

    location / {
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_cache_bypass $http_upgrade;
    }
}
```

```bash
# Enable site
sudo ln -s /etc/nginx/sites-available/alliance-api /etc/nginx/sites-enabled/
sudo nginx -t
sudo systemctl reload nginx
```

---

## 🌐 **Domain & SSL Configuration**

### 1. DNS Setup

**A Records:**
```
@ -> your-frontend-ip (or CNAME to vercel)
api -> your-backend-ip
www -> your-frontend-ip
```

**CNAME Records (if using services):**
```
@ -> your-vercel-domain.vercel.app
api -> your-railway-domain.railway.app
```

### 2. SSL Certificate

**Using Cloudflare (Recommended):**
1. Add domain to Cloudflare
2. Update nameservers
3. Enable SSL/TLS encryption
4. Set to "Full (strict)" mode

**Using Let's Encrypt (VPS):**
```bash
sudo apt install certbot python3-certbot-nginx
sudo certbot --nginx -d yourdomain.com -d www.yourdomain.com -d api.yourdomain.com
```

---

## 📧 **Email Configuration**

### Resend Setup

**Domain Verification:**
1. Add DNS records provided by Resend
2. Verify domain ownership
3. Test email sending

**SPF Record:**
```
TXT @ "v=spf1 include:_spf.resend.com ~all"
```

**DKIM Record:**
```
TXT resend._domainkey "your-dkim-key-from-resend"
```

---

## 📊 **Monitoring Setup**

### 1. Health Checks

**API Health Endpoint:**
```javascript
// Add to server/routes.ts
app.get('/health', (req, res) => {
  res.json({
    status: 'healthy',
    timestamp: new Date().toISOString(),
    version: process.env.npm_package_version
  });
});
```

**Frontend Health Check:**
```javascript
// Add to client health check
const checkBackendHealth = async () => {
  try {
    const response = await fetch(`${API_URL}/health`);
    return response.ok;
  } catch {
    return false;
  }
};
```

### 2. Error Tracking

**Sentry Setup (Optional):**
```bash
npm install @sentry/node @sentry/react
```

**Backend Integration:**
```javascript
import * as Sentry from "@sentry/node";

Sentry.init({
  dsn: "your-sentry-dsn",
  environment: process.env.NODE_ENV,
});
```

### 3. Uptime Monitoring

**Recommended Services:**
- UptimeRobot (free tier available)
- Pingdom
- StatusCake

**Monitor These Endpoints:**
- `https://yourdomain.com` (frontend)
- `https://api.yourdomain.com/health` (backend)
- `https://your-project.supabase.co` (database)

---

## ✅ **Post-Deployment Verification**

### 1. Functional Tests

**User Registration Flow:**
- [ ] User can create account
- [ ] Email verification works
- [ ] Login/logout functions
- [ ] Password reset works

**Event Registration:**
- [ ] Events display correctly
- [ ] Registration form works
- [ ] Payment methods available
- [ ] File upload functions
- [ ] International packages work
- [ ] Confirmation emails sent

**Admin Dashboard:**
- [ ] Admin login works
- [ ] All registrations visible
- [ ] Export functionality works
- [ ] User management functions
- [ ] Package tracking displays

### 2. Performance Tests

**Page Load Times:**
```bash
# Test with curl
curl -w "@curl-format.txt" -o /dev/null -s "https://yourdomain.com"
```

**Database Performance:**
```sql
-- Check slow queries in Supabase
SELECT query, mean_time, calls 
FROM pg_stat_statements 
ORDER BY mean_time DESC 
LIMIT 10;
```

### 3. Security Verification

**SSL Test:**
```bash
# Check SSL rating
curl -s https://api.ssllabs.com/api/v3/analyze?host=yourdomain.com
```

**Headers Check:**
```bash
curl -I https://yourdomain.com
# Verify security headers present
```

---

## 💾 **Backup Strategy**

### 1. Database Backups

**Supabase Automatic Backups:**
- Point-in-time recovery available
- Daily automated backups
- Manual backup before major changes

**Manual Backup:**
```bash
# Using pg_dump (if direct access available)
pg_dump -h db.your-project.supabase.co -U postgres -d postgres > backup.sql
```

### 2. Code Backups

**Git Repository:**
- Always push to remote repository
- Tag releases for easy rollback
- Maintain separate production branch

### 3. File Storage Backup

**Supabase Storage:**
- Files automatically replicated
- Export important files periodically
- Monitor storage usage

---

## 🔄 **Rollback Procedures**

### 1. Application Rollback

**Frontend (Vercel):**
1. Go to Vercel dashboard
2. Select previous deployment
3. Click "Promote to Production"

**Backend (Railway):**
1. Access Railway dashboard
2. Select previous deployment
3. Redeploy previous version

### 2. Database Rollback

**Schema Changes:**
```sql
-- Always test rollback scripts
-- Example: removing new columns
ALTER TABLE event_registrations 
DROP COLUMN IF EXISTS new_column_name;
```

**Data Rollback:**
- Use Supabase point-in-time recovery
- Restore from manual backup if needed
- Always test in staging first

---

## 🚨 **Incident Response**

### 1. Issue Categories

**P0 - Critical (0-15 min response):**
- Site completely down
- Data breach
- Payment system failure

**P1 - High (0-2 hours):**
- Major feature broken
- Performance severely degraded
- Email system down

**P2 - Medium (24 hours):**
- Minor feature issues
- UI bugs
- Non-critical errors

### 2. Emergency Contacts

```
Primary: your-email@company.com
Secondary: backup-admin@company.com
Technical: developer@company.com
```

### 3. Status Page

Consider setting up a status page:
- StatusPage.io
- Atlassian Statuspage
- Custom status page

---

## 📈 **Performance Optimization**

### 1. Frontend Optimization

**Build Optimization:**
```javascript
// vite.config.ts
export default defineConfig({
  build: {
    rollupOptions: {
      output: {
        manualChunks: {
          vendor: ['react', 'react-dom'],
          ui: ['@radix-ui/react-dialog', '@radix-ui/react-select'],
        }
      }
    }
  }
});
```

**Image Optimization:**
- Use WebP format where possible
- Implement lazy loading
- Compress images before upload

### 2. Backend Optimization

**Database Indexing:**
```sql
-- Key indexes (already in schema)
CREATE INDEX IF NOT EXISTS idx_registrations_user_id ON event_registrations(user_id);
CREATE INDEX IF NOT EXISTS idx_registrations_event_id ON event_registrations(event_id);
CREATE INDEX IF NOT EXISTS idx_registrations_payment_status ON event_registrations(payment_status);
```

**Caching:**
```javascript
// Add Redis caching (optional)
const redis = require('redis');
const client = redis.createClient(process.env.REDIS_URL);

// Cache frequently accessed data
const getCachedEvents = async () => {
  const cached = await client.get('events');
  if (cached) return JSON.parse(cached);
  
  const events = await storage.getAllEvents();
  await client.setex('events', 300, JSON.stringify(events)); // 5 min cache
  return events;
};
```

---

## 🎯 **Success Metrics**

### Key Performance Indicators

**Technical Metrics:**
- Uptime: > 99.9%
- Page Load Time: < 2 seconds
- API Response Time: < 500ms
- Error Rate: < 0.1%

**Business Metrics:**
- Registration Conversion Rate
- International Package Adoption
- Admin Dashboard Usage
- Email Delivery Success Rate

**Monitor Weekly:**
- New registrations
- Payment completion rates
- User engagement
- System performance trends

---

## 🏁 **Deployment Complete!**

Your Alliance Procurement and Capacity Building system is now live in production with:

✅ **Scalable Infrastructure** - Ready to handle growth
✅ **Security Best Practices** - Protected against common threats  
✅ **Monitoring & Alerting** - Proactive issue detection
✅ **Backup & Recovery** - Data protection and business continuity
✅ **Performance Optimized** - Fast and responsive user experience

**Next Steps:**
1. Monitor system for 24-48 hours
2. Set up automated alerts
3. Train admin users on the system
4. Plan for ongoing maintenance and updates

**🎉 Your event management system is ready to handle your next major event!**