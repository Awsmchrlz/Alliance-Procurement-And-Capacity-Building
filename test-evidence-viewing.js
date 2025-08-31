#!/usr/bin/env node

/**
 * Test script for evidence viewing functionality
 * Run this to verify your Supabase storage and evidence viewing setup
 */

import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';

// Load environment variables
dotenv.config();

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
const bucketName = process.env.VITE_SUPABASE_EVIDENCE_BUCKET || 'registrations';

if (!supabaseUrl || !supabaseKey) {
  console.error('❌ Missing Supabase credentials');
  console.error('Please set SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY in your .env file');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

async function testEvidenceViewing() {
  console.log('🧪 Testing Evidence Viewing Functionality\n');
  
  try {
    // Test 1: Check if bucket exists
    console.log('1️⃣ Checking if storage bucket exists...');
    const { data: buckets, error: bucketError } = await supabase.storage.listBuckets();
    
    if (bucketError) {
      console.error('❌ Failed to list buckets:', bucketError.message);
      return;
    }
    
    const bucketExists = buckets.some(bucket => bucket.name === bucketName);
    if (bucketExists) {
      console.log(`✅ Bucket '${bucketName}' exists`);
    } else {
      console.log(`❌ Bucket '${bucketName}' does not exist`);
      console.log('Available buckets:', buckets.map(b => b.name));
      return;
    }
    
    // Test 2: Check bucket policies
    console.log('\n2️⃣ Checking bucket policies...');
    const { data: policies, error: policyError } = await supabase.rpc('get_storage_policies', { bucket_name: bucketName });
    
    if (policyError) {
      console.log('⚠️ Could not check policies (this is normal for new setups)');
    } else {
      console.log('✅ Bucket policies configured');
    }
    
    // Test 3: List files in bucket
    console.log('\n3️⃣ Listing files in bucket...');
    const { data: files, error: listError } = await supabase.storage
      .from(bucketName)
      .list('evidence', { limit: 10 });
    
    if (listError) {
      console.error('❌ Failed to list files:', listError.message);
    } else if (files && files.length > 0) {
      console.log(`✅ Found ${files.length} evidence files`);
      files.forEach(file => {
        console.log(`   📁 ${file.name} (${file.metadata?.size || 'unknown size'})`);
      });
    } else {
      console.log('ℹ️ No evidence files found yet');
    }
    
    // Test 4: Test file access (if files exist)
    if (files && files.length > 0) {
      console.log('\n4️⃣ Testing file access...');
      const testFile = files[0];
      const filePath = `evidence/${testFile.name}`;
      
      try {
        const { data, error } = await supabase.storage
          .from(bucketName)
          .createSignedUrl(filePath, 3600);
        
        if (error) {
          console.error('❌ Failed to create signed URL:', error.message);
        } else {
          console.log('✅ Successfully created signed URL for test file');
          console.log(`   🔗 URL: ${data.signedUrl.substring(0, 100)}...`);
        }
      } catch (err) {
        console.error('❌ File access test failed:', err.message);
      }
    }
    
    console.log('\n🎯 Evidence Viewing Test Complete!');
    console.log('\n📋 Next Steps:');
    console.log('1. Ensure your Supabase project has the correct storage policies');
    console.log('2. Test uploading evidence during event registration');
    console.log('3. Test viewing evidence in the admin dashboard');
    
  } catch (error) {
    console.error('❌ Test failed:', error.message);
  }
}

// Run the test
testEvidenceViewing();
