import type { NextApiRequest, NextApiResponse } from 'next'
import { getServiceSupabase } from '@/lib/supabaseServer'

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  res.setHeader('Cache-Control', 'no-store')
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' })
  const { code, status } = req.body || {}
  if (!code || !status) return res.status(400).json({ error: 'Missing code or status' })
  const supabase = getServiceSupabase()
  const { error } = await supabase.from('bookings').update({ status }).eq('booking_code', String(code))
  if (error) return res.status(500).json({ error: 'Update failed' })
  return res.status(200).json({ ok: true })
}
