import { createClient } from '@supabase/supabase-js'

// هنا بنقول للكود يقرأ المفاتيح اللي إنت ضفتها في Netlify
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY

// لو المفاتيح مش مقروءة، الكود هيطلع تنبيه في الـ Console
if (!supabaseUrl || !supabaseAnonKey) {
  console.error('Supabase URL or Anon Key is missing in Environment Variables')
}

export const supabase = createClient(
  supabaseUrl || '',
  supabaseAnonKey || ''
)

