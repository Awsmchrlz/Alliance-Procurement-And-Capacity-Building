import { createClient } from "@supabase/supabase-js";

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL||"https://huwkexajyeacooznhadq.supabase.co";
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY||"eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imh1d2tleGFqeWVhY29vem5oYWRxIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTUzNTU5MDIsImV4cCI6MjA3MDkzMTkwMn0.VurhmRgvIXB5dYpTldKEXOFr4HwGeS96ojvA7PF32dY";

if (!supabaseUrl || !supabaseAnonKey) {
  // In the browser, throwing here surfaces a helpful error early during boot
  throw new Error("Missing VITE_SUPABASE_URL or VITE_SUPABASE_ANON_KEY env vars");
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey);
