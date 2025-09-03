import type { NextApiRequest, NextApiResponse } from 'next';
import crypto from 'crypto';
import { Resend } from 'resend';

type BookingRow = {
  booking_code: string;
  email: string;
  full_name: string | null;
  service_id: string;
  office_id: string;
  slot_date: string; // yyyy-mm-dd
  slot_time: string; // hh:mm:ss
  status: string;
};

function base64url(input: Buffer | string) {
  return Buffer.from(input).toString('base64').replace(/=/g, '').replace(/\+/g, '-').replace(/\//g, '_');
}

function signToken(payload: object, secret: string) {
  const body = base64url(JSON.stringify(payload));
  const sig = crypto.createHmac('sha256', secret).update(body).digest();
  return `${body}.${base64url(sig)}`;
}

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    res.setHeader('Allow', 'POST');
    return res.status(405).json({ ok: false, error: 'Method Not Allowed' });
  }
  const { booking_code, email } = req.body || {};
  if (!booking_code || !email) {
    return res.status(400).json({ ok: false, error: 'Missing booking_code or email' });
  }

  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY; // required for server-side lookup bypassing RLS
  if (!url || !key) {
    console.warn('[track/request] Missing Supabase env, responding stub');
    return res.status(200).json({ ok: true, mode: 'stub' });
  }

  try {
    const lookupResp = await fetch(`${url}/rest/v1/bookings?select=booking_code,email,full_name,service_id,office_id,slot_date,slot_time,status&booking_code=eq.${encodeURIComponent(booking_code)}`, {
      headers: {
        apikey: key,
        Authorization: `Bearer ${key}`,
        Accept: 'application/json',
        Prefer: 'return=representation',
      },
    });
    if (!lookupResp.ok) {
      const t = await lookupResp.text().catch(() => '');
      console.error('[track/request] lookup failed', lookupResp.status, t);
      // For privacy, still return 200
      return res.status(200).json({ ok: true });
    }
    const rows = (await lookupResp.json()) as BookingRow[];
    const match = rows.find(r => (r.email || '').toLowerCase() === String(email).toLowerCase());
    if (!match) {
      // For privacy, do not reveal existence
      return res.status(200).json({ ok: true });
    }

    const site = process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000';
    const secret = process.env.TRACK_LINK_SECRET || key; // fall back to service role key in dev
    const exp = Math.floor(Date.now() / 1000) + 60 * 15; // 15 minutes
    const tokenPayload = { c: match.booking_code, e: exp, m: crypto.randomBytes(8).toString('hex') };
    const token = signToken(tokenPayload, secret);
    const link = `${site}/track?token=${encodeURIComponent(token)}`;

    // Email the link (Resend if configured; else stub)
    const apiKey = process.env.RESEND_API_KEY;
    if (apiKey) {
      const resend = new Resend(apiKey);
      const from = process.env.RESEND_FROM || 'onboarding@resend.dev';
      const sendRes = await resend.emails.send({
        from,
        to: [match.email],
        subject: 'Your booking tracking link',
        html: `<p>Hi ${match.full_name || 'Citizen'},</p><p>Use the link below to view your booking status:</p><p><a href="${link}">${link}</a></p><p>This link expires in 15 minutes.</p>`,
        text: `Use this link to view your booking: ${link} (valid 15 minutes)`
      });
      if (sendRes.error) {
        console.error('[track/request] email provider failed', sendRes.error);
        // still return ok for privacy
      }
    } else {
      console.log('[stub-email] track link', { to: match.email, link });
    }

    return res.status(200).json({ ok: true });
  } catch (err) {
    console.error('[track/request] error', err);
    // For privacy, return ok
    return res.status(200).json({ ok: true });
  }
}
