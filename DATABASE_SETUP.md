# Alliance Procurement Database Setup

This is the **complete database setup** for the Alliance Procurement and Capacity Building platform.

## 📁 Single Script Setup

We use **one script** for everything: `complete-setup-with-samples.sql`

This script includes:
- ✅ All database tables with proper structure
- ✅ Sample events for testing
- ✅ User authentication sync (fixes foreign key issues)
- ✅ Security policies and permissions
- ✅ Performance indexes
- ✅ Storage bucket for file uploads

## 🚀 How to Run

1. **Open Supabase Dashboard**
   - Go to your project dashboard
   - Navigate to **SQL Editor**

2. **Run the Script**
   - Open `complete-setup-with-samples.sql`
   - Copy the entire content
   - Paste into Supabase SQL Editor
   - Click **"Run"**

3. **Wait for Completion**
   - The script takes 10-20 seconds to run
   - You'll see progress messages in the output
   - Look for "🎉 SETUP COMPLETED SUCCESSFULLY!" message

## 📊 What Gets Created

### Tables
- **`users`** - User profiles with gender field
- **`events`** - Event listings and details  
- **`event_registrations`** - User event signups (simplified)
- **`newsletter_subscriptions`** - Email newsletter list

### Sample Data
- **6 sample events** for procurement and capacity building
- Events scheduled 30-105 days in the future
- Mix of featured and regular events
- Professional images and realistic pricing

### Infrastructure
- **Functions** - Registration numbers, attendee counting
- **Triggers** - Auto user sync, registration numbers
- **Indexes** - Performance optimization
- **Security** - Row Level Security policies
- **Storage** - File upload bucket for payment evidence

## ✅ After Running the Script

Your platform will be ready with:

- 🔐 **User authentication** working properly
- 📅 **6 sample events** available for testing
- 💳 **Event registration** without foreign key errors
- 👥 **Gender collection** during user signup (not per event)
- 📁 **File uploads** configured for payment evidence
- 🛡️ **Security policies** for multi-role access

## 🎯 Next Steps

1. **Create your first admin user**:
   - Sign up through your app's registration form
   - Go to Supabase Auth dashboard
   - Find your user and note their ID
   - Update their role in the `users` table:
     ```sql
     UPDATE users SET role = 'super_admin' WHERE id = 'your-user-id';
     ```

2. **Test the platform**:
   - Sign in with your admin user
   - Access the admin dashboard
   - Try registering for sample events
   - Upload payment evidence
   - Manage users and registrations

## 🔧 Troubleshooting

If you encounter any issues:

- **Foreign key errors**: The script includes user sync to prevent this
- **Permission errors**: Make sure you're using the service role key in Supabase
- **Missing tables**: Re-run the complete script (it's safe to run multiple times)
- **Sample events not showing**: Check that the events table has data

## 📝 Database Schema Summary

```
users (with gender field)
├── id (references auth.users.id)
├── first_name, last_name
├── phone_number, gender
└── role (super_admin, finance_person, event_manager, ordinary_user)

events (full featured)
├── title, description, location
├── start_date, end_date, price
├── max_attendees, current_attendees
├── image_url, tags[], featured
└── created_at

event_registrations (simplified)
├── user_id → users(id)
├── event_id → events(id)
├── country, organization, position
├── payment_status, payment_method
├── delegate_type, notes
└── registration_number (auto-generated)
```

**That's it! One script, complete setup, ready to go.** 🚀