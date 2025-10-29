# 🏗️ Alliance Procurement & Capacity Building - Architecture Overview

## 📋 Table of Contents
1. [System Overview](#system-overview)
2. [Technology Stack](#technology-stack)
3. [Architecture Layers](#architecture-layers)
4. [Data Flow](#data-flow)
5. [Key Components](#key-components)
6. [Security Model](#security-model)
7. [Deployment Architecture](#deployment-architecture)

---

## 🎯 System Overview

**Alliance Procurement and Capacity Building Platform** is a full-stack event management system that handles:
- User registration and authentication
- Event creation and management
- Event registrations with payment tracking
- Sponsorship applications
- Exhibition booth registrations
- Admin dashboard for management
- Email notifications
- File uploads (payment evidence)

### Core Purpose
Enable the Alliance organization to manage procurement and capacity building events, track registrations, handle payments, and manage sponsorships/exhibitions.

---

## 🛠️ Technology Stack

### Frontend
- **React 18** - UI library
- **TypeScript** - Type safety
- **Vite** - Build tool and dev server
- **Tailwind CSS** - Styling
- **Radix UI** - Component primitives
- **React Hook Form** - Form management
- **Zod** - Schema validation
- **Wouter** - Routing
- **TanStack Query** - Data fetching
- **date-fns** - Date manipulation
- **Lucide React** - Icons

### Backend
- **Node.js 18+** - Runtime
- **Express** - Web framework
- **TypeScript** - Type safety
- **Supabase** - Backend as a Service
  - PostgreSQL database
  - Authentication
  - Storage (file uploads)
- **Drizzle ORM** - Database ORM
- **Zod** - Schema validation
- **Express File Upload** - File handling

### External Services
- **Supabase Auth** - User authentication
- **Supabase Storage** - File storage
- **Resend** - Email service

### DevOps
- **Docker** - Containerization
- **Kubernetes** - Orchestration
- **GitHub Actions** - CI/CD
- **Docker Hub** - Image registry

---

## 🏛️ Architecture Layers

```
┌─────────────────────────────────────────────────────────────┐
│                        CLIENT LAYER                          │
│  ┌──────────┐  ┌──────────┐  ┌──────────┐  ┌──────────┐   │
│  │  Pages   │  │Components│  │  Hooks   │  │  Utils   │   │
│  └──────────┘  └──────────┘  └──────────┘  └──────────┘   │
└─────────────────────────────────────────────────────────────┘
                            ↕ HTTP/REST
┌─────────────────────────────────────────────────────────────┐
│                        SERVER LAYER                          │
│  ┌──────────┐  ┌──────────┐  ┌──────────┐  ┌──────────┐   │
│  │  Routes  │  │ Storage  │  │  Email   │  │  Auth    │   │
│  └──────────┘  └──────────┘  └──────────┘  └──────────┘   │
└─────────────────────────────────────────────────────────────┘
                            ↕ SQL/API
┌─────────────────────────────────────────────────────────────┐
│                      SUPABASE LAYER                          │
│  ┌──────────┐  ┌──────────┐  ┌──────────┐                  │
│  │PostgreSQL│  │   Auth   │  │ Storage  │                  │
│  └──────────┘  └──────────┘  └──────────┘                  │
└─────────────────────────────────────────────────────────────┘
```

### 1. **Client Layer** (`client/`)
- **Pages**: Full page components (login, register, events, admin dashboard)
- **Components**: Reusable UI components (dialogs, forms, tables)
- **Hooks**: Custom React hooks for data fetching and state
- **Lib**: Utilities (Supabase client, utils, invoice generator)

### 2. **Server Layer** (`server/`)
- **index.ts**: Entry point, Express setup
- **routes.ts**: API endpoints (2000+ lines)
- **storage.ts**: Database operations (1700+ lines)
- **email-service.ts**: Email notifications
- **evidence-resolver.ts**: File path resolution

### 3. **Shared Layer** (`shared/`)
- **schema.ts**: Database schema and TypeScript types
- Shared between client and server for type safety

### 4. **Supabase Layer** (External)
- **PostgreSQL**: Data persistence
- **Auth**: User authentication
- **Storage**: File uploads (payment evidence, logos)

---

## 🔄 Data Flow

### User Registration Flow
```
User → Register Page → POST /api/auth/register → Storage.createUser()
  ↓
Supabase Auth (create auth user)
  ↓
PostgreSQL (create user profile)
  ↓
Email Service (welcome email)
  ↓
Response → Login Page
```

### Event Registration Flow
```
User → Event Page → Registration Dialog → POST /api/events/register
  ↓
Authenticate (Supabase token)
  ↓
Validate data (Zod schema)
  ↓
Storage.createEventRegistration()
  ↓
Generate registration number
  ↓
Save to PostgreSQL
  ↓
Email confirmation
  ↓
Response → User Dashboard
```

### Admin Delete Flow
```
Admin → Admin Dashboard → Delete Button → Confirm Dialog
  ↓
DELETE /api/admin/{resource}/:id
  ↓
Check role (super_admin only)
  ↓
Storage.delete{Resource}()
  ↓
Delete from PostgreSQL
  ↓
Delete associated files from Storage
  ↓
Response → Refresh data
```

---

## 🔑 Key Components

### 1. **Authentication System**

#### Supabase Auth Integration
```typescript
// Client-side
import { supabase } from "@/lib/supabase"

// Sign in
const { data, error } = await supabase.auth.signInWithPassword({
  email: userEmail,
  password: data.password,
})

// Get session
const { data: { session } } = await supabase.auth.getSession()
```

#### Server-side Middleware
```typescript
// Verify token
const authenticateSupabase = async (req, res, next) => {
  const token = req.headers["authorization"]?.slice(7)
  const { data, error } = await supabaseAdmin.auth.getUser(token)
  req.supabaseUser = data.user
  req.supabaseRole = data.user.user_metadata?.role
  next()
}
```

### 2. **Role-Based Access Control (RBAC)**

#### Roles Hierarchy
```
super_admin (Full access)
  ├── Can delete users, registrations, sponsorships, exhibitions
  ├── Can promote/demote users
  ├── Can manage all aspects
  │
finance_person (Financial management)
  ├── Can update payment status
  ├── Can view all financial data
  ├── Cannot delete or promote users
  │
event_manager (Event management)
  ├── Can create/edit events
  ├── Can register users for events
  ├── Can view registrations
  │
ordinary_user (Basic access)
  └── Can register for events
  └── Can view own registrations
```

#### Implementation
```typescript
// Middleware
const requireRoles = (allowedRoles: RoleValue[]) => (req, res, next) => {
  if (!allowedRoles.includes(req.supabaseRole)) {
    return res.status(403).json({ message: "Insufficient permissions" })
  }
  next()
}

// Usage
app.delete("/api/admin/users/:id", 
  authenticateSupabase,
  requireRoles(["super_admin"]),
  async (req, res) => { /* ... */ }
)
```

### 3. **Database Schema**

#### Core Tables
```sql
users
  ├── id (UUID, PK)
  ├── email (text)
  ├── first_name, last_name
  ├── phone_number (unique)
  ├── role (text)
  └── created_at

events
  ├── id (UUID, PK)
  ├── title, description
  ├── start_date, end_date
  ├── location, price
  ├── max_attendees, current_attendees
  └── image_url, tags, featured

event_registrations
  ├── id (UUID, PK)
  ├── registration_number (unique)
  ├── user_id (FK → users)
  ├── event_id (FK → events)
  ├── payment_status
  ├── payment_evidence
  ├── country, organization, position
  └── add-on packages (dinner, accommodation, etc.)

sponsorships
  ├── id (UUID, PK)
  ├── event_id (FK → events)
  ├── company_name, contact_person
  ├── sponsorship_level (platinum/gold/silver/bronze)
  ├── amount, currency
  ├── status, payment_status
  └── payment_evidence

exhibitions
  ├── id (UUID, PK)
  ├── event_id (FK → events)
  ├── company_name, contact_person
  ├── booth_size
  ├── amount, currency
  ├── status, payment_status
  └── payment_evidence
```

### 4. **File Upload System**

#### Flow
```
User uploads file → Express File Upload middleware
  ↓
Generate unique filename
  ↓
Upload to Supabase Storage (payment-evidence bucket)
  ↓
Store file path in database
  ↓
Return file path to client
```

#### Storage Structure
```
payment-evidence/
  ├── evidence/{userId}/{eventId}/{filename}
  ├── sponsorships/{eventId}/{filename}
  └── exhibitions/{eventId}/{filename}
```

### 5. **Email Notification System**

#### Email Types
- User registration confirmation
- Event registration confirmation
- Password reset
- Admin notifications (new user, new registration)
- Sponsorship confirmation
- Exhibition confirmation

#### Implementation
```typescript
// server/email-service.ts
class EmailService {
  async sendEventRegistrationConfirmation(data, recipient) {
    // Uses Resend API
    await resend.emails.send({
      from: "APCB <noreply@apcb.org>",
      to: recipient.email,
      subject: "Event Registration Confirmed",
      html: this.generateTemplate(data)
    })
  }
}
```

---

## 🔐 Security Model

### 1. **Authentication**
- Supabase Auth handles password hashing (bcrypt)
- JWT tokens for session management
- Token validation on every protected route

### 2. **Authorization**
- Role-based access control (RBAC)
- Middleware checks user role before allowing operations
- Super Admin required for destructive operations

### 3. **Data Protection**
- Environment variables for sensitive data
- Secrets never committed to git
- HTTPS enforced in production
- CORS configured properly

### 4. **Input Validation**
- Zod schemas validate all inputs
- SQL injection prevented by Drizzle ORM
- XSS protection via React's built-in escaping

### 5. **File Upload Security**
- File size limits (10MB)
- File type validation
- Unique filenames prevent overwrites
- Storage bucket permissions (authenticated write)

---

## 🚀 Deployment Architecture

### Development
```
Developer Machine
  ├── npm run dev (Vite dev server on :5173)
  ├── tsx server/index.ts (Express on :3000)
  └── Supabase (cloud)
```

### Production - Docker
```
Docker Container
  ├── Node.js 18 Alpine
  ├── Built frontend (dist/public/)
  ├── Built backend (dist/index.js)
  ├── Express serves both
  └── Port 3000
```

### Production - Kubernetes
```
Kubernetes Cluster
  ├── Namespace: apcb-system
  ├── Deployment: apcb-app (2-10 replicas)
  ├── Service: apcb-service (ClusterIP)
  ├── Ingress: nginx (with Cloudflare)
  ├── HPA: Auto-scaling based on CPU/memory
  ├── PVC: Persistent storage for uploads
  └── ConfigMap/Secrets: Environment variables
```

### CI/CD Pipeline
```
GitHub Push
  ↓
GitHub Actions
  ├── Build Docker image (multi-platform)
  ├── Run security scan (Trivy)
  ├── Push to Docker Hub
  └── Tag with version/branch
  ↓
Kubernetes pulls new image
  ↓
Rolling update (zero downtime)
```

---

## 📊 Request Flow Examples

### 1. User Login
```
POST /api/auth/login
  ↓
Find user by email/phone (storage.getUserByEmailOrPhone)
  ↓
Verify password (Supabase Auth)
  ↓
Generate JWT token
  ↓
Return user data + token
  ↓
Client stores token in memory
  ↓
Subsequent requests include: Authorization: Bearer {token}
```

### 2. Event Registration
```
POST /api/events/register
  ↓
authenticateSupabase middleware (verify token)
  ↓
Validate request body (Zod schema)
  ↓
Check if already registered
  ↓
Generate registration number
  ↓
Create registration in database
  ↓
Send confirmation email (async)
  ↓
Notify admins (async)
  ↓
Return registration data
```

### 3. Admin Delete User
```
DELETE /api/admin/users/:userId
  ↓
authenticateSupabase middleware
  ↓
requireRoles(["super_admin"]) middleware
  ↓
Check user exists
  ↓
Prevent self-deletion
  ↓
Delete from users table
  ↓
Delete from Supabase Auth
  ↓
Return success
```

---

## 🔧 Configuration

### Environment Variables
```bash
# Supabase
SUPABASE_URL=https://xxx.supabase.co
SUPABASE_SERVICE_ROLE_KEY=xxx
SUPABASE_ANON_KEY=xxx

# Email
RESEND_API_KEY=xxx

# App
NODE_ENV=production
PORT=3000
HOST=0.0.0.0
```

### Build Process
```bash
# Frontend build (Vite)
vite build → dist/public/

# Backend build (esbuild)
esbuild server/index.ts → dist/index.js

# Production start
node dist/index.js
```

---

## 📈 Scalability

### Horizontal Scaling
- Stateless application design
- Session stored in Supabase (not in-memory)
- Multiple replicas can run simultaneously
- Load balanced via Kubernetes Service

### Database Scaling
- Supabase handles database scaling
- Connection pooling
- Read replicas available

### File Storage Scaling
- Supabase Storage (S3-compatible)
- CDN for static assets
- Automatic backups

---

## 🎯 Key Features Implementation

### 1. Password Reset (Production-Ready)
- Auto-detects production vs development URLs
- Sends reset email with correct domain
- Token validation on reset page
- Secure password update

### 2. Admin Delete Functionality
- Super Admin only
- Confirmation dialogs
- Cascading deletes (files + database)
- Audit logging

### 3. Payment Tracking
- Upload payment evidence
- Admin can view/verify
- Status updates (pending → paid)
- Multiple payment methods

### 4. Multi-tenancy
- Events can have multiple registrations
- Sponsorships and exhibitions per event
- User can register for multiple events

---

## 📚 Code Organization

```
project/
├── client/               # Frontend React app
│   ├── src/
│   │   ├── pages/       # Full page components
│   │   ├── components/  # Reusable components
│   │   ├── lib/         # Utilities
│   │   └── hooks/       # Custom hooks
├── server/              # Backend Express app
│   ├── index.ts         # Entry point
│   ├── routes.ts        # API routes
│   ├── storage.ts       # Database operations
│   └── email-service.ts # Email handling
├── shared/              # Shared types
│   └── schema.ts        # Database schema
├── k8s/                 # Kubernetes configs
├── .github/workflows/   # CI/CD pipelines
├── Dockerfile           # Container definition
└── docker-compose.yml   # Local development
```

---

**Last Updated**: January 2025  
**Version**: 2.0.0  
**Status**: Production Ready ✅
