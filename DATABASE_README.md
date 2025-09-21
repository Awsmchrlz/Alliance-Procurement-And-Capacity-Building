# Alliance Procurement & Capacity Building - Database Schema

## 🎯 Overview

This document describes the comprehensive, normalized database schema for the Alliance Procurement & Capacity Building platform. The schema is designed to capture all form data, ensure data consistency, and provide optimal performance.

## 📁 Schema File

**Single Source of Truth:** `database-schema.sql`

This is the **only** SQL file you need to run. It's idempotent (safe to run multiple times) and contains everything needed for a production-ready database.

## 🗃️ Database Tables

### Core Tables

#### 1. `users`
Stores user account information with role-based access control.

**Key Fields:**
- `id` - Primary key (UUID)
- `first_name`, `last_name` - User's full name
- `email` - Unique email address
- `phone_number` - Unique phone number
- `gender` - Optional gender selection
- `role` - User role (`super_admin`, `finance_person`, `event_manager`, `ordinary_user`)

#### 2. `events`
Stores event information for conferences, workshops, and training sessions.

**Key Fields:**
- `id` - Primary key (UUID)
- `title`, `description` - Event details
- `start_date`, `end_date` - Event timing
- `location` - Event venue
- `price` - Registration fee
- `max_attendees`, `current_attendees` - Capacity management
- `featured` - Homepage featured events

#### 3. `event_registrations`
**Most comprehensive table** - captures all registration form data including group payments.

**Personal Information:**
- `first_name`, `last_name`, `email`, `phone_number`
- `gender` - Optional gender selection

**Professional Information:**
- `country` - Participant's country
- `organization` - Organization name
- `organization_type` - Type of organization (government, private, ngo, etc.)
- `position` - Job title/position

**Payment Information:**
- `payment_method` - Payment type (mobile, bank, cash, group_payment, org_paid)
- `payment_status` - Status (pending, paid, cancelled, failed)
- `payment_evidence` - File path to payment proof
- `currency`, `price_paid` - Payment details
- `delegate_type` - Delegate category (private, public, international)

**Group Payment Fields:**
- `group_size` - Number of people in group registration
- `group_payment_amount` - Total amount for group
- `group_payment_currency` - Currency for group payment
- `organization_reference` - Reference for organization payments

**Additional Information:**
- `notes` - Special notes from registrant
- `dietary_requirements` - Dietary restrictions
- `accessibility_requirements` - Accessibility needs

#### 4. `sponsorships`
Captures all sponsorship application data with approval workflow.

**Company Information:**
- `company_name`, `contact_person`, `email`, `phone_number`
- `website`, `company_address`
- `company_logo` - Logo file path

**Sponsorship Details:**
- `sponsorship_level` - Level (platinum, gold, silver, bronze)
- `amount`, `currency` - Sponsorship amount
- `payment_method`, `payment_evidence` - Payment details

**Requirements & Preferences:**
- `special_requirements` - Special requests
- `marketing_materials` - Marketing material details
- `booth_requirements` - Booth setup requirements
- `logo_placement_preferences` - Logo placement preferences

**Approval Workflow:**
- `status` - Application status (pending, approved, rejected)
- `admin_notes` - Internal admin notes
- `rejection_reason` - Reason for rejection if applicable

#### 5. `exhibitions`
Captures all exhibition application data with detailed requirements.

**Company Information:**
- `company_name`, `contact_person`, `email`, `phone_number`
- `website`, `company_address`
- `company_logo` - Logo file path
- `industry` - Company industry/sector

**Exhibition Details:**
- `booth_size` - Booth size (standard, premium, custom)
- `amount`, `currency` - Exhibition fee
- `payment_method`, `payment_evidence` - Payment details

**Booth Requirements:**
- `products_services` - Products/services to showcase
- `booth_requirements` - General booth requirements
- `electrical_requirements` - Electrical needs (boolean)
- `internet_requirements` - Internet needs (boolean)
- `furniture_requirements` - Furniture needs
- `display_requirements` - Display requirements

**Approval Workflow:**
- `status` - Application status (pending, approved, rejected)
- `admin_notes` - Internal admin notes
- `rejection_reason` - Reason for rejection if applicable

#### 6. `newsletter_subscriptions`
Simple newsletter subscription management.

**Fields:**
- `email` - Subscriber email (unique)
- `name` - Optional subscriber name
- `is_active` - Subscription status

## 🔒 Security Features

### Row Level Security (RLS)
All tables have RLS enabled with comprehensive policies:

- **Users**: Can view/edit own profile, admins can manage all users
- **Events**: Public read access, admin management
- **Registrations**: Users see own registrations, admins see all
- **Sponsorships**: Public submission, finance admin management
- **Exhibitions**: Public submission, finance admin management
- **Newsletter**: Public subscription, admin management

### Role-Based Access Control
- **Super Admin**: Full system access
- **Finance Person**: Financial operations and approvals
- **Event Manager**: Event management (limited financial access)
- **Ordinary User**: Basic user access

### Storage Security
- **Payment Evidence Bucket**: Secure file storage with proper access controls
- **Authentication Required**: All file operations require valid authentication
- **Admin Override**: Admins can access all evidence files for review

## 🚀 Performance Optimizations

### Comprehensive Indexing
- **Primary Keys**: All tables have UUID primary keys
- **Foreign Keys**: Proper relationships with cascade deletes
- **Search Fields**: Indexed on commonly searched fields (email, phone, company name)
- **Status Fields**: Indexed for filtering (payment_status, status)
- **Date Fields**: Indexed for chronological queries
- **Group Payments**: Special indexes for group payment queries

### Query Optimization
- **Composite Indexes**: Multi-column indexes for complex queries
- **Partial Indexes**: Conditional indexes for specific use cases
- **Text Search**: Optimized for name and organization searches

## 🔧 Database Functions & Triggers

### Auto-Generated Fields
- **Registration Numbers**: Sequential 4-digit registration numbers (0001, 0002, etc.)
- **Timestamps**: Automatic created_at and updated_at timestamps
- **User Creation**: Automatic user profile creation from auth system

### Data Integrity
- **Constraints**: Comprehensive check constraints for data validation
- **Referential Integrity**: Foreign key constraints with proper cascade rules
- **Business Logic**: Database-level validation for business rules

## 📊 Data Validation

### Form Field Validation
All form fields are properly validated at the database level:

**Registration Form:**
- ✅ Personal information (name, email, phone)
- ✅ Professional information (country, organization, position)
- ✅ Payment information (method, evidence, amounts)
- ✅ Group payment details (size, amounts, references)
- ✅ Special requirements (dietary, accessibility)

**Sponsorship Form:**
- ✅ Company information (name, contact, address)
- ✅ Sponsorship level and amounts
- ✅ Payment and evidence details
- ✅ Marketing and booth requirements
- ✅ Logo and placement preferences

**Exhibition Form:**
- ✅ Company information and industry
- ✅ Booth size and requirements
- ✅ Payment and evidence details
- ✅ Technical requirements (electrical, internet)
- ✅ Display and furniture needs

## 🛠️ Installation & Setup

### Prerequisites
- PostgreSQL 12+ (Supabase recommended)
- Admin access to database

### Installation Steps
1. **Run the Schema**: Execute `database-schema.sql` in your database
2. **Verify Setup**: Check the verification queries at the end of the script
3. **Test Connection**: Ensure your application can connect and query

### Verification
The schema includes built-in verification queries that will:
- ✅ Confirm all tables are created
- ✅ Verify all columns exist
- ✅ Check constraints are applied
- ✅ Validate indexes are created
- ✅ Confirm RLS policies are active

## 🔄 Migration & Updates

### Safe Updates
The schema is designed to be **idempotent** - you can run it multiple times safely:
- Existing tables won't be dropped
- New columns will be added if missing
- Constraints will be updated as needed
- No data will be lost

### Version Control
- **Single File**: Only `database-schema.sql` needs to be maintained
- **Git Tracking**: Track changes to the schema file
- **Rollback**: Use database backups for rollback if needed

## 📈 Monitoring & Maintenance

### Performance Monitoring
- Monitor query performance on indexed fields
- Check for slow queries on registration and approval workflows
- Monitor storage bucket usage for evidence files

### Data Cleanup
- Archive old events and registrations as needed
- Clean up unused evidence files
- Monitor newsletter subscription growth

### Security Audits
- Regular review of RLS policies
- Monitor admin access patterns
- Audit file access logs

## 🎯 Key Improvements Made

### Data Completeness
- ✅ **All Form Fields Captured**: Every field from registration, sponsorship, and exhibition forms
- ✅ **Group Payment Support**: Complete group registration workflow
- ✅ **Requirements Tracking**: Dietary, accessibility, booth, and technical requirements
- ✅ **Approval Workflow**: Status tracking with admin notes and rejection reasons

### Data Consistency
- ✅ **Normalized Design**: Proper relationships and no data duplication
- ✅ **Consistent Naming**: Clear, consistent field names across tables
- ✅ **Type Safety**: Proper data types and constraints
- ✅ **Validation Rules**: Database-level validation for all business rules

### Performance & Security
- ✅ **Comprehensive Indexing**: Optimized for all query patterns
- ✅ **Row Level Security**: Granular access control
- ✅ **Role-Based Permissions**: Proper admin role separation
- ✅ **Secure File Storage**: Protected evidence file access

### Maintainability
- ✅ **Single Schema File**: One file to rule them all
- ✅ **Idempotent Design**: Safe to run multiple times
- ✅ **Clear Documentation**: Comprehensive documentation
- ✅ **Future-Proof**: Extensible design for new features

## 🚨 Important Notes

1. **Backup First**: Always backup your database before running schema updates
2. **Test Environment**: Test the schema in a development environment first
3. **Monitor Performance**: Watch for any performance impacts after deployment
4. **Review Policies**: Ensure RLS policies match your security requirements

---

**Status**: ✅ Production Ready
**Last Updated**: Current
**Maintainer**: Alliance Procurement Team
