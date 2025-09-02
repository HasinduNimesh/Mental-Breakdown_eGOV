import React from 'react';
import type { GetStaticProps } from 'next';
import { serverSideTranslations } from 'next-i18next/serverSideTranslations';
import { Layout } from '@/components/layout/Layout';
import { Container } from '@/components/ui/Container';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { Breadcrumbs } from '@/components/ui/Breadcrumbs';
import { getBookings, BookingDraft, SERVICES, OFFICES } from '@/lib/booking';
import { downloadBookingPDF } from '@/lib/pdf';
import { supabase } from '@/lib/supabaseClient';
import { useAuth } from '@/contexts/AuthContext';
import SignInModal from '@/components/auth/SignInModal';
import QRCode from 'qrcode';
import { sendEmailReminder } from '@/lib/email';

function useTimeUntil(dateISO: string, time: string) {
  const [value, setValue] = React.useState<string>('');
  React.useEffect(() => {
    const calc = () => {
      const dt = new Date(`${dateISO}T${time}:00+05:30`);
      const ms = dt.getTime() - Date.now();
      if (ms <= 0) return 'Now';
      const h = Math.floor(ms / 3600000);
      const m = Math.floor((ms % 3600000) / 60000);
      return `${h}h ${m}m`;
    };
    setValue(calc());
    const id = window.setInterval(() => setValue(calc()), 30000);
    return () => window.clearInterval(id);
  }, [dateISO, time]);
  return value;
}

const AppointmentsPage: React.FC = () => {
  const { user, loading } = useAuth();
  const [showSignIn, setShowSignIn] = React.useState(false);
  const [list, setList] = React.useState<BookingDraft[]>([]);

  const handleReminderSent = (bookingId: string) => {
    setList(currentList =>
      currentList.map(booking =>
        booking.id === bookingId
          ? { ...booking, is_reminder_sent: true } // Create a new object with the updated flag
          : booking
      )
    );
  };

  React.useEffect(() => {
  let cancelled = false;
  async function load() {
    if (loading) return;
    if (!user) {
      setList([]);
      return;
    }

    // Try DB first
    try {
      // First try selecting with the optional is_reminder_sent column
      let query = supabase
        .from('bookings')
        .select('booking_code, service_id, office_id, slot_date, slot_time, full_name, nic, email, phone, alt_phone, status, is_reminder_sent')
        .eq('user_id', user.id)
        .order('slot_date', { ascending: false })
        .limit(50);
      let { data, error } = await query;

      // If the column doesn't exist in this environment, retry without it
      if (error && (String(error.message).includes('is_reminder_sent') || String(error.code) === '42703')) {
        const retry = await supabase
          .from('bookings')
          .select('booking_code, service_id, office_id, slot_date, slot_time, full_name, nic, email, phone, alt_phone, status')
          .eq('user_id', user.id)
          .order('slot_date', { ascending: false })
          .limit(50);
        data = retry.data as any[] | null;
        error = retry.error as any;
      }

    if (error) {
        console.error("Error fetching from Supabase, falling back to local:", error);
    } else if (data && data.length > 0) {
        const mapped: BookingDraft[] = (data as any[]).map(r => ({
          id: r.booking_code,
          serviceId: r.service_id,
          officeId: r.office_id,
      dateISO: r.slot_date,
      time: (r.slot_time || '').slice(0, 5),
          fullName: r.full_name || '',
          nic: r.nic || '',
          email: r.email || '',
          phone: r.phone || '',
          altPhone: r.alt_phone || undefined,
          documents: [],
          createdAt: 0,
          status: (r.status || 'Scheduled') as BookingDraft['status'],
          is_reminder_sent: (r as any).is_reminder_sent || false,
        }));

        if (!cancelled) {
          setList(mapped);
        }
        return;
      }
    } catch (e) {
      console.error("Exception fetching from Supabase, falling back to local:", e);
    }
    
    try {
      console.log("Using fallback: fetching bookings from local storage.");
  const localBookings = await getBookings();
      if (!cancelled) {
        setList(localBookings);
      }
    } catch (e) {
      console.error("Failed to fetch from local storage fallback:", e);
    }
  }

  load();
  return () => { cancelled = true; };
}, [user, loading]);

  React.useEffect(() => {
    if (loading) return;
    if (!user) setShowSignIn(true); else setShowSignIn(false);
  }, [user, loading]);

  return (
    <>
    <Layout>
      <section className="bg-white">
        <Container className="py-4">
          <Breadcrumbs items={[{ label: 'Home', href: '/' }, { label: 'My Appointments' }]} />
        </Container>
      </section>

      <section className="py-8 sm:py-12 bg-bg-50">
        <Container>
          <div className="grid grid-cols-1 gap-4">
            {list.map((b) => (
              <AppointmentRow key={b.id} b={b} user={user} onReminderSent={handleReminderSent} />
            ))}
            {user ? (
              list.length === 0 && (
                <Card className="p-8 text-center text-text-700">No appointments yet. After booking, they will appear here.</Card>
              )
            ) : (
              <Card className="p-8 text-center text-text-700">Please sign in to view your appointments.</Card>
            )}
          </div>
        </Container>
      </section>
  </Layout>
  <SignInModal open={!loading && showSignIn && !user} onClose={() => setShowSignIn(false)} context="appointments" />
  </>
  );
};

export default AppointmentsPage;

export const getStaticProps: GetStaticProps = async ({ locale }) => {
  return {
    props: {
      ...(await serverSideTranslations(locale ?? 'en', ['common'])),
    },
  };
};

function AppointmentRow({ b, user, onReminderSent }: { b: BookingDraft, user: any, onReminderSent: (bookingId: string) => void }) {
  const svc = SERVICES.find(s => s.id === b.serviceId) || ({ id: b.serviceId, title: b.serviceId, department: '—' } as any);
  const off = OFFICES.find(o => o.id === b.officeId) || ({ id: b.officeId, name: 'Office', city: '', timezone: 'Asia/Colombo' } as any);
  const countdown = useTimeUntil(b.dateISO, b.time);
  const [qrDataUrl, setQrDataUrl] = React.useState<string | null>(null);
  const [sending, setSending] = React.useState(false);
  const [sendError, setSendError] = React.useState<string | null>(null);

  const appointmentMs = React.useMemo(() => new Date(`${b.dateISO}T${b.time}:00+05:30`).getTime(), [b.dateISO, b.time]);
  const reminderWindowMs = 48 * 60 * 60 * 1000; // 48h window
  const withinReminderWindow = React.useMemo(() => (appointmentMs - Date.now()) <= reminderWindowMs, [appointmentMs]);

  React.useEffect(() => {
    async function checkAndSendReminder() {
      if (b.is_reminder_sent) {
        return;
      }

      // Local per-device fallback: skip if we've already sent a reminder for this booking on this device
      try {
        const k = 'egov_reminders_v1';
        const raw = typeof window !== 'undefined' ? localStorage.getItem(k) : null;
        const set = new Set<string>(raw ? JSON.parse(raw) : []);
        if (set.has(b.id)) return;
      } catch {}

  // 2. Check time and user
  if (user && withinReminderWindow) {
        try {
          // 3. Send email and wait for it
          await sendEmailReminder(b, user);
          console.log(`✅ Email sent for ${b.id}. Now attempting to update the database...`);

          // 4. Update the database if email was successful
          const { data: updateData, error: updateError } = await supabase
            .from('bookings')
            .update({ is_reminder_sent: true })
            .eq('booking_code', b.id)
            .select(); // Assuming 'id' is your primary key for bookings

          if (updateError) {
            // If column doesn't exist yet, treat as best-effort success and fall back to local flag
            if (
              String(updateError.message).includes('is_reminder_sent') || String(updateError.code) === '42703' ||
              String(updateError.message).toLowerCase().includes('permission denied') || String(updateError.code) === '42501'
            ) {
              try {
                const k = 'egov_reminders_v1';
                const raw = typeof window !== 'undefined' ? localStorage.getItem(k) : null;
                const set = new Set<string>(raw ? JSON.parse(raw) : []);
                set.add(b.id);
                if (typeof window !== 'undefined') localStorage.setItem(k, JSON.stringify(Array.from(set)));
              } catch {}
              onReminderSent(b.id);
            } else {
              console.error('Failed to update reminder status in DB:', updateError);
            }
          } else {
            console.log(`Successfully updated DB for booking ${b.id}`);
            onReminderSent(b.id);
          }
        } catch (error) {
          console.error("Skipping DB update because email failed to send.");
        }
      }
    }

    checkAndSendReminder();
  }, [b, user, onReminderSent]);

  async function sendNow() {
    if (!user || sending) return;
    setSending(true);
    setSendError(null);
    try {
      await sendEmailReminder(b, user);
      const { error: updateError } = await supabase
        .from('bookings')
        .update({ is_reminder_sent: true })
        .eq('booking_code', b.id);
      if (updateError) {
        const colMissing = String(updateError.message).includes('is_reminder_sent') || String(updateError.code) === '42703';
        const permDenied = String(updateError.message).toLowerCase().includes('permission denied') || String(updateError.code) === '42501';
        if (!(colMissing || permDenied)) {
          throw updateError;
        }
      }
      // Local fallback mark
      try {
        const k = 'egov_reminders_v1';
        const raw = typeof window !== 'undefined' ? localStorage.getItem(k) : null;
        const set = new Set<string>(raw ? JSON.parse(raw) : []);
        set.add(b.id);
        if (typeof window !== 'undefined') localStorage.setItem(k, JSON.stringify(Array.from(set)));
      } catch {}
      onReminderSent(b.id);
    } catch (e: any) {
      setSendError(e?.message || 'Failed to send reminder');
    } finally {
      setSending(false);
    }
  }

  React.useEffect(() => {
    let cancelled = false;
    async function makeQR() {
      try {
        const payload = JSON.stringify({
          id: b.id,
          serviceId: b.serviceId,
          officeId: b.officeId,
          date: b.dateISO,
          time: b.time,
        });
        const url = await QRCode.toDataURL(payload, {
          width: 128,
          margin: 0,
          color: { dark: '#1f2937', light: '#ffffff' },
          errorCorrectionLevel: 'M',
        });
        if (!cancelled) setQrDataUrl(url);
      } catch {
        if (!cancelled) setQrDataUrl(null);
      }
    }
    makeQR();
    return () => { cancelled = true; };
  }, [b.id, b.serviceId, b.officeId, b.dateISO, b.time]);
  return (
    <Card className="p-4">
      <div className="grid grid-cols-1 sm:grid-cols-[1fr_auto] gap-3 items-start">
        {/* Left details */}
        <div className="min-w-0">
          <div className="font-semibold text-text-900 truncate">{svc.title}</div>
          <div className="text-sm text-text-700 truncate">{off.name}, {off.city}</div>
          <div className="text-sm text-text-700">{b.dateISO} at {b.time}</div>
          {/* Badges inline on mobile */}
          <div className="mt-2 flex items-center gap-2 flex-wrap sm:hidden">
            <Badge tone={b.status === 'Scheduled' ? 'warning' : 'neutral'}>{b.status}</Badge>
            <Badge tone="neutral">Starts in {countdown || '—'}</Badge>
          </div>
        </div>

        {/* Right side: badges (hidden on mobile), QR and actions */}
        <div className="flex items-center justify-start sm:justify-end gap-3">
          <div className="hidden sm:flex items-center gap-2">
            <Badge tone={b.status === 'Scheduled' ? 'warning' : 'neutral'}>{b.status}</Badge>
            <Badge tone="neutral">Starts in {countdown || '—'}</Badge>
          </div>
          {qrDataUrl ? (
            <img src={qrDataUrl} alt={`QR for ${b.id}`} className="w-14 h-14 sm:w-16 sm:h-16 rounded border border-border bg-white p-0.5 shrink-0" />
          ) : (
            <div className="w-14 h-14 sm:w-16 sm:h-16 grid place-items-center rounded border border-border bg-bg-50 text-[10px] text-text-500 shrink-0">QR…</div>
          )}
          {withinReminderWindow && (
            b.is_reminder_sent ? (
              <Badge tone="success" className="hidden sm:inline-flex">Reminder sent</Badge>
            ) : (
              <Button variant="outline" className="hidden sm:inline-flex" disabled={sending} onClick={sendNow}>
                {sending ? 'Sending…' : 'Send reminder'}
              </Button>
            )
          )}
          <Button
            variant="outline"
            className="hidden sm:inline-flex"
            onClick={() => downloadBookingPDF({ booking: b, service: svc, office: off, tz: Intl.DateTimeFormat().resolvedOptions().timeZone, qrDataUrl })}
          >
            Download PDF
          </Button>
        </div>
      </div>
      {sendError && (
        <div className="mt-2 text-xs text-red-600">{sendError}</div>
      )}
      {/* Mobile action button full width */}
      <div className="mt-3 sm:hidden">
        <Button
          variant="outline"
          className="w-full"
          onClick={() => downloadBookingPDF({ booking: b, service: svc, office: off, tz: Intl.DateTimeFormat().resolvedOptions().timeZone, qrDataUrl })}
        >
          Download PDF
        </Button>
        {withinReminderWindow && (
          b.is_reminder_sent ? (
            <div className="mt-2"><Badge tone="success">Reminder sent</Badge></div>
          ) : (
            <div className="mt-2"><Button variant="outline" className="w-full" disabled={sending} onClick={sendNow}>{sending ? 'Sending…' : 'Send reminder'}</Button></div>
          )
        )}
      </div>
    </Card>
  );
}
