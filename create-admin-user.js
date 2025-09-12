/**
 * Admin User Creation Script
 * Run this script to create a super admin user directly
 */

import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';

// Load environment variables
dotenv.config();

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('❌ Missing SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY in environment variables');
  console.error('Please check your .env file contains:');
  console.error('SUPABASE_URL=your_supabase_url');
  console.error('SUPABASE_SERVICE_ROLE_KEY=your_service_role_key');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseServiceKey);

async function createAdminUser() {
  console.log('🚀 Creating Super Admin User...\n');

  const adminData = {
    email: 'admin@allianceprocurement.com', // Change this to your desired admin email
    password: 'AdminPassword123!', // Change this to a secure password
    firstName: 'Super',
    lastName: 'Admin',
    phoneNumber: '+1234567890',
    gender: 'other'
  };

  let authUserId = null;

  try {
    // Step 1: Check if user already exists
    console.log('🔍 Checking if user already exists...');
    const { data: existingUsers } = await supabase.auth.admin.listUsers();
    const existingUser = existingUsers.users.find(u => u.email === adminData.email);
    
    if (existingUser) {
      console.error(`❌ User with email ${adminData.email} already exists`);
      console.error(`   User ID: ${existingUser.id}`);
      console.error(`   Created: ${existingUser.created_at}`);
      console.error(`   Role: ${existingUser.user_metadata?.role || 'unknown'}`);
      return;
    }

    // Step 2: Create auth user
    console.log('📝 Creating Supabase auth user...');
    const { data: authData, error: authError } = await supabase.auth.admin.createUser({
      email: adminData.email,
      password: adminData.password,
      user_metadata: {
        role: 'super_admin',
        first_name: adminData.firstName,
        last_name: adminData.lastName,
        phone_number: adminData.phoneNumber,
        gender: adminData.gender,
      }
    });

    if (authError) {
      console.error('❌ Failed to create Supabase auth user:');
      console.error(`   Error Code: ${authError.status || 'unknown'}`);
      console.error(`   Error Message: ${authError.message}`);
      if (authError.message.includes('duplicate')) {
        console.error('   → User already exists in auth system');
      }
      return;
    }

    if (!authData.user) {
      console.error('❌ Auth user creation succeeded but returned no user data');
      return;
    }

    authUserId = authData.user.id;
    console.log(`✅ Supabase auth user created successfully`);
    console.log(`   User ID: ${authUserId}`);
    console.log(`   Email: ${authData.user.email}`);

    // Step 3: Create user record in public.users table
    console.log('📝 Creating user profile record in database...');
    const { data: userData, error: userError } = await supabase
      .from('users')
      .insert({
        id: authUserId,
        first_name: adminData.firstName,
        last_name: adminData.lastName,
        phone_number: adminData.phoneNumber,
        gender: adminData.gender,
      })
      .select()
      .single();

    if (userError) {
      console.error('❌ Failed to create user profile record:');
      console.error(`   Error Code: ${userError.code || 'unknown'}`);
      console.error(`   Error Message: ${userError.message}`);
      console.error(`   Error Details: ${userError.details || 'none'}`);
      console.error(`   Error Hint: ${userError.hint || 'none'}`);
      
      if (userError.code === '23505') {
        console.error('   → Duplicate key violation - user profile already exists');
      } else if (userError.code === '23503') {
        console.error('   → Foreign key violation - auth user may not exist');
      }

      // Cleanup: delete auth user if database insert fails
      console.log('🔄 Cleaning up - deleting auth user due to profile creation failure...');
      try {
        const { error: deleteError } = await supabase.auth.admin.deleteUser(authUserId);
        if (deleteError) {
          console.error('❌ Failed to cleanup auth user:', deleteError.message);
        } else {
          console.log('✅ Auth user cleaned up successfully');
        }
      } catch (cleanupError) {
        console.error('❌ Cleanup failed:', cleanupError.message);
      }
      return;
    }

    if (!userData) {
      console.error('❌ User profile creation succeeded but returned no data');
      // Cleanup auth user
      console.log('🔄 Cleaning up auth user...');
      await supabase.auth.admin.deleteUser(authUserId);
      return;
    }

    console.log('✅ User profile record created successfully');
    console.log(`   Profile ID: ${userData.id}`);
    console.log(`   Name: ${userData.first_name} ${userData.last_name}`);

    // Step 4: Verify the complete user creation
    console.log('🔍 Verifying complete user setup...');
    const { data: verifyAuth } = await supabase.auth.admin.getUserById(authUserId);
    const { data: verifyProfile } = await supabase
      .from('users')
      .select('*')
      .eq('id', authUserId)
      .single();

    if (verifyAuth.user && verifyProfile) {
      console.log('\n🎉 Super Admin User Created Successfully!');
      console.log('=' .repeat(50));
      console.log('📧 Email:', adminData.email);
      console.log('🔑 Password:', adminData.password);
      console.log('👤 Role:', verifyAuth.user.user_metadata.role);
      console.log('🆔 User ID:', authUserId);
      console.log('📅 Created:', new Date(verifyAuth.user.created_at).toLocaleString());
      console.log('=' .repeat(50));
      console.log('\n⚠️  IMPORTANT: Change the password after first login!');
      console.log('🔗 Login at: http://localhost:3000/login');
    } else {
      console.error('❌ User creation verification failed');
    }

  } catch (error) {
    console.error('❌ Unexpected error during admin user creation:');
    console.error(`   Error: ${error.message}`);
    console.error(`   Stack: ${error.stack}`);
    
    // Emergency cleanup if we have an auth user ID
    if (authUserId) {
      console.log('🔄 Emergency cleanup - attempting to delete auth user...');
      try {
        await supabase.auth.admin.deleteUser(authUserId);
        console.log('✅ Emergency cleanup completed');
      } catch (cleanupError) {
        console.error('❌ Emergency cleanup failed:', cleanupError.message);
      }
    }
  }
}

// Run the script
createAdminUser().catch(console.error);
