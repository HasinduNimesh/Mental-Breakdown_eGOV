import React from 'react';
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

  React.useEffect(() => {
    let cancelled = false;
    async function load() {
      if (loading) return;
      if (!user) { setList([]); return; }
      // Try DB first
      try {
        const { data, error } = await supabase
          .from('bookings')
          .select('booking_code, service_id, office_id, slot_date, slot_time, full_name, nic, email, phone, alt_phone, status')
          .eq('user_id', user.id)
          .order('slot_date', { ascending: false })
          .limit(50);
        if (!error && data) {
          const mapped: BookingDraft[] = (data as any[]).map(r => ({
            id: r.booking_code,
            serviceId: r.service_id,
            officeId: r.office_id,
            dateISO: r.slot_date,
            time: r.slot_time.slice(0,5),
            fullName: r.full_name || '',
            nic: r.nic || '',
            email: r.email || '',
            phone: r.phone || '',
            altPhone: r.alt_phone || undefined,
            documents: [],
            createdAt: 0,
            status: (r.status || 'Scheduled') as BookingDraft['status'],
          }));
          if (!cancelled) setList(mapped);
          return;
        }
      } catch {}
      // Fallback to local
      if (!cancelled) setList(getBookings());
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
              <AppointmentRow key={b.id} b={b} />
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

function AppointmentRow({ b }: { b: BookingDraft }) {
  const svc = SERVICES.find(s => s.id === b.serviceId)!;
  const off = OFFICES.find(o => o.id === b.officeId)!;
  const countdown = useTimeUntil(b.dateISO, b.time);
  const [qrDataUrl, setQrDataUrl] = React.useState<string | null>(null);

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
          <Button
            variant="outline"
            className="hidden sm:inline-flex"
            onClick={() => downloadBookingPDF({ booking: b, service: svc, office: off, tz: Intl.DateTimeFormat().resolvedOptions().timeZone, qrDataUrl })}
          >
            Download PDF
          </Button>
        </div>
      </div>
      {/* Mobile action button full width */}
      <div className="mt-3 sm:hidden">
        <Button
          variant="outline"
          className="w-full"
          onClick={() => downloadBookingPDF({ booking: b, service: svc, office: off, tz: Intl.DateTimeFormat().resolvedOptions().timeZone, qrDataUrl })}
        >
          Download PDF
        </Button>
      </div>
    </Card>
  );
}
