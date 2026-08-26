import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';

// Load credentials from .env.local (never hardcode secrets)
dotenv.config({ path: '.env.local' });

const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseKey = process.env.VITE_SUPABASE_ANON_KEY;
const supabase = createClient(supabaseUrl, supabaseKey);

async function test() {
  console.log("Checking applications table structure...");
  
  // Use a query without .single() to see what's returned
  const { data, error } = await supabase
    .from("applications")
    .select("user_id, room_type, id")
    .eq("id", "a0582abd-dee4-4661-9cae-c8bda62666bc")

  console.log("Data:", data)
  console.log("Error:", error)
}

test()
