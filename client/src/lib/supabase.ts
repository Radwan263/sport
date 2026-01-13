import { createClient } from '@supabase/supabase-js'

const supabaseUrl = 'https://wiosxbjabfcxwevtyojj.supabase.co'

// ❌ إياك تحط sb_publishable هنا تاني
// ✅ حط المفتاح الطويل جداً اللي بيبدأ بـ eyJh هنا بين علامتين التنصيص
const supabaseAnonKey = 'انسخ_المفتاح_الطويل_اللي_بيبدا_بـ_eyJh_وحطه_هنا'

export const supabase = createClient(supabaseUrl, supabaseAnonKey)
