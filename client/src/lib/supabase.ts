import { createClient } from '@supabase/supabase-js'

// ربط مباشر وصريح بدون استخدام import.meta.env
export const supabase = createClient(
  'https://wiosxbjabfcxwevtyojj.supabase.co',
  'sb_publishable__R4WVUWxKYTjae6IsD0Uew_fQYtOCUj'
)
