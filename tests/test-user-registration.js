/**
 * User Registration Test Script
 * Tests the fixed user registration functionality
 */

const testRegistrationData = {
  firstName: 'Test',
  lastName: 'User',
  email: `test-${Date.now()}@example.com`,
  password: 'TestPassword123!',
  phoneNumber: '+1234567890',
  gender: 'male',
  role: 'ordinary_user'
};

const invalidTestCases = [
  {
    name: 'Missing firstName',
    data: { ...testRegistrationData, firstName: undefined },
    expectedError: 'Missing required fields'
  },
  {
    name: 'Missing lastName', 
    data: { ...testRegistrationData, lastName: undefined },
    expectedError: 'Missing required fields'
  },
  {
    name: 'Missing email',
    data: { ...testRegistrationData, email: undefined },
    expectedError: 'Missing required fields'
  },
  {
    name: 'Missing password',
    data: { ...testRegistrationData, password: undefined },
    expectedError: 'Missing required fields'
  },
  {
    name: 'Invalid email format',
    data: { ...testRegistrationData, email: 'invalid-email' },
    expectedError: 'validation'
  },
  {
    name: 'Weak password',
    data: { ...testRegistrationData, password: '123' },
    expectedError: 'validation'
  }
];

async function testUserRegistration() {
  console.log('🧪 Testing User Registration Functionality\n');
  console.log('============================================================\n');

  // Test 1: Valid registration
  console.log('📝 Test 1: Valid User Registration');
  console.log('----------------------------------------');
  
  try {
    const response = await fetch('http://localhost:5005/api/auth/register', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(testRegistrationData)
    });

    const validResult = await response.json();
    
    if (response.ok) {
      console.log('✅ Valid registration successful');
      console.log('   User ID:', validResult.user.id);
      console.log('   Email:', validResult.user.email);
      console.log('   Role:', validResult.user.role);
      console.log('   Created At:', validResult.user.createdAt);
    } else {
      console.log('❌ Valid registration failed');
      console.log('   Error:', validResult.message);
      console.log('   Details:', validResult.details);
    }

    // Test 2: Duplicate Email Registration
    console.log('\n📝 Test 2: Duplicate Email Registration');
    console.log('-'.repeat(40));
    
    const duplicateResponse = await fetch('http://localhost:5005/api/auth/register', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(testRegistrationData) // Same email
    });

    const duplicateResult = await duplicateResponse.json();
    
    if (!duplicateResponse.ok && duplicateResult.message.includes('already exists')) {
      console.log('✅ Duplicate email correctly rejected');
      console.log('   Error:', duplicateResult.message);
    } else {
      console.log('❌ Duplicate email should have been rejected');
      console.log('   Response:', duplicateResult);
    }

    // Test 3: Invalid Data Cases
    console.log('\n📝 Test 3: Invalid Data Validation');
    console.log('-'.repeat(40));
    
    for (const testCase of invalidTestCases) {
      console.log(`\n   Testing: ${testCase.name}`);
      
      const invalidResponse = await fetch('http://localhost:5005/api/auth/register', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(testCase.data)
      });

      const invalidResult = await invalidResponse.json();
      
      if (!invalidResponse.ok) {
        console.log(`   ✅ ${testCase.name} correctly rejected`);
        console.log(`   Error: ${invalidResult.message}`);
      } else {
        console.log(`   ❌ ${testCase.name} should have been rejected`);
      }
    }

    // Test 4: Check User Creation in Database
    console.log('\n📝 Test 4: Database Consistency Check');
    console.log('-'.repeat(40));
    
    // This would require database access - for now just log the intent
    console.log('   ℹ️ Manual verification needed:');
    console.log('   - Check Supabase auth.users table for auth record');
    console.log('   - Check public.users table for user profile');
    console.log('   - Verify both records have matching IDs');
    console.log('   - Confirm user_metadata contains correct role');

    console.log('\n' + '=' .repeat(60));
    console.log('🎯 User Registration Tests Complete');
    console.log('=' .repeat(60));

  } catch (error) {
    console.error('❌ Test execution failed:', error.message);
    console.error('   Make sure the server is running on http://localhost:5005');
  }
}

// Helper function to generate unique test data
function generateTestUser(suffix = '') {
  return {
    firstName: `Test${suffix}`,
    lastName: `User${suffix}`,
    email: `test-user-${Date.now()}${suffix}@example.com`,
    password: 'SecurePassword123!',
    phoneNumber: '+1234567890',
    gender: 'female',
    role: 'ordinary_user'
  };
}

// Test multiple registrations
async function testMultipleRegistrations() {
  console.log('\n🔄 Testing Multiple Sequential Registrations');
  console.log('-'.repeat(50));
  
  const users = [
    generateTestUser('-1'),
    generateTestUser('-2'), 
    generateTestUser('-3')
  ];

  for (let i = 0; i < users.length; i++) {
    console.log(`\n   Registering user ${i + 1}/${users.length}:`);
    console.log(`   Email: ${users[i].email}`);
    
    try {
      const response = await fetch('http://localhost:5005/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(users[i])
      });

      const result = await response.json();
      
      if (response.ok) {
        console.log(`   ✅ User ${i + 1} registered successfully`);
        console.log(`   ID: ${result.user.id}`);
      } else {
        console.log(`   ❌ User ${i + 1} registration failed: ${result.message}`);
      }
    } catch (error) {
      console.log(`   ❌ Network error for user ${i + 1}: ${error.message}`);
    }
    
    // Small delay between registrations
    await new Promise(resolve => setTimeout(resolve, 500));
  }
}

// Run tests if this file is executed directly
if (typeof window === 'undefined') {
  // Node.js environment
  testUserRegistration()
    .then(() => testMultipleRegistrations())
    .catch(console.error);
}

export { testUserRegistration, testMultipleRegistrations, generateTestUser };
