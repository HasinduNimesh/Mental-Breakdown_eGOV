import type { NextApiRequest, NextApiResponse } from 'next'
import { getServiceSupabase } from '@/lib/supabaseServer'

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  res.setHeader('Cache-Control', 'no-store')
  if (req.method !== 'GET') return res.status(405).json({ error: 'Method not allowed' })
  const code = String(req.query.code || '')
  if (!code) return res.status(400).json({ error: 'Missing code' })

  try {
    const supabase = getServiceSupabase()

    const { data: booking, error: bErr } = await supabase
      .from('bookings')
      .select('booking_code, full_name, email, service_id, office_id, slot_date, slot_time, status')
      .eq('booking_code', code)
      .maybeSingle()
    if (bErr) return res.status(500).json({ error: 'Booking lookup failed' })
    if (!booking) return res.status(404).json({ error: 'Not found' })

    const { data: docs, error: dErr } = await supabase
      .from('appointment_documents')
      .select('id, booking_code, original_name, object_key, mime_type, size_bytes, status')
      .eq('booking_code', code)
      .order('id', { ascending: true })
    if (dErr) return res.status(500).json({ error: 'Docs lookup failed' })

    return res.status(200).json({ ok: true, booking, docs: docs || [] })
  } catch (e) {
    return res.status(500).json({ error: 'Internal error' })
  }
}
