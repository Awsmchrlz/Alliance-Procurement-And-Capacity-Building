# Ministry of Health Event - Deployment Checklist

## ✅ Completed Changes

### 1. Database Migration
- Fixed `002-public-registrations.sql` - removed `::text` cast to match events table VARCHAR type
- Created `update-ministry-health-event-dates.sql` - updates event dates to 2026

### 2. Backend API
- Added `/api/events/public-register` - public registration endpoint (no auth required)
- Added `/api/admin/public-registrations` - GET endpoint for admins
- Added `/api/admin/public-registrations/:id/status` - PATCH endpoint to update status
- Added `/api/admin/public-registrations/:id` - DELETE endpoint for super admins

### 3. Frontend Components
- Created `PublicEventRegistration` component with 3-step flow:
  - Step 1: Event title with "REGISTER HERE" button
  - Step 2: Group selection (Group 1: 25-27 March, Group 2: 30 March - 2 April)
  - Step 3: Registration form (no login required)
- Created `FeaturedEventSection` component for home page
- Updated `EventCard` to use PublicEventRegistration
- Updated `events.tsx` to show featured events first and larger
- Updated `admin-dashboard.tsx` with "Public Regs" tab

## 🚀 Next Steps (Run These in Order)

### Step 1: Run Database Scripts in Supabase SQL Editor
```sql
-- First, run the migration to create the table
-- Copy/paste from: db/migrations/002-public-registrations.sql

-- Then, update the event dates to 2026
-- Copy/paste from: db/update-ministry-health-event-dates.sql
```

### Step 2: Build and Push Docker Image
```bash
# Make sure you're logged in to Docker Hub
docker login -u awsmchrlz

# Build the image
docker build -t awsmchrlz/alliance-procurement-and-capacity-building:latest .

# Push to Docker Hub
docker push awsmchrlz/alliance-procurement-and-capacity-building:latest
```

### Step 3: Deploy to Kubernetes
```bash
cd k8s

# Apply the deployment (will pull new image)
kubectl apply -f alliance-deployment.yaml

# Watch the rollout
kubectl rollout status deployment/alliance-app -n alliance

# Check pods are running
kubectl get pods -n alliance
```

### Step 4: Verify Everything Works
1. Visit your website homepage - you should see the featured Ministry of Health event
2. Click "REGISTER HERE" - should open the 3-step registration form
3. Complete registration without logging in
4. Login to admin dashboard and check "Public Regs" tab to see the registration

## 📋 What Users Will See

### Home Page
- Large featured event section with Ministry of Health event
- "REGISTER HERE" button (no login required)
- Event details: dates, location, guest of honor

### Events Page
- Ministry of Health event shown first and larger (full width)
- Featured badge on the event
- "REGISTER HERE" button opens the 3-step form

### Registration Flow (No Login Required)
1. **Step 1**: Event title and theme with "REGISTER HERE" button
2. **Step 2**: Choose Group 1 (25-27 March) or Group 2 (30 March - 2 April)
3. **Step 3**: Fill form with personal details and payment modes
4. **Success**: Confirmation message with email notification

### Admin Dashboard
- New "Public Regs" tab shows all public registrations
- Can confirm/cancel registrations
- Can export to CSV
- Shows: name, email, phone, institution, group, province, payment modes, status

## 🔧 Key Features
- No authentication required for registration
- Email confirmation sent automatically
- Admin can manage registrations from dashboard
- Featured event shows prominently on home page
- Clean 3-step registration flow matching your design
