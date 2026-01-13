import { createClient } from '@supabase/supabase-js'

const supabaseUrl = 'https://wiosxbjabfcxwevtyojj.supabase.co'
const supabaseAnonKey = 'sb_publishable__R4WVUWxKYTjae6IsD0Uew_fQYtOCUj'

export const supabase = createClient(supabaseUrl, supabaseAnonKey)
