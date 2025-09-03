import type { NextApiRequest, NextApiResponse } from 'next';
import { createClient } from '@supabase/supabase-js';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'GET') {
    res.setHeader('Allow', 'GET');
    return res.status(405).json({ ok: false, error: 'Method Not Allowed' });
  }

  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const service = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !service) {
    // Be explicit so local dev can fix quickly.
    return res.status(500).json({
      ok: false,
      error: 'Missing Supabase configuration. Ensure NEXT_PUBLIC_SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY are set in apps/admin/.env.local',
    });
  }

  const fromISO = (req.query.from as string) || null;
  const toISO = (req.query.to as string) || null;

  const supabase = createClient(url, service, { auth: { persistSession: false, autoRefreshToken: false } });
  try {
    // First try with related data if relationships are present
    const selectWithJoins = `
      booking_code, user_id, service_id, office_id, slot_date, slot_time, full_name, nic, email, phone, alt_phone, status, created_at,
      services(title),
      offices(name, city, timezone)
    `;

    let query = supabase
      .from('bookings')
      .select(selectWithJoins)
      .order('slot_date', { ascending: true })
      .order('slot_time', { ascending: true });

    if (fromISO) query = query.gte('slot_date', fromISO);
    if (toISO) query = query.lte('slot_date', toISO);

    let { data, error } = await query as any;
    if (error) {
      // If relationships are not defined or columns differ, retry with a flat select.
      const msg = String(error.message || '').toLowerCase();
      const looksLikeRelIssue = msg.includes('no relationship') || msg.includes('foreign key') || msg.includes('could not find') || msg.includes('column');
      if (looksLikeRelIssue) {
        let flat = supabase
          .from('bookings')
          .select('booking_code, user_id, service_id, office_id, slot_date, slot_time, full_name, nic, email, phone, alt_phone, status, created_at')
          .order('slot_date', { ascending: true })
          .order('slot_time', { ascending: true });
        if (fromISO) flat = flat.gte('slot_date', fromISO);
        if (toISO) flat = flat.lte('slot_date', toISO);
        const retry = await flat as any;
        if (retry.error) {
          return res.status(500).json({ ok: false, error: retry.error.message || 'Query failed' });
        }
        return res.status(200).json({ ok: true, data: retry.data || [] });
      }
      return res.status(500).json({ ok: false, error: error.message || 'Query failed' });
    }
    return res.status(200).json({ ok: true, data: data || [] });
  } catch (e: any) {
    return res.status(500).json({ ok: false, error: e?.message || 'Internal Error' });
  }
}
