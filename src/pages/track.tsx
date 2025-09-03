import React from 'react';
import type { GetStaticProps } from 'next';
import { serverSideTranslations } from 'next-i18next/serverSideTranslations';
import { Layout } from '@/components/layout/Layout';
import { Container } from '@/components/ui/Container';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { useRouter } from 'next/router';

const TrackPage: React.FC = () => {
  const [code, setCode] = React.useState('');
  const [email, setEmail] = React.useState('');
  const [sent, setSent] = React.useState(false);
  const [loading, setLoading] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);
  const [booking, setBooking] = React.useState<any | null>(null);
  const router = useRouter();

  // If a token exists in the URL, resolve it automatically
  React.useEffect(() => {
    const t = (router.query.token as string) || '';
    if (!t) return;
    setLoading(true);
    setError(null);
    (async () => {
      try {
        const res = await fetch(`/api/track/resolve?token=${encodeURIComponent(t)}`);
        const data = await res.json();
        if (!res.ok || !data?.ok) throw new Error(data?.error || 'Invalid or expired link');
        setBooking(data.booking || null);
      } catch (e: any) {
        setError(e?.message || 'Failed to load booking');
      } finally {
        setLoading(false);
      }
    })();
  }, [router.query.token]);

  async function requestLink() {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch('/api/track/request', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ booking_code: code.trim(), email: email.trim() }),
      });
      // Always show success message for privacy
      setSent(true);
    } catch (e: any) {
      setSent(true);
    } finally {
      setLoading(false);
    }
  }

  return (
    <Layout>
      <section className="py-10 bg-white">
        <Container>
          <Card className="max-w-xl mx-auto p-6">
            <h1 className="text-xl font-semibold mb-2">Track a booking</h1>
            {!booking ? (
              <>
                <p className="text-sm text-text-600 mb-4">Enter your booking code and email to receive a one-time access link.</p>
                {!sent ? (
                  <>
                    <label className="block text-sm font-medium text-text-900 mb-1">Booking code</label>
                    <input className="w-full border border-border rounded-md px-3 py-2 mb-3" value={code} onChange={(e) => setCode(e.target.value)} />
                    <label className="block text-sm font-medium text-text-900 mb-1">Email</label>
                    <input type="email" className="w-full border border-border rounded-md px-3 py-2 mb-4" value={email} onChange={(e) => setEmail(e.target.value)} />
                    {error && <div className="text-xs text-red-600 mb-2">{error}</div>}
                    <div className="flex justify-end">
                      <button className="px-3 py-2 border border-border rounded-md" onClick={requestLink} disabled={!code || !email || loading}>{loading ? 'Sending…' : 'Send link'}</button>
                    </div>
                  </>
                ) : (
                  <div className="text-sm text-text-700">If this booking exists, we’ve sent a link to {email}. Check your inbox.</div>
                )}
              </>
            ) : (
              <div>
                <p className="text-sm text-text-700">Booking found.</p>
                <div className="mt-3 text-sm">
                  <div><span className="font-medium">Code:</span> {booking.booking_code}</div>
                  <div><span className="font-medium">Service:</span> {booking.service_id}</div>
                  <div><span className="font-medium">Office:</span> {booking.office_id}</div>
                  <div><span className="font-medium">When:</span> {booking.slot_date} at {String(booking.slot_time).slice(0,5)}</div>
                  <div><span className="font-medium">Status:</span> {booking.status}</div>
                </div>
              </div>
            )}
          </Card>
        </Container>
      </section>
    </Layout>
  );
};

export default TrackPage;

export const getStaticProps: GetStaticProps = async ({ locale }) => {
  return {
    props: {
      ...(await serverSideTranslations(locale ?? 'en', ['common'])),
    },
  };
};
