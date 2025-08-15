import React from 'react';
import { Layout } from '@/components/layout/Layout';
import { Container } from '@/components/ui/Container';
import { Card } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { Breadcrumbs } from '@/components/ui/Breadcrumbs';
import { getBookings, BookingDraft, SERVICES, OFFICES } from '@/lib/booking';
import { useAuth } from '@/contexts/AuthContext';
import SignInModal from '@/components/auth/SignInModal';

function timeUntil(dateISO: string, time: string) {
  const dt = new Date(`${dateISO}T${time}:00+05:30`);
  const ms = dt.getTime() - Date.now();
  if (ms <= 0) return 'Now';
  const h = Math.floor(ms / 3600000);
  const m = Math.floor((ms % 3600000) / 60000);
  return `${h}h ${m}m`;
}

const AppointmentsPage: React.FC = () => {
  const { user } = useAuth();
  const [showSignIn, setShowSignIn] = React.useState(false);
  const [list, setList] = React.useState<BookingDraft[]>([]);

  React.useEffect(() => {
    if (user) setList(getBookings());
  }, []);

  React.useEffect(() => {
    if (!user) setShowSignIn(true); else setShowSignIn(false);
  }, [user]);

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
            {list.map((b) => {
              const svc = SERVICES.find(s => s.id === b.serviceId)!;
              const off = OFFICES.find(o => o.id === b.officeId)!;
              return (
                <Card key={b.id} className="p-4 flex items-center justify-between gap-4">
                  <div>
                    <div className="font-semibold text-text-900">{svc.title}</div>
                    <div className="text-sm text-text-700">{off.name}, {off.city}</div>
                    <div className="text-sm text-text-700">{b.dateISO} at {b.time}</div>
                  </div>
                  <div className="flex items-center gap-3">
                    <Badge tone={b.status === 'Scheduled' ? 'warning' : 'neutral'}>{b.status}</Badge>
                    <Badge tone="neutral">Starts in {timeUntil(b.dateISO, b.time)}</Badge>
                    <div className="w-16 h-16 bg-[repeating-linear-gradient(45deg,_#e5e7eb,_#e5e7eb_8px,_#fff_8px,_#fff_16px)] rounded" aria-label="QR code" />
                  </div>
                </Card>
              );
            })}
            {list.length === 0 && (
              <Card className="p-8 text-center text-text-700">No appointments yet. After booking, they will appear here.</Card>
            )}
          </div>
        </Container>
      </section>
  </Layout>
  <SignInModal open={showSignIn && !user} onClose={() => setShowSignIn(false)} context="appointments" />
  </>
  );
};

export default AppointmentsPage;
