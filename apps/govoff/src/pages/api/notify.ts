import type { NextApiRequest, NextApiResponse } from 'next'
import { Resend } from 'resend'

type NotifyKind = 'confirmation' | 'reminder' | 'status' | 'correction'
type NotifyBody = {
  to: string
  kind: NotifyKind
  booking: { id: string; dateISO?: string; time?: string }
  note?: string
}
type NotifyResponse = { ok: true; provider?: 'stub'; id?: string } | { ok: false; error: unknown }

export default async function handler(req: NextApiRequest, res: NextApiResponse<NotifyResponse | { error: string }>) {
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' })
  const { to, kind, booking, note } = (req.body || {}) as Partial<NotifyBody>
  if (!to || !kind || !booking) return res.status(400).json({ error: 'Missing fields' })

  const apiKey = process.env.RESEND_API_KEY
  const from = process.env.RESEND_FROM || 'onboarding@resend.dev'
  if (!apiKey) {
    console.log('[govoff/notify] stub', { to, kind, booking, note })
    return res.status(200).json({ ok: true, provider: 'stub' })
  }
  const resend = new Resend(apiKey)

  const subjects: Record<string, string> = {
    confirmation: `Appointment confirmed: ${booking?.id}`,
    reminder: `Reminder: your appointment ${booking?.dateISO} ${booking?.time}`,
    status: `Update for your appointment ${booking?.id}`,
    correction: `Corrections required for your appointment ${booking?.id}`,
  }

  const intro =
    kind === 'correction'
      ? 'An officer reviewed your documents and requested some corrections:'
      : kind === 'status'
      ? 'There is an update from the officer.'
      : kind === 'reminder'
      ? 'This is a reminder for your upcoming appointment.'
      : 'Your appointment is confirmed.'

  const html = `
    <div style="font-family:system-ui;line-height:1.5;color:#111">
      <p>Dear citizen,</p>
      <p>${intro}</p>
      ${note ? `<blockquote style="margin:8px 0;padding:8px 12px;border-left:3px solid #4f46e5;background:#f8f8ff">${String(
        note
      )}</blockquote>` : ''}
      <p><strong>Appointment details</strong></p>
      <ul>
        <li><b>Code:</b> ${booking?.id}</li>
        <li><b>Date:</b> ${booking?.dateISO || '-'}</li>
        <li><b>Time:</b> ${booking?.time || '-'}</li>
      </ul>
      <p style="margin-top:12px">Thank you,<br/>Officer Console</p>
    </div>
  `
  const resp = await resend.emails.send({ from, to, subject: subjects[kind] || 'Appointment update', html })
  if ('error' in resp && resp.error) return res.status(500).json({ ok: false, error: resp.error })
  return res.status(200).json({ ok: true, id: resp.data?.id })
}
