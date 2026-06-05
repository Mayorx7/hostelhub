import { createClient } from '@supabase/supabase-js'

const supabaseUrl = 'https://ertfpbdubrhjvoifcszd.supabase.co'
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImVydGZwYmR1YnJoanZvaWZjc3pkIiwicm9sZSI6ImFub24iLCJpYXQiOjE3Nzc3NDg3NzcsImV4cCI6MjA5MzMyNDc3N30.PUm5bb0nh4aho5nTLHnDfLVUhJ3tjbb90Hms7zR41sQ'
const supabase = createClient(supabaseUrl, supabaseKey)

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
