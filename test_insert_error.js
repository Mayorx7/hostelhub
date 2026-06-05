import { createClient } from '@supabase/supabase-js';
import * as dotenv from 'dotenv';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
import * as fs from 'fs';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Read .env.local
const envConfig = dotenv.parse(fs.readFileSync(join(__dirname, '.env.local')));
for (const k in envConfig) {
  process.env[k] = envConfig[k];
}

const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseAnonKey = process.env.VITE_SUPABASE_ANON_KEY;
const supabase = createClient(supabaseUrl, supabaseAnonKey);

async function checkUniqueConstraints() {
  const { data, error } = await supabase.from('bookings').insert({
    resident_id: "00000000-0000-0000-0000-000000000000",
    room_id: "00000000-0000-0000-0000-000000000000",
  });
  console.log("Error:", error);
}

checkUniqueConstraints();
