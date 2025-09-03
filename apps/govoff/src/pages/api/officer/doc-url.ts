import type { NextApiRequest, NextApiResponse } from 'next'
import { getServiceSupabase } from '@/lib/supabaseServer'

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'GET') return res.status(405).json({ error: 'Method not allowed' })
  const { code, id } = req.query
  if (!code || !id) return res.status(400).json({ error: 'Missing params' })
  const supabase = getServiceSupabase()

  // Lookup document and ensure it belongs to the booking
  const { data: doc, error } = await supabase
    .from('appointment_documents')
    .select('id, object_key, mime_type, original_name, booking_code')
    .eq('id', Number(id))
    .maybeSingle()
  if (error) return res.status(500).json({ error: 'Lookup failed' })
  if (!doc || doc.booking_code !== String(code)) return res.status(404).json({ error: 'Not found' })

  // Generate a short-lived signed URL
  const { data: sign, error: sErr } = await supabase
    .storage
    .from('appointment-docs')
    .createSignedUrl(doc.object_key, 60) // 60s
  if (sErr || !sign) return res.status(500).json({ error: 'Sign failed' })

  // Redirect to signed URL so the browser loads the actual file
  res.setHeader('Cache-Control', 'no-store')
  return res.redirect(302, sign.signedUrl)
}
