import type { NextApiRequest, NextApiResponse } from 'next';
import { Resend } from 'resend';

// Reminder email endpoint.
// Behavior:
// - If RESEND_API_KEY and RESEND_FROM are set, send via Resend API
// - Otherwise, act as a stub and just log the request
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

    const recipient = to || booking?.email;
    const subj = subject || 'Appointment Reminder';

    // Build a simple HTML if not provided
    const builtHtml = html || buildReminderHtml(templateParams, booking);
    const builtText = text || buildReminderText(templateParams, booking);

    const apiKey = process.env.RESEND_API_KEY;
    if (apiKey) {
      const resend = new Resend(apiKey);
      const from = process.env.RESEND_FROM || 'onboarding@resend.dev';
      const sendRes = await resend.emails.send({
        from,
        to: Array.isArray(recipient) ? recipient : [recipient],
        subject: subj,
        html: builtHtml,
        text: builtText,
      });
      if (sendRes.error) {
        console.error('[email] Resend failed', sendRes.error);
        return res.status(502).json({ ok: false, error: 'Email provider failed' });
      }
      console.log('[email] Sent via Resend', { id: (sendRes.data as any)?.id, to: recipient, bookingId: booking?.id });
      return res.status(200).json({ ok: true, provider: 'resend', id: (sendRes.data as any)?.id });
    }

    // Fallback: stub mode
    console.log('[stub-email] reminder', { to: recipient, subject: subj, templateParams, bookingId: booking?.id });
    return res.status(200).json({ ok: true, provider: 'stub' });
  } catch (err: any) {
    console.error('[stub-email] error', err);
    return res.status(500).json({ ok: false, error: 'Internal Error' });
  }
}

function buildReminderHtml(params: any, booking: any) {
  const name = params?.userName || booking?.fullName || 'Citizen';
  const service = params?.serviceName || booking?.serviceId || 'Service';
  const office = params?.officeName || booking?.officeId || 'Office';
  const date = params?.appointmentDate || booking?.dateISO || '';
  const time = params?.appointmentTime || booking?.time || '';
  return `
  <div style="font-family: Arial, sans-serif; line-height:1.6; color:#111">
    <p>Hi ${escapeHtml(name)},</p>
    <p>This is a friendly reminder for your upcoming appointment.</p>
    <p><strong>Appointment Details</strong><br/>
       Service: ${escapeHtml(service)}<br/>
       Location: ${escapeHtml(office)}<br/>
       When: ${escapeHtml(date)} at ${escapeHtml(time)}</p>
    <p>Booking code: <strong>${escapeHtml(booking?.id || '')}</strong></p>
    <p>Thank you,<br/>Citizen Services Portal</p>
  </div>`;
}

function buildReminderText(params: any, booking: any) {
  const name = params?.userName || booking?.fullName || 'Citizen';
  const service = params?.serviceName || booking?.serviceId || 'Service';
  const office = params?.officeName || booking?.officeId || 'Office';
  const date = params?.appointmentDate || booking?.dateISO || '';
  const time = params?.appointmentTime || booking?.time || '';
  return `Hi ${name},\n\nThis is a friendly reminder for your upcoming appointment.\n\n` +
         `Appointment Details:\n` +
         `Service: ${service}\n` +
         `Location: ${office}\n` +
         `When: ${date} at ${time}\n` +
         `Booking code: ${booking?.id || ''}\n\n` +
         `Citizen Services Portal`;
}

function escapeHtml(s: any) {
  return String(s || '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');
}
