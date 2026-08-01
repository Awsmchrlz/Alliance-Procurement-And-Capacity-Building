import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
import path from 'path';

dotenv.config({ path: path.resolve(process.cwd(), '.env') });

const supabaseUrl = process.env.VITE_SUPABASE_URL || '';
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || '';

if (!supabaseUrl || !supabaseServiceKey) {
  console.log("Missing Supabase credentials in .env");
  process.exit(1);
}

const supabaseAdmin = createClient(supabaseUrl, supabaseServiceKey);

async function check() {
  const { data: publicRegs } = await supabaseAdmin.from('public_event_registrations').select('email, full_name, delegate_type');
  const { data: sponsorships } = await supabaseAdmin.from('sponsorships').select('email, company_name');
  console.log("Public Registrations:", publicRegs);
  console.log("Sponsorships:", sponsorships);
}
check();
