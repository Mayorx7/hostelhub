import { supabase } from './src/lib/supabase.js';

async function checkSchema() {
  // Query a single row from applications to see its columns
  const { data, error } = await supabase.from('applications').select('*').limit(1);
  if (error) {
    console.error("Error querying applications:", error);
  } else {
    console.log("Applications columns:", data && data.length > 0 ? Object.keys(data[0]) : "No rows");
  }
}

checkSchema();
