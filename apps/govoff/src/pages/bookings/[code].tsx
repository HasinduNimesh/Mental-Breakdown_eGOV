import React from 'react'
import { useRouter } from 'next/router'
import { Layout } from '@/components/Layout'
import { getSupabase } from '@/lib/supabaseClient'

type Booking = {
  booking_code: string
  full_name: string | null
  email: string | null
  service_id: string
  office_id: string
  slot_date: string
  slot_time: string
  status: string
}

type Doc = {
  id: number
  booking_code: string
  original_name: string
  object_key: string
  mime_type: string
  size_bytes: number
  status: 'Pending review'|'Needs fix'|'Pre-checked'
}

export default function BookingDetail() {
  const router = useRouter()
  const code = String(router.query.code||'')
  const supabase = React.useMemo(()=>getSupabase(),[])
  const [booking, setBooking] = React.useState<Booking | null>(null)
  const [docs, setDocs] = React.useState<Doc[]>([])
  const [loading, setLoading] = React.useState(true)
  const [note, setNote] = React.useState('')
  const [busy, setBusy] = React.useState(false)

  React.useEffect(()=>{
    if (!code) return
    let cancelled = false
    async function load(){
      setLoading(true)
      try {
  const { data: b } = await supabase
          .from('bookings')
          .select('booking_code, full_name, email, service_id, office_id, slot_date, slot_time, status')
          .eq('booking_code', code)
          .maybeSingle()
  const { data: d } = await supabase
          .from('appointment_documents')
          .select('id, booking_code, original_name, object_key, mime_type, size_bytes, status')
          .eq('booking_code', code)
          .order('id', { ascending: true })
  if (!cancelled) { setBooking((b as unknown as Booking) ?? null); setDocs((d as unknown as Doc[]) || []) }
      } finally { if (!cancelled) setLoading(false) }
    }
    load(); return ()=>{ cancelled = true }
  },[code, supabase])

  async function markCorrection() {
    if (!booking || busy) return
    setBusy(true)
    try {
      // Update document statuses to Needs fix
      const ids = docs.map(d=>d.id)
      if (ids.length) {
        await supabase.from('appointment_documents').update({ status: 'Needs fix' }).in('id', ids)
      }
      // Optional: send an email to the citizen using Resend through main app API
      await fetch('/api/email/reminder', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ to: booking.email, subject: 'Document correction needed', templateParams: { note }, booking: { id: booking.booking_code, dateISO: booking.slot_date, time: (booking.slot_time||'').slice(0,5) } }) })
      alert('Marked and notified citizen')
    } finally { setBusy(false) }
  }

  async function setStatus(newStatus: string) {
    if (!booking) return
    setBusy(true)
    try { await supabase.from('bookings').update({ status: newStatus }).eq('booking_code', booking.booking_code); setBooking({ ...booking, status: newStatus }) } finally { setBusy(false) }
  }

  return (
    <Layout>
      {loading ? <div className="text-sm text-gray-600">Loading…</div> : !booking ? <div>Not found.</div> : (
        <div className="space-y-6">
          <div className="bg-white border rounded p-4 shadow-sm">
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-lg font-semibold">{booking.booking_code}</h1>
                <div className="text-sm text-gray-600">{booking.full_name} • {booking.email}</div>
                <div className="text-sm text-gray-600">{booking.service_id} • {booking.office_id}</div>
                <div className="text-sm text-gray-600">{booking.slot_date} at {(booking.slot_time||'').slice(0,5)}</div>
              </div>
              <div className="flex items-center gap-2">
                {['Scheduled','Checked-in','Completed','Cancelled'].map(s => (
                  <button key={s} className={`px-3 py-1.5 border rounded text-sm ${booking.status===s?'bg-slate-100':''}`} disabled={busy} onClick={()=>setStatus(s)}>{s}</button>
                ))}
              </div>
            </div>
          </div>
          <section className="bg-white border rounded p-4 shadow-sm">
            <h2 className="font-semibold mb-2">Documents</h2>
            {!docs.length ? <div className="text-sm text-gray-600">No uploaded documents.</div> : (
              <ul className="divide-y">
                {docs.map(doc => (
                  <li key={doc.id} className="py-3 flex items-center justify-between">
                    <div>
                      <div className="font-medium">{doc.original_name}</div>
                      <div className="text-xs text-gray-600">{doc.mime_type} • {Math.round(doc.size_bytes/1024)} KB • {doc.status}</div>
                    </div>
                    <a
                      className="text-blue-600 hover:underline"
                      href={`/api/officer/doc-url?code=${encodeURIComponent(booking.booking_code)}&id=${doc.id}`}
                      target="_blank"
                      rel="noreferrer"
                    >Open</a>
                  </li>
                ))}
              </ul>
            )}
          </section>
          <section className="bg-white border rounded p-4 shadow-sm">
            <h2 className="font-semibold mb-2">Corrections</h2>
            <textarea className="w-full border rounded p-2 min-h-[120px]" placeholder="Explain what to fix…" value={note} onChange={e=>setNote(e.target.value)} />
            <div className="mt-2 flex items-center gap-2">
              <button className="px-3 py-1.5 border rounded" disabled={busy} onClick={markCorrection}>Mark as needs fix & notify</button>
              <span className="text-xs text-gray-600">Citizen will receive an email with this note.</span>
            </div>
          </section>
        </div>
      )}
    </Layout>
  )
}
