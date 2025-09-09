# Alliance Procurement and Capacity Building

A comprehensive event management system for Alliance Procurement and Capacity Building, featuring user registration, payment processing, evidence management, and administrative controls.

## 🚀 Features

### User Features
- **User Registration & Authentication** - Secure account creation and login
- **Event Browsing** - View upcoming events with detailed information
- **Event Registration** - Multi-step registration process with payment options
- **Payment Evidence Upload** - Upload proof of payment during registration
- **Personal Dashboard** - Manage registrations and upload evidence
- **Email Notifications** - Automated confirmation emails

### Admin Features
- **Admin Dashboard** - Comprehensive management interface
- **User Management** - Create and manage user accounts
- **Event Management** - Create, edit, and manage events
- **Registration Oversight** - View and manage all event registrations
- **Payment Evidence Review** - View and verify payment proofs
- **Role-based Access Control** - Super Admin, Finance Person, Event Manager roles
- **Email Campaigns** - Send newsletters and notifications

## 🛠 Tech Stack

- **Frontend**: React 18 + TypeScript + Vite
- **Backend**: Node.js + Express + TypeScript
- **Database**: PostgreSQL (via Supabase)
- **Authentication**: Supabase Auth
- **Storage**: Supabase Storage
- **Styling**: Tailwind CSS + shadcn/ui
- **Email**: Resend API
- **State Management**: TanStack Query (React Query)

## 📁 Project Structure

```
Alliance-Procurement-And-Capacity-Building/
├── client/                 # Frontend React application
│   ├── src/
│   │   ├── components/    # Reusable UI components
│   │   ├── pages/         # Page components
│   │   ├── hooks/         # Custom React hooks
│   │   └── lib/           # Utility libraries
├── server/                 # Backend Express application
│   ├── routes.ts          # API route handlers
│   └── storage.ts         # Database operations
├── shared/                 # Shared TypeScript types and schemas
│   └── schema.ts          # Database schema definitions
├── supabase/              # Supabase configuration
├── COMPLETE_SETUP.sql     # One script for complete database setup
```

## ⚙️ Setup Instructions

### Prerequisites
- Node.js 18+ 
- PostgreSQL database (Supabase recommended)
- Supabase account
- Resend account (for emails)

### 1. Clone Repository
```bash
git clone <repository-url>
cd Alliance-Procurement-And-Capacity-Building
npm install
```

### 2. Environment Variables

Create `.env` in the root directory:
```env
# Database
SUPABASE_URL=your_supabase_project_url
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key

# Email Service
RESEND_API_KEY=your_resend_api_key
FROM_EMAIL=charles@allianceprocurementandcapacitybuilding.org

# Storage
VITE_SUPABASE_EVIDENCE_BUCKET=registrations

# Server
PORT=3000
NODE_ENV=development
```

Create `.env.local` in the client directory:
```env
# Client-side Supabase config
VITE_SUPABASE_URL=your_supabase_project_url
VITE_SUPABASE_ANON_KEY=your_anon_key
VITE_SUPABASE_EVIDENCE_BUCKET=registrations

# API Base URL
VITE_API_URL=http://localhost:3000
```

### 3. Database Setup

**One Script Does Everything!**

Run the complete setup script in your Supabase SQL Editor:

```sql
-- Copy and paste the entire COMPLETE_SETUP.sql file into your Supabase SQL Editor and run it
-- This single script handles:
-- ✅ Database schema creation
-- ✅ Storage bucket setup with policies  
-- ✅ Title field removal (normalization)
-- ✅ Indexes and performance optimization
-- ✅ Data cleanup and validation
-- ✅ Functions and triggers
```

The script will show you progress messages and confirm everything is set up correctly.

### 4. Start Development Servers

**Terminal 1 - Backend**:
```bash
npm run server
```

**Terminal 2 - Frontend**:
```bash
cd client
npm run dev
```

## 📊 Database Schema

### Core Tables
- **users** - User accounts with role-based access
- **events** - Event information and details
- **event_registrations** - User event registrations with payment tracking
- **newsletter_subscriptions** - Email newsletter subscribers

### Storage
- **registrations bucket** - Payment evidence files (images, PDFs)

## 🔐 Authentication & Roles

### User Roles
- **Ordinary User** - Can register for events, manage own registrations
- **Event Manager** - Can view registrations and evidence
- **Finance Person** - Can update payment status and manage evidence
- **Super Admin** - Full system access and user management

### Permissions Matrix
| Feature | Ordinary User | Event Manager | Finance Person | Super Admin |
|---------|---------------|---------------|----------------|-------------|
| Register for Events | ✅ | ✅ | ✅ | ✅ |
| View Own Registrations | ✅ | ✅ | ✅ | ✅ |
| Upload Evidence | ✅ | ✅ | ✅ | ✅ |
| View All Registrations | ❌ | ✅ | ✅ | ✅ |
| Update Payment Status | ❌ | ❌ | ✅ | ✅ |
| Manage Users | ❌ | ❌ | ❌ | ✅ |
| Create Events | ❌ | ❌ | ❌ | ✅ |

## 🎯 Key Features

### Event Registration Process
1. **Step 1**: Personal Information (name, email, phone, gender, country)
2. **Step 2**: Organization Details (organization, type, position, notes)
3. **Step 3**: Payment & Evidence Upload
   - Select payment method (mobile money, bank transfer, cash)
   - Upload payment proof (optional, PNG/JPG/PDF up to 10MB)
   - Complete registration

### Payment Methods
- **Mobile Money** - Airtel/MTN numbers provided
- **Bank Transfer** - Standard Chartered Bank details
- **Cash Payment** - Pay at event (no evidence needed)

### Email System
- Registration confirmations
- Admin notifications for new registrations
- Newsletter campaigns
- Payment status updates

## 🚀 Quick Start

1. **Clone and Install**:
   ```bash
   git clone <repository-url>
   cd Alliance-Procurement-And-Capacity-Building
   npm install
   ```

2. **Set Environment Variables** (see above)

3. **Run Database Setup**:
   - Copy entire `COMPLETE_SETUP.sql` content
   - Paste in Supabase SQL Editor
   - Run it once - handles everything!

4. **Start Application**:
   ```bash
   # Terminal 1 - Backend
   npm run server
   
   # Terminal 2 - Frontend  
   cd client && npm run dev
   ```

## 🔧 API Endpoints

### Public Endpoints
- `GET /api/events` - List all events
- `GET /api/events/:id` - Get event details

### Authenticated User Endpoints
- `POST /api/events/register` - Register for event
- `GET /api/users/registrations` - Get user's registrations
- `PUT /api/users/payment-evidence/:id` - Upload payment evidence
- `POST /api/newsletter/subscribe` - Subscribe to newsletter

### Admin Endpoints
- `GET /api/admin/users` - List all users
- `POST /api/admin/users` - Create new user
- `GET /api/admin/registrations` - List all registrations
- `PATCH /api/admin/registrations/:id` - Update registration
- `POST /api/admin/events` - Create event
- `PUT /api/admin/events/:id` - Update event

## 🔍 Troubleshooting

### Storage Issues
**Error**: "Bucket not found"
- Ensure you ran `COMPLETE_SETUP.sql` successfully
- Check `VITE_SUPABASE_EVIDENCE_BUCKET` environment variable

**Error**: "Permission denied"
- Verify user authentication
- Check RLS policies in Supabase
- Ensure user roles are set correctly

### Authentication Issues
**Error**: "No active session"
- Clear browser localStorage
- Re-login to application
- Check Supabase Auth configuration

### Email Issues
**Error**: Email not sending
- Verify Resend API key
- Check FROM_EMAIL configuration
- Ensure domain verification in Resend

## 🆕 Recent Changes

### Complete System Normalization
- **Single Setup Script**: `COMPLETE_SETUP.sql` handles everything
- **Title Field Removal**: Normalized database - removed title dropdowns
- **Payment Evidence Upload**: Restored file upload during registration
- **Project Cleanup**: Consolidated documentation, removed unused files
- **Consistent Bucket Configuration**: Fixed storage bucket issues
- **Enhanced Error Handling**: Better user feedback for upload failures

## 🚀 Deployment

### Prerequisites for Production
1. Supabase project configured
2. Domain configured for emails
3. Environment variables set
4. SSL certificate (recommended)

### Build Commands
```bash
# Build frontend
cd client && npm run build

# Start production server
npm start
```

## 📞 Support

For technical issues or questions:
- Check the troubleshooting section above
- Review Supabase logs for database issues
- Verify environment variable configuration
- Ensure all required services are running

---

**Version**: 2.0.0  
**Last Updated**: 2024  
**License**: Private  
**Maintainer**: Alliance Procurement and Capacity Building