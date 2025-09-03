import { createClient, type SupabaseClient } from '@supabase/supabase-js'

let svc: SupabaseClient | null = null

export function getServiceSupabase(): SupabaseClient {
  if (svc) return svc
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY
  if (!url || !key) throw new Error('Missing Supabase service env')
  svc = createClient(url, key, {
    auth: { persistSession: false, autoRefreshToken: false }
  })
  return svc
}
