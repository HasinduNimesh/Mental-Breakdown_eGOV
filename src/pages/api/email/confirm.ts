import type { NextApiRequest, NextApiResponse } from 'next';
import { Resend } from 'resend';

// Sends a booking confirmation email.
// Behavior:
// - If RESEND_API_KEY exists, sends via Resend with RESEND_FROM or onboarding@resend.dev
// - Otherwise, logs to console and responds ok (dev stub)
export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });
  try {
    const { to, booking, service, office, tz } = req.body || {};
    if (!to || !booking) return res.status(400).json({ error: 'Missing required fields' });

    const serviceTitle: string = service?.title || booking?.serviceId || 'Service';
    const serviceDept: string = service?.department || '—';
    const officeName: string = office?.name || booking?.officeId || 'Office';
    const officeCity: string = office?.city || '';
    const dateISO: string = booking?.dateISO;
    const time: string = booking?.time;
    const code: string = booking?.id;
    const timezone = tz || 'Asia/Colombo';

    const subject = `Booking confirmed: ${serviceTitle} — ${dateISO} ${time} — ${code}`;
    const preheader = `Your appointment is confirmed for ${dateISO} at ${time} (${timezone}).`;

    const html = `
      <div style="font-family: system-ui, -apple-system, Segoe UI, Roboto, Helvetica, Arial, sans-serif; color: #111827;">
        <p style="color:#6b7280; font-size:12px; margin:0 0 12px 0;">${preheader}</p>
        <h2 style="margin:0 0 12px 0;">Your appointment is confirmed</h2>
        <p style="margin:0 0 8px 0;">Thanks for booking with us. Here are your details:</p>
        <ul style="line-height:1.6; padding-left:16px;">
          <li><strong>Booking code:</strong> ${code}</li>
          <li><strong>Service:</strong> ${serviceTitle}</li>
          <li><strong>Department:</strong> ${serviceDept}</li>
          <li><strong>Office:</strong> ${officeName}${officeCity ? `, ${officeCity}` : ''}</li>
          <li><strong>Date & time:</strong> ${dateISO} at ${time} (${timezone})</li>
        </ul>
        <p style="margin:12px 0 8px 0;">Bring your original documents to your visit. Some services may require photocopies too.</p>
        <p style="margin:12px 0 8px 0; color:#6b7280; font-size:12px;">You can reschedule or cancel up to 24 hours before your time.</p>
      </div>
    `;

    const apiKey = process.env.RESEND_API_KEY;
    if (!apiKey) {
      console.log('[email/confirm] Stub send', { to, subject, booking: { id: code, dateISO, time } });
      return res.status(200).json({ ok: true, provider: 'stub' });
    }

    const resend = new Resend(apiKey);
    const from = process.env.RESEND_FROM || 'onboarding@resend.dev';
    const sendRes = await resend.emails.send({
      from,
      to,
      subject,
      html,
    });
    if ((sendRes as any).error) {
      console.error('[email/confirm] Resend failed', (sendRes as any).error);
      return res.status(500).json({ ok: false, error: (sendRes as any).error });
    }
    console.log('[email/confirm] Sent via Resend', { id: (sendRes.data as any)?.id, to, booking: code });
    return res.status(200).json({ ok: true, provider: 'resend', id: (sendRes.data as any)?.id });
  } catch (err) {
    console.error('[email/confirm] error', err);
    return res.status(500).json({ error: 'Internal error' });
  }
}
