import type { NextApiRequest, NextApiResponse } from 'next';

// Dev/stub email reminder endpoint.
// In production, replace this with a real provider (SMTP, Resend, SendGrid, etc.).
export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    res.setHeader('Allow', 'POST');
    return res.status(405).json({ ok: false, error: 'Method Not Allowed' });
  }

  try {
    const { to, subject, text, html, booking, templateParams } = req.body || {};
    // Minimal validation (best-effort)
    if (!to && !(booking?.email)) {
      return res.status(400).json({ ok: false, error: 'Missing recipient' });
    }
    // Log payload for server inspection (no secrets)
    console.log('[stub-email] reminder', {
      to: to || booking?.email,
      subject: subject || 'Appointment Reminder',
      templateParams,
      bookingId: booking?.id,
    });
    // Simulate success
    return res.status(200).json({ ok: true, provider: 'stub' });
  } catch (err: any) {
    console.error('[stub-email] error', err);
    return res.status(500).json({ ok: false, error: 'Internal Error' });
  }
}
