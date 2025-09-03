import React from 'react';
import { Card } from '../ui/Card';
import { Button } from '../ui/Button';
import { reviewBookingDocument, listBookingDocuments, getAppointmentDocSignedUrl } from '../../lib/adminData';

export function ReviewPanel({ onSendMessage }: { onSendMessage: (bookingCode: string, body: string) => Promise<void> }) {
  const [bookingCode, setBookingCode] = React.useState('');
  const [docs, setDocs] = React.useState<Array<{
    id: number; original_name: string | null; review_status: 'Pending review' | 'Needs fix' | 'Pre-checked'; reviewer_note: string | null; object_key?: string; signed_url?: string;
  }>>([]);
  const [note, setNote] = React.useState('');

  async function load() {
    if (!bookingCode) return;
    const list = await listBookingDocuments(bookingCode);
    const enriched = await Promise.all(list.map(async (d) => ({
      id: d.id,
      original_name: d.original_name,
      review_status: d.status,
      reviewer_note: d.notes,
      object_key: d.object_key,
      signed_url: d.object_key ? await getAppointmentDocSignedUrl(d.object_key).catch(() => undefined) : undefined,
    })));
    setDocs(enriched);
  }

  async function mark(id: number, status: 'Pending review' | 'Needs fix' | 'Pre-checked') {
    await reviewBookingDocument(id, status, note || undefined);
    await load();
  }

  return (
    <Card className="mt-6">
  <h3 className="text-lg font-semibold">Pre-submitted Document Review</h3>
  <p className="mt-1 text-sm text-slate-600 dark:text-slate-400">Enter a booking code to fetch and review documents, add notes, and request fixes before the visit.</p>

      <div className="mt-4 flex flex-wrap items-center gap-2">
  <input value={bookingCode} onChange={(e) => setBookingCode(e.target.value)} placeholder="Booking code"
               className="h-9 w-56 rounded-lg border px-3 text-sm outline-none focus:ring-2 focus:ring-blue-500" />
        <Button onClick={load}>Load</Button>
      </div>

      {docs.length > 0 && (
        <div className="mt-4 space-y-3">
          {docs.map(d => (
            <div key={d.id} className="flex items-center gap-3">
              <div className="min-w-0 flex-1">
                <div className="font-medium truncate">{d.original_name || 'Document'}</div>
                <div className="text-xs text-slate-500">Status: {d.review_status}{d.reviewer_note ? ` — Note: ${d.reviewer_note}` : ''}</div>
                {d.signed_url && (
                  <div className="mt-1 flex items-center gap-2 text-xs">
                    <a href={d.signed_url} target="_blank" rel="noreferrer" className="text-blue-600 hover:underline">View / Download</a>
                    <button
                      onClick={() => navigator.clipboard?.writeText(d.signed_url || '')}
                      className="rounded border px-2 py-0.5 hover:bg-gray-50"
                    >Copy link</button>
                  </div>
                )}
              </div>
        <Button variant="soft" onClick={() => mark(d.id, 'Pre-checked')}>Pre-check</Button>
              <Button variant="outline" onClick={() => mark(d.id, 'Pending review')}>Reset</Button>
              <Button variant="destructive" onClick={() => mark(d.id, 'Needs fix')}>Needs fix</Button>
            </div>
          ))}

          <div className="pt-2">
            <textarea value={note} onChange={(e) => setNote(e.target.value)} placeholder="Optional reviewer note to citizen"
                      className="w-full rounded-lg border px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-blue-500" rows={3} />
            <div className="mt-2 flex justify-end">
        <Button onClick={() => onSendMessage(bookingCode, note || 'Please check your documents and fix highlighted issues.')}>Send message to citizen</Button>
            </div>
          </div>
        </div>
      )}

      {docs.length === 0 && bookingCode && (
        <div className="mt-4 text-sm text-slate-500">No documents found for this appointment.</div>
      )}
    </Card>
  );
}
