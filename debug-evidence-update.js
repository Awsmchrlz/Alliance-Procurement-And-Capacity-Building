#!/usr/bin/env node

/**
 * Debug script for evidence update functionality
 * This will help identify what's failing in the evidence update process
 */

import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
import fs from 'fs';
import FormData from 'form-data';
import fetch from 'node-fetch';

// Load environment variables
dotenv.config();

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseAnonKey = process.env.SUPABASE_ANON_KEY;
const serverUrl = 'http://localhost:5005';

if (!supabaseUrl || !supabaseAnonKey) {
  console.error('❌ Missing Supabase credentials');
  console.error('Please set SUPABASE_URL and SUPABASE_ANON_KEY in your .env file');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseAnonKey);

async function debugEvidenceUpdate() {
  console.log('🧪 Debugging Evidence Update Functionality\n');
  
  try {
    // Step 1: Check if we can connect to the server
    console.log('1️⃣ Testing server connection...');
    const healthResponse = await fetch(`${serverUrl}/api/events`);
    if (healthResponse.ok) {
      console.log('✅ Server is running and accessible');
    } else {
      console.log('❌ Server connection failed:', healthResponse.status);
      return;
    }

    // Step 2: Check if we have a test user session
    console.log('\n2️⃣ Checking authentication...');
    const { data: { session } } = await supabase.auth.getSession();
    
    if (!session) {
      console.log('❌ No active session found');
      console.log('Please log in through the web interface first');
      return;
    }
    
    console.log('✅ Active session found for user:', session.user.id);

    // Step 3: Get user registrations
    console.log('\n3️⃣ Fetching user registrations...');
    const registrationsResponse = await fetch(`${serverUrl}/api/users/${session.user.id}/registrations`, {
      headers: {
        'Authorization': `Bearer ${session.access_token}`,
      },
    });

    if (!registrationsResponse.ok) {
      console.log('❌ Failed to fetch registrations:', registrationsResponse.status);
      return;
    }

    const registrations = await registrationsResponse.json();
    console.log(`✅ Found ${registrations.length} registrations`);

    // Find a registration with evidence
    const registrationWithEvidence = registrations.find(reg => reg.paymentEvidence);
    
    if (!registrationWithEvidence) {
      console.log('ℹ️ No registrations with payment evidence found');
      console.log('Please upload evidence through the web interface first');
      return;
    }

    console.log('✅ Found registration with evidence:', registrationWithEvidence.id);
    console.log('   Evidence path:', registrationWithEvidence.paymentEvidence);

    // Step 4: Test evidence viewing
    console.log('\n4️⃣ Testing evidence viewing...');
    const evidenceViewResponse = await fetch(
      `${serverUrl}/api/users/payment-evidence/${encodeURIComponent(registrationWithEvidence.paymentEvidence)}`,
      {
        headers: {
          'Authorization': `Bearer ${session.access_token}`,
        },
      }
    );

    if (evidenceViewResponse.ok) {
      console.log('✅ Evidence viewing works');
      const contentType = evidenceViewResponse.headers.get('content-type');
      console.log('   Content type:', contentType);
    } else {
      console.log('❌ Evidence viewing failed:', evidenceViewResponse.status);
      const errorText = await evidenceViewResponse.text();
      console.log('   Error:', errorText);
    }

    // Step 5: Test evidence update (create a test file)
    console.log('\n5️⃣ Testing evidence update...');
    
    // Create a test file
    const testContent = 'This is a test evidence file for debugging purposes.';
    const testFileName = 'debug-test-evidence.txt';
    fs.writeFileSync(testFileName, testContent);
    
    console.log('📄 Created test file:', testFileName);

    // Prepare form data
    const formData = new FormData();
    formData.append('evidence', fs.createReadStream(testFileName));

    console.log('📤 Sending update request...');
    const updateResponse = await fetch(
      `${serverUrl}/api/users/payment-evidence/${registrationWithEvidence.id}`,
      {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${session.access_token}`,
          ...formData.getHeaders(),
        },
        body: formData,
      }
    );

    console.log('📡 Update response status:', updateResponse.status);

    if (updateResponse.ok) {
      const result = await updateResponse.json();
      console.log('✅ Evidence update successful!');
      console.log('   New evidence path:', result.newEvidencePath);
      
      // Test viewing the new evidence
      console.log('\n6️⃣ Testing new evidence viewing...');
      const newEvidenceResponse = await fetch(
        `${serverUrl}/api/users/payment-evidence/${encodeURIComponent(result.newEvidencePath)}`,
        {
          headers: {
            'Authorization': `Bearer ${session.access_token}`,
          },
        }
      );

      if (newEvidenceResponse.ok) {
        console.log('✅ New evidence viewing works');
      } else {
        console.log('❌ New evidence viewing failed:', newEvidenceResponse.status);
      }
    } else {
      console.log('❌ Evidence update failed');
      const errorText = await updateResponse.text();
      console.log('   Error response:', errorText);
    }

    // Cleanup
    fs.unlinkSync(testFileName);
    console.log('🧹 Cleaned up test file');

  } catch (error) {
    console.error('❌ Debug test failed:', error.message);
  }
}

// Run the debug test
debugEvidenceUpdate();