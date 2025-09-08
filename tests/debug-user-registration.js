#!/usr/bin/env node

/**
 * Debug script for user registration issues
 * This will help identify what's causing the "User not found" error
 */

console.log('🔍 User Registration Debug Script\n');

console.log('🔧 Recent fixes applied:');
console.log('✅ Fixed admin user registration route to use correct database insertion');
console.log('✅ Added comprehensive error logging');
console.log('✅ Separated Supabase Auth creation from database record creation');
console.log('✅ Added validation and debugging information');

console.log('\n📋 Debug Steps:');

console.log('\n1️⃣ Check Server Logs:');
console.log('   - Open your server console/terminal');
console.log('   - Look for detailed log messages when registration fails');
console.log('   - New logs will show exactly where the process fails');

console.log('\n2️⃣ Test User Registration:');
console.log('   - Go to Admin Dashboard → Users tab');
console.log('   - Click "Register New User"');
console.log('   - Fill out the form with test data:');
console.log('     * Role: Ordinary User');
console.log('     * First Name: Test');
console.log('     * Last Name: User');
console.log('     * Phone: +1234567890 (optional)');
console.log('     * Email: test@example.com');
console.log('     * Password: TestPassword123');
console.log('   - Click "Create User"');
console.log('   - Check server logs for detailed error information');

console.log('\n3️⃣ Common Issues to Check:');
console.log('   ❓ Database Connection: Ensure Supabase database is accessible');
console.log('   ❓ Table Structure: Verify "users" table exists with correct columns');
console.log('   ❓ Permissions: Check if service role has insert permissions');
console.log('   ❓ Environment Variables: Verify SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY');

console.log('\n4️⃣ Expected Log Flow:');
console.log('   🔄 Admin user registration request: {...}');
console.log('   ✅ Supabase auth user created: [user-id]');
console.log('   ✅ User record created in database: [user-id]');
console.log('   ✅ Admin created user: [email] with role: [role]');

console.log('\n5️⃣ If Still Failing:');
console.log('   - Check if "users" table exists in Supabase');
console.log('   - Verify table has columns: id, first_name, last_name, phone_number, created_at');
console.log('   - Ensure RLS (Row Level Security) policies allow inserts');
console.log('   - Test with a different email address');

console.log('\n🔍 Database Schema Check:');
console.log('The "users" table should have this structure:');
console.log('```sql');
console.log('CREATE TABLE users (');
console.log('  id UUID PRIMARY KEY REFERENCES auth.users(id),');
console.log('  first_name TEXT,');
console.log('  last_name TEXT,');
console.log('  phone_number TEXT,');
console.log('  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()');
console.log(');');
console.log('```');

console.log('\n🚀 Try the registration now and check the server logs for detailed error information!');