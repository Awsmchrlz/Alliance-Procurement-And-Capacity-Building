# 🎯 Features Explained - How Everything Works

## Core Features Deep Dive

### 1. 👤 User Management System

#### Registration Process
**What happens when a user registers:**

1. **Frontend** (`client/src/pages/register.tsx`):
   - User fills form with: name, email, phone, password, gender
   - Form validated with React Hook Form + Zod
   - Phone number must be unique (business rule)
   - Email can be shared (for company emails)

2. **Backend** (`POST /api/auth/register`):
   ```typescript
   // Check if phone already exists
   const { phoneExists } = await storage.checkUserExists(email, phone)
   
   // First user becomes super_admin automatically
   const isFirstUser = (await storage.getAllUsers()).length === 0
   const role = isFirstUser ? "super_admin" : "ordinary_user"
   
   // Create in Supabase Auth (handles password hashing)
   const authUser = await supabase.auth.admin.createUser({
     email, password,
     user_metadata: { role, first_name, last_name }
   })
   
   // Create profile in database
   await supabase.from("users").insert({
     id: authUser.id,
     first_name, last_name, phone_number, gender
   })
   
   // Send welcome email (async, doesn't block response)
   emailService.sendUserWelcomeEmail(...)
   ```

3. **Result**:
   - User created in both Supabase Auth and PostgreSQL
   - Welcome email sent
   - Admins notified (if not first user)
   - User can now login

#### Login Process
**Supports both email AND phone number:**

```typescript
// User enters email OR phone
POST /api/auth/login { identifier: "user@email.com" or "+260123456" }

// Backend finds user
const user = await storage.getUserByEmailOrPhone(identifier)

// Authenticate with Supabase (always uses email)
const { data } = await supabase.auth.signInWithPassword({
  email: user.email,  // Found from phone if needed
  password
})

// Return JWT token + user data
return { user, token: data.session.access_token }
```

#### Password Reset (Production-Ready!)
**The fix we implemented:**

```typescript
// Frontend detects environment automatically
function getPasswordResetUrl() {
  const isDevelopment = hostname === "localhost" || port === "3000"
  
  if (isDevelopment) {
    return window.location.origin + "/reset-password"
  }
  
  // Production: force HTTPS
  return `https://${hostname}/reset-password`
}

// Send reset email
await supabase.auth.resetPasswordForEmail(email, {
  redirectTo: getPasswordResetUrl()  // Correct URL!
})
```

**Why it works now:**
- ✅ Auto-detects production vs development
- ✅ Forces HTTPS in production
- ✅ No environment variables needed
- ✅ Works on any hosting platform

---

### 2. 📅 Event Management

#### Event Creation (Admin Only)
```typescript
POST /api/admin/events
Requires: super_admin or event_manager role

{
  title: "Annual Procurement Summit",
  description: "...",
  startDate: "2025-06-01",
  endDate: "2025-06-03",
  location: "Lusaka, Zambia",
  price: "500.00",
  maxAttendees: 200,
  imageUrl: "https://...",
  tags: ["procurement", "capacity-building"],
  featured: true
}

// Backend creates event
const event = await storage.createEvent(eventData)

// Notifies all users via email
emailService.sendEventCreationNotification(event, allUsers)
```

#### Event Registration (Any User)
```typescript
POST /api/events/register
Requires: authenticated user

{
  eventId: "uuid",
  userId: "uuid",  // Must match authenticated user
  country: "Zambia",
  organization: "Ministry of Finance",
  position: "Procurement Officer",
  delegateType: "public",  // private, public, international
  dinnerGalaAttendance: true,
  accommodationPackage: false,
  victoriaFallsPackage: true,
  boatCruisePackage: false
}

// Backend process:
1. Verify user is registering themselves
2. Check not already registered
3. Generate unique registration number (e.g., "0001")
4. Create registration with status "pending"
5. Send confirmation email to user
6. Notify admins
7. Return registration data
```

**Registration Number Generation:**
```sql
-- Database function
CREATE OR REPLACE FUNCTION generate_registration_number()
RETURNS TEXT AS $$
DECLARE
  next_num INTEGER;
BEGIN
  SELECT COALESCE(MAX(CAST(registration_number AS INTEGER)), 0) + 1
  INTO next_num
  FROM event_registrations;
  
  RETURN LPAD(next_num::TEXT, 4, '0');
END;
$$ LANGUAGE plpgsql;
```

---

### 3. 💰 Payment Tracking System

#### Payment Evidence Upload
```typescript
// User uploads file
const formData = new FormData()
formData.append('file', file)
formData.append('userId', userId)
formData.append('eventId', eventId)

POST /api/upload/payment-evidence

// Backend process:
1. Validate file (size < 10MB, type allowed)
2. Generate unique filename
3. Upload to Supabase Storage
   Path: evidence/{userId}/{eventId}/{timestamp}_{filename}
4. Return file path
5. Frontend saves path to registration
```

#### Admin Payment Verification
```typescript
// Admin views payment evidence
GET /api/admin/evidence/{evidencePath}
Requires: super_admin, finance_person, or event_manager

// Backend:
1. Verify admin role
2. Download file from Supabase Storage
3. Stream file to admin
4. Admin can view/download

// Admin updates payment status
PATCH /api/admin/registrations/{id}
Requires: super_admin or finance_person

{
  paymentStatus: "paid",
  hasPaid: true
}

// Constraint enforced:
// If hasPaid = true, paymentStatus MUST be "paid"
// If hasPaid = false, paymentStatus MUST be "pending" or "cancelled"
```

---

### 4. 🗑️ Admin Delete Functionality (NEW!)

#### Delete User
```typescript
DELETE /api/admin/users/:userId
Requires: super_admin ONLY

// Frontend confirmation
if (!confirm(`Delete user "${userName}"? Cannot be undone!`)) return

// Backend process:
1. Check user exists
2. Prevent self-deletion (can't delete yourself)
3. Delete from users table
4. Delete from Supabase Auth
5. Log deletion
6. Return success

// Cascading: User's registrations remain (for audit)
```

#### Delete Registration
```typescript
DELETE /api/admin/registrations/:id
Requires: super_admin ONLY

// Backend process:
1. Get registration (includes payment_evidence path)
2. Delete payment evidence file from Storage
3. Delete registration from database
4. Update event attendance count
5. Return success
```

#### Delete Sponsorship/Exhibition
```typescript
DELETE /api/admin/sponsorships/:id
DELETE /api/admin/exhibitions/:id
Requires: super_admin ONLY

// Backend process:
1. Get record (includes payment_evidence and logo_url)
2. Delete payment evidence file (if exists)
3. Delete logo file (if exists)
4. Delete record from database
5. Return success

// Files deleted even if deletion fails (best effort)
```

**Why Super Admin Only?**
- Destructive operations
- Cannot be undone
- Audit trail important
- Prevents accidental deletions

---

### 5. 🏢 Sponsorship System

#### Sponsorship Levels & Pricing
```typescript
const SPONSORSHIP_LEVELS = {
  platinum: { amount: 50000, benefits: "..." },
  gold: { amount: 30000, benefits: "..." },
  silver: { amount: 15000, benefits: "..." },
  bronze: { amount: 5000, benefits: "..." }
}
```

#### Application Process
```typescript
POST /api/sponsorships/register (PUBLIC - no auth required)

{
  eventId: "uuid",
  companyName: "ABC Corp",
  contactPerson: "John Doe",
  email: "john@abc.com",
  phoneNumber: "+260...",
  sponsorshipLevel: "gold",
  amount: 30000,
  currency: "USD",
  specialRequirements: "Logo on stage backdrop",
  paymentEvidence: "path/to/file"  // Optional at submission
}

// Backend:
1. Validate data
2. Create with status "pending"
3. Send confirmation email to company
4. Notify admins
5. Return application ID
```

#### Admin Approval
```typescript
PATCH /api/admin/sponsorships/:id/status
Requires: super_admin or finance_person

{
  status: "approved",  // or "rejected"
  paymentStatus: "paid"  // optional
}

// When approved:
1. Status changes to "approved"
2. Appears on public showcase (if configured)
3. Company notified via email
```

---

### 6. 🏪 Exhibition System

#### Booth Sizes & Pricing
```typescript
const BOOTH_SIZES = {
  standard: { size: "3m x 3m", amount: 7000 },
  premium: { size: "6m x 3m", amount: 12000 },
  custom: { size: "Custom", amount: "TBD" }
}
```

#### Application Process
```typescript
POST /api/exhibitions/register (PUBLIC)

{
  eventId: "uuid",
  companyName: "XYZ Ltd",
  boothSize: "standard",
  amount: 7000,
  productsServices: "IT Solutions",
  electricalRequirements: true,
  internetRequirements: true,
  boothRequirements: "Corner booth preferred"
}

// Similar flow to sponsorships
```

---

### 7. 📧 Email Notification System

#### Email Types & Triggers

**1. User Welcome Email**
```typescript
Trigger: User registration
To: New user
Content: Welcome message, next steps, login link
```

**2. Event Registration Confirmation**
```typescript
Trigger: Event registration
To: Registered user
Content: 
  - Event details
  - Registration number
  - Payment instructions
  - Add-on packages selected
```

**3. Password Reset**
```typescript
Trigger: Forgot password
To: User
Content: Reset link (with correct production URL!)
```

**4. Admin Notifications**
```typescript
Trigger: New user, registration, sponsorship, exhibition
To: All super_admins and relevant role users
Content: Summary of new item, link to admin dashboard
```

**5. Sponsorship/Exhibition Confirmation**
```typescript
Trigger: Application submission
To: Company contact
Content: Application received, next steps, payment info
```

#### Email Service Implementation
```typescript
// server/email-service.ts
class EmailService {
  private resend: Resend
  
  async sendEventRegistrationConfirmation(data, recipient) {
    const html = this.generateTemplate({
      title: "Registration Confirmed",
      content: `
        <h2>Thank you for registering!</h2>
        <p>Event: ${data.eventTitle}</p>
        <p>Registration #: ${data.registrationNumber}</p>
        <p>Date: ${data.eventDate}</p>
      `
    })
    
    await this.resend.emails.send({
      from: "APCB <noreply@apcb.org>",
      to: recipient.email,
      subject: "Event Registration Confirmed",
      html
    })
  }
}
```

---

### 8. 📊 Admin Dashboard

#### Dashboard Sections

**1. Overview Tab**
```typescript
- Total users count
- Total events count
- Total registrations count
- Revenue statistics
- Recent activity
- Quick actions
```

**2. Users Tab** (super_admin, event_manager)
```typescript
Features:
- List all users
- Search/filter users
- View user details
- Promote/demote roles
- Delete users (super_admin only)
- Register user for event
- Export to Excel
```

**3. Events Tab** (all admin roles)
```typescript
Features:
- List all events
- Create new event
- Edit event details
- View registrations per event
- Export event data
```

**4. Registrations Tab** (all admin roles)
```typescript
Features:
- List all registrations
- Filter by event, status, payment
- View payment evidence
- Update payment status (finance only)
- Delete registration (super_admin only)
- Export to Excel
- Send bulk emails
```

**5. Sponsorships Tab** (super_admin, finance)
```typescript
Features:
- List all applications
- Approve/reject applications
- Update payment status
- View payment evidence
- Upload company logo
- Delete sponsorship (super_admin only)
```

**6. Exhibitions Tab** (super_admin, finance)
```typescript
Features:
- List all applications
- Approve/reject applications
- Update payment status
- View payment evidence
- Upload company logo
- Delete exhibition (super_admin only)
```

#### Role-Based UI
```typescript
// Components conditionally render based on role
const isSuperAdmin = userRole === "super_admin"
const canUpdatePayment = ["super_admin", "finance_person"].includes(userRole)

{isSuperAdmin && (
  <DropdownMenuItem onClick={handleDelete}>
    <Trash2 /> Delete Permanently
  </DropdownMenuItem>
)}
```

---

### 9. 🔍 Search & Filter System

#### Global Search
```typescript
// Admin dashboard has search across all tabs
const [searchTerm, setSearchTerm] = useState("")

const filteredUsers = users.filter(user =>
  user.firstName.toLowerCase().includes(searchTerm.toLowerCase()) ||
  user.lastName.toLowerCase().includes(searchTerm.toLowerCase()) ||
  user.email.toLowerCase().includes(searchTerm.toLowerCase())
)
```

#### Advanced Filters
```typescript
// Filter registrations by multiple criteria
const filtered = registrations.filter(reg => {
  if (eventFilter && reg.eventId !== eventFilter) return false
  if (statusFilter && reg.paymentStatus !== statusFilter) return false
  if (dateFilter && !isWithinRange(reg.registeredAt, dateFilter)) return false
  return true
})
```

---

### 10. 📱 Responsive Design

#### Mobile-First Approach
```typescript
// Desktop table view
<div className="hidden lg:block">
  <Table>...</Table>
</div>

// Mobile card view
<div className="lg:hidden">
  {items.map(item => (
    <Card>...</Card>
  ))}
</div>
```

#### Touch-Friendly
- Large tap targets (min 44px)
- Swipe gestures for dialogs
- Mobile-optimized forms
- Responsive navigation

---

## 🔐 Security Features

### 1. Authentication Security
- Passwords hashed with bcrypt (Supabase)
- JWT tokens with expiration
- Secure session management
- Password reset with time-limited tokens

### 2. Authorization Security
- Role-based access control
- Middleware checks on every protected route
- Frontend hides unauthorized UI
- Backend enforces permissions

### 3. Data Security
- Input validation (Zod schemas)
- SQL injection prevention (Drizzle ORM)
- XSS protection (React escaping)
- CSRF protection (SameSite cookies)

### 4. File Upload Security
- File size limits
- File type validation
- Unique filenames
- Authenticated uploads only
- Virus scanning (recommended for production)

---

## 🚀 Performance Optimizations

### 1. Frontend
- Code splitting (Vite)
- Lazy loading components
- Image optimization
- Caching strategies

### 2. Backend
- Database connection pooling
- Query optimization
- Async operations (emails don't block)
- Response compression

### 3. Database
- Indexes on frequently queried fields
- Efficient joins
- Pagination for large datasets

---

**Last Updated**: January 2025  
**Version**: 2.0.0
