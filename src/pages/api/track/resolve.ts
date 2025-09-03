import type { NextApiRequest, NextApiResponse } from 'next';
import crypto from 'crypto';

function base64urlDecode(input: string) {
  input = input.replace(/-/g, '+').replace(/_/g, '/');
  const pad = input.length % 4 === 2 ? '==': input.length % 4 === 3 ? '=' : '';
  return Buffer.from(input + pad, 'base64');
}

function verifyToken(token: string, secret: string): any | null {
  const [bodyB64, sigB64] = token.split('.');
  if (!bodyB64 || !sigB64) return null;
  // Important: Signer used the base64url string itself as the HMAC input. Mirror that here.
  const expected = crypto.createHmac('sha256', secret).update(bodyB64).digest();
  const provided = base64urlDecode(sigB64);
  if (expected.length !== provided.length || !crypto.timingSafeEqual(expected, provided)) return null;
  try { return JSON.parse(base64urlDecode(bodyB64).toString('utf8')); } catch { return null; }
}

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'GET') {
    res.setHeader('Allow', 'GET');
    return res.status(405).json({ ok: false, error: 'Method Not Allowed' });
  }
  const token = String(req.query.token || '');
  if (!token) return res.status(400).json({ ok: false, error: 'Missing token' });

  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !key) return res.status(200).json({ ok: true, mode: 'stub' });

  try {
    const secret = process.env.TRACK_LINK_SECRET || key;
    const payload = verifyToken(token, secret);
    if (!payload) return res.status(401).json({ ok: false, error: 'Invalid token' });
    if (typeof payload.e === 'number' && payload.e < Math.floor(Date.now()/1000)) return res.status(401).json({ ok: false, error: 'Expired token' });
    const code = payload.c as string;

    const lookupResp = await fetch(`${url}/rest/v1/bookings?select=booking_code,service_id,office_id,slot_date,slot_time,status,full_name,email&booking_code=eq.${encodeURIComponent(code)}`, {
      headers: { apikey: key, Authorization: `Bearer ${key}`, Accept: 'application/json' },
    });
    if (!lookupResp.ok) return res.status(404).json({ ok: false, error: 'Not found' });
    const rows = await lookupResp.json();
    if (!Array.isArray(rows) || rows.length === 0) return res.status(404).json({ ok: false, error: 'Not found' });
    const row = rows[0];
    return res.status(200).json({ ok: true, booking: row });
  } catch (err) {
    console.error('[track/resolve] error', err);
    return res.status(500).json({ ok: false, error: 'Internal Error' });
  }
}
