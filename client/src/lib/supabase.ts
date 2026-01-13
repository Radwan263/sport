import { createClient } from '@supabase/supabase-js'

// بنستخدم قيم افتراضية عشان نمنع الـ Crash في حالة التأخير
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || 'https://placeholder.supabase.co'
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || ''

// السطر ده هيطبع تحذير في الـ Console بس مش هيوقع الموقع
if (!import.meta.env.VITE_SUPABASE_URL) {
  console.warn('تنبيه: رابط Supabase غير مقروء حالياً من الإعدادات')
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey)
