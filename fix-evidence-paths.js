const { createClient } = require('@supabase/supabase-js');
require('dotenv').config();

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('Missing SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY environment variables');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseServiceKey);

async function fixEvidencePaths() {
  console.log('🔍 Finding registrations with legacy payment evidence paths...');
  
  try {
    // Get all registrations with payment evidence that starts with "payment-evidence/"
    const { data: registrations, error } = await supabase
      .from('event_registrations')
      .select('id, payment_evidence')
      .not('payment_evidence', 'is', null)
      .like('payment_evidence', 'payment-evidence/%');

    if (error) {
      console.error('❌ Error fetching registrations:', error);
      return;
    }

    console.log(`📊 Found ${registrations.length} registrations with legacy paths`);

    if (registrations.length === 0) {
      console.log('✅ No legacy paths found to fix');
      return;
    }

    // Update each registration
    let updatedCount = 0;
    for (const registration of registrations) {
      const oldPath = registration.payment_evidence;
      // Convert "payment-evidence/userId/filename" to "evidence/userId/filename"  
      const newPath = oldPath.replace('payment-evidence/', 'evidence/');
      
      console.log(`🔄 Updating registration ${registration.id}:`);
      console.log(`   Old: ${oldPath}`);
      console.log(`   New: ${newPath}`);

      const { error: updateError } = await supabase
        .from('event_registrations')
        .update({ payment_evidence: newPath })
        .eq('id', registration.id);

      if (updateError) {
        console.error(`❌ Error updating registration ${registration.id}:`, updateError);
      } else {
        updatedCount++;
        console.log(`✅ Updated registration ${registration.id}`);
      }
    }

    console.log(`\n🎉 Successfully updated ${updatedCount} out of ${registrations.length} registrations`);
    
  } catch (error) {
    console.error('❌ Unexpected error:', error);
  }
}

// Run the fix
fixEvidencePaths().then(() => {
  console.log('🏁 Evidence path fix completed');
  process.exit(0);
}).catch((error) => {
  console.error('💥 Script failed:', error);
  process.exit(1);
});
