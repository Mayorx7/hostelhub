import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';

dotenv.config({ path: '.env.local' });

const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseAnonKey = process.env.VITE_SUPABASE_ANON_KEY;

const supabase = createClient(supabaseUrl, supabaseAnonKey);

async function checkSchema() {
  const { data, error } = await supabase.from('applications').select('*').limit(1);
  if (error) {
    console.error("Error querying applications:", error);
  } else {
    console.log("Applications columns:", data && data.length > 0 ? Object.keys(data[0]) : "No rows");
  }
}

checkSchema();
