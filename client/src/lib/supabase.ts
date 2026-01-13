import { createClient } from '@supabase/supabase-js'

const supabaseUrl = 'https://wiosxbjabfcxwevtyojj.supabase.co'

// ❌ إياك تحط sb_publishable هنا تاني
// ✅ حط المفتاح الطويل جداً اللي بيبدأ بـ eyJh هنا بين علامتين التنصيص
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Indpb3N4YmphYmZjeHdldnR5b2pqIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjgyNTg5MDgsImV4cCI6MjA4MzgzNDkwOH0.A_nbC7ImuUY5b7bTiJl6m-5Z86Euo9euAeqtCp9oeYg'

export const supabase = createClient(supabaseUrl, supabaseAnonKey)
