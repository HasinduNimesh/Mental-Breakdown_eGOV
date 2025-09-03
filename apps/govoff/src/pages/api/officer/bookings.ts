import type { NextApiRequest, NextApiResponse } from 'next'

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  res.setHeader('Cache-Control', 'no-store')
  if (req.method !== 'GET') return res.status(405).json({ error: 'Method not allowed' })
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY
  if (!url || !key) return res.status(500).json({ error: 'Supabase env missing' })

  try {
  const { from, date, status, q, limit } = req.query
    const params = new URLSearchParams()
    params.set('select', 'booking_code,full_name,service_id,office_id,slot_date,slot_time,status')
  if (date) params.set('slot_date', `eq.${date}`)
  else if (from) params.set('slot_date', `gte.${from}`)
    if (status && String(status) !== 'All') params.set('status', `eq.${status}`)
    if (q) params.set('booking_code', `ilike.%${q}%`)
    params.set('order', 'slot_date.asc,slot_time.asc')
    const lim = Number(limit || 200)
    params.set('limit', String(Math.min(lim, 500)))

    const resp = await fetch(`${url}/rest/v1/bookings?${params.toString()}`, {
      headers: {
        apikey: key,
        Authorization: `Bearer ${key}`,
        Accept: 'application/json',
        Prefer: 'count=none'
      }
    })
    if (!resp.ok) {
      const t = await resp.text().catch(()=> '')
      return res.status(resp.status).json({ error: 'Fetch failed', details: t })
    }
    const rows = await resp.json()
    return res.status(200).json({ ok: true, items: rows })
  } catch {
    return res.status(500).json({ error: 'Internal error' })
  }
}
