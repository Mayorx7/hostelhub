import { createClient } from '@supabase/supabase-js';
import { readFileSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const envLocal = readFileSync(join(__dirname, '.env.local'), 'utf-8');
let supabaseUrl = '';
let supabaseKey = '';

for (const line of envLocal.split('\n')) {
  if (line.startsWith('VITE_SUPABASE_URL=')) supabaseUrl = line.split('=')[1].trim();
  if (line.startsWith('VITE_SUPABASE_ANON_KEY=')) supabaseKey = line.split('=')[1].trim();
}

const supabase = createClient(supabaseUrl, supabaseKey);

async function check() {
  console.log("Checking bookings...");
  const { data: bookings, error: bErr } = await supabase.from('bookings').select('*');
  console.log("Bookings:", bookings?.length, "error:", bErr);

  console.log("Checking applications...");
  const { data: apps, error: aErr } = await supabase.from('applications').select('*');
  console.log("Applications:", apps?.length, "error:", aErr);
}

check();
