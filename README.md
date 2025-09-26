# 🏢 Alliance Procurement and Capacity Building

**Production-Ready Event Management System**

A comprehensive web application for managing events, registrations, payments, and participants with advanced features for international delegates including accommodation and tourism packages.

---

## 🎯 **Overview**

This system provides a complete event management solution featuring:

- **Multi-step Registration Process** with payment integration
- **International Delegate Packages** (accommodation + Victoria Falls adventure)
- **Role-based Admin Dashboard** with comprehensive reporting
- **Payment Evidence Management** with file uploads
- **Email Notifications** and automated confirmations
- **Export Capabilities** for participant data and analytics

---

## 🛠 **Tech Stack**

### Frontend
- **React 18** + **TypeScript** + **Vite**
- **Tailwind CSS** + **shadcn/ui** components
- **TanStack Query** for state management
- **React Hook Form** for form validation

### Backend
- **Node.js** + **Express** + **TypeScript**
- **Supabase** for database and authentication
- **Resend API** for email services
- **File upload** with Supabase Storage

### Database
- **PostgreSQL** via Supabase
- **Row Level Security** (RLS) enabled
- **Automated functions** and triggers

---

## 🚀 **Quick Start**

### Prerequisites
- Node.js 18+
- Supabase account
- Email service (Resend) account

### 1. Clone and Install
```bash
git clone <repository-url>
cd Alliance-Procurement-And-Capacity-Building
npm install
```

### 2. Environment Configuration

Create `.env` in the root directory:
```env
# Database
SUPABASE_URL=your_supabase_project_url
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key

# Email Service
RESEND_API_KEY=your_resend_api_key
FROM_EMAIL=noreply@yourdomain.com

# Server
PORT=3000
NODE_ENV=production
```

Create `client/.env.local`:
```env
# Client Configuration
VITE_SUPABASE_URL=your_supabase_project_url
VITE_SUPABASE_ANON_KEY=your_anon_key
VITE_SUPABASE_EVIDENCE_BUCKET=registrations
VITE_API_URL=https://your-api-domain.com
```

### 3. Database Setup

**Single Script Deployment:**

1. Copy the entire contents of `database-schema.sql`
2. Paste into your Supabase SQL Editor
3. Execute the script

The schema includes:
- ✅ All tables and relationships
- ✅ International delegate package fields
- ✅ Indexes for performance
- ✅ RLS policies
- ✅ Functions and triggers
- ✅ Verification queries

### 4. Deploy

**Frontend (Vercel/Netlify):**
```bash
cd client && npm run build
# Deploy the 'dist' folder
```

**Backend (Railway/Heroku/VPS):**
```bash
npm run build
npm start
```

---

## 🏗 **Project Structure**

```
├── client/                 # React Frontend
│   ├── src/
│   │   ├── components/    # UI Components
│   │   ├── pages/         # Route Pages
│   │   ├── hooks/         # Custom Hooks
│   │   └── lib/           # Utilities
│   └── dist/              # Built Frontend
├── server/                 # Express Backend
│   ├── routes.ts          # API Endpoints
│   ├── storage.ts         # Database Layer
│   └── email-service.ts   # Email Functions
├── shared/                 # Shared Types
│   └── schema.ts          # Database Schema & Validation
├── database-schema.sql     # Complete Database Setup
├── package.json           # Dependencies & Scripts
└── README.md              # This File
```

---

## 🎯 **Core Features**

### 🎫 **Event Registration**
- **3-Step Process**: Personal Info → Organization → Payment
- **International Packages**: Accommodation ($800) + Adventure ($950)
- **Payment Methods**: Mobile Money, Bank Transfer, Cash
- **Evidence Upload**: PNG/JPG/PDF files up to 10MB

### 👥 **User Management**
- **Role-based Access**: Super Admin, Finance, Event Manager, User
- **Authentication**: Secure Supabase Auth
- **Profile Management**: Complete user profiles

### 📊 **Admin Dashboard**
- **Registration Overview**: All participants at a glance
- **Package Tracking**: See who selected accommodation/adventure
- **Payment Management**: Status tracking and evidence review
- **Data Export**: Excel/CSV reports with all details

### 📧 **Email System**
- **Registration Confirmations**: Automated emails
- **Admin Notifications**: New registration alerts
- **Newsletter System**: Subscriber management

---

## 💰 **Pricing Structure**

| Delegate Type | Base Price | Accommodation | Victoria Falls | Dinner Gala |
|---------------|------------|---------------|----------------|-------------|
| Private Sector | ZMW 7,000 | N/A | N/A | +ZMW 2,500 |
| Public Sector | ZMW 6,500 | N/A | N/A | +ZMW 2,500 |
| **International** | **USD 650** | **+USD 150** | **+USD 300** | **+USD 110** |

### International Packages
- **🏨 Accommodation**: Hotel stay during event
- **🦁 Victoria Falls Adventure**: Accommodation + Game viewing + Boat cruise + Falls visit

---

## 🔐 **User Roles & Permissions**

| Feature | User | Event Manager | Finance | Super Admin |
|---------|------|---------------|---------|-------------|
| Event Registration | ✅ | ✅ | ✅ | ✅ |
| View Own Data | ✅ | ✅ | ✅ | ✅ |
| Upload Evidence | ✅ | ✅ | ✅ | ✅ |
| View All Registrations | ❌ | ✅ | ✅ | ✅ |
| Update Payment Status | ❌ | ❌ | ✅ | ✅ |
| User Management | ❌ | ❌ | ❌ | ✅ |
| Event Management | ❌ | ❌ | ❌ | ✅ |

---

## 📡 **API Endpoints**

### Public
```
GET  /api/events              # List events
GET  /api/events/:id          # Event details
POST /api/newsletter/subscribe # Newsletter signup
```

### Authenticated
```
POST /api/events/register          # Register for event
GET  /api/users/registrations      # User's registrations
PUT  /api/users/payment-evidence   # Upload evidence
```

### Admin
```
GET    /api/admin/users             # List users
POST   /api/admin/users             # Create user
GET    /api/admin/registrations     # All registrations
PATCH  /api/admin/registrations/:id # Update registration
POST   /api/admin/events            # Create event
PUT    /api/admin/events/:id        # Update event
```

---

## 🚀 **Production Deployment**

### Environment Preparation
1. **Database**: Set up production Supabase project
2. **Email**: Configure Resend with verified domain
3. **Storage**: Configure Supabase storage bucket
4. **DNS**: Set up custom domain

### Security Checklist
- [ ] Environment variables secured
- [ ] Database RLS policies enabled
- [ ] HTTPS enforced
- [ ] CORS configured properly
- [ ] File upload limits enforced
- [ ] Rate limiting implemented

### Performance Optimization
- [ ] Database indexes created
- [ ] CDN configured for assets
- [ ] Image optimization enabled
- [ ] Compression enabled
- [ ] Caching headers set

---

## 🔍 **Monitoring & Analytics**

### Key Metrics
- **Registration Conversion**: Registration starts → completions
- **Package Adoption**: International package selection rates
- **Payment Success**: Payment completion rates
- **User Engagement**: Dashboard usage and activity

### Error Monitoring
- API response times and error rates
- Database query performance
- File upload success/failure rates
- Email delivery status

---

## 🐛 **Troubleshooting**

### Common Issues

**Database Connection**
```bash
# Check Supabase connection
curl -H "apikey: YOUR_ANON_KEY" \
     -H "Authorization: Bearer YOUR_ANON_KEY" \
     "https://your-project.supabase.co/rest/v1/users?select=*"
```

**File Upload Issues**
- Verify bucket exists: `registrations`
- Check bucket policies in Supabase
- Confirm file size limits (10MB max)

**Email Not Sending**
- Verify Resend API key
- Check domain verification status
- Review email template syntax

### Database Queries
```sql
-- Check registration counts
SELECT delegate_type, COUNT(*) 
FROM event_registrations 
GROUP BY delegate_type;

-- International package statistics
SELECT 
  SUM(CASE WHEN accommodation_package THEN 1 ELSE 0 END) as accommodation,
  SUM(CASE WHEN victoria_falls_package THEN 1 ELSE 0 END) as victoria_falls
FROM event_registrations 
WHERE delegate_type = 'international';
```

---

## 📞 **Support**

### Getting Help
1. Check this README for common solutions
2. Review API error messages in browser console
3. Check server logs for backend issues
4. Verify environment variable configuration

### Production Support
- **Database Issues**: Check Supabase dashboard logs
- **Email Issues**: Review Resend delivery logs  
- **Performance**: Monitor server resource usage
- **Security**: Review access logs and failed attempts

---

## 📝 **Version Information**

**Current Version**: 2.0.0  
**Last Updated**: 2024  
**Node.js**: 18+  
**Database**: PostgreSQL (Supabase)  

### Recent Updates
- ✅ International delegate packages implemented
- ✅ Admin dashboard enhanced with package tracking
- ✅ Single database schema for clean deployments
- ✅ Production-ready documentation
- ✅ Complete TypeScript coverage

---

## 🎉 **Success!**

Your Alliance Procurement and Capacity Building event management system is now production-ready with:

- ✅ **International Delegate Packages** for accommodation and Victoria Falls adventures
- ✅ **Comprehensive Admin Dashboard** for complete event oversight  
- ✅ **Professional UI/UX** with responsive design
- ✅ **Robust Backend** with proper error handling
- ✅ **Production Security** with role-based access
- ✅ **Complete Documentation** for maintenance and scaling

**Ready to handle your next major event!** 🚀