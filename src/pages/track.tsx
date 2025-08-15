import React from 'react';
import { Layout } from '@/components/layout/Layout';
import { Container } from '@/components/ui/Container';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';

const TrackPage: React.FC = () => {
  const [code, setCode] = React.useState('');
  const [email, setEmail] = React.useState('');
  const [sent, setSent] = React.useState(false);

  return (
    <Layout>
      <section className="py-10 bg-white">
        <Container>
          <Card className="max-w-xl mx-auto p-6">
            <h1 className="text-xl font-semibold mb-2">Track a booking</h1>
            <p className="text-sm text-text-600 mb-4">Enter your booking code and email to receive a one-time access link.</p>
            {!sent ? (
              <>
                <label className="block text-sm font-medium text-text-900 mb-1">Booking code</label>
                <input className="w-full border border-border rounded-md px-3 py-2 mb-3" value={code} onChange={(e) => setCode(e.target.value)} />
                <label className="block text-sm font-medium text-text-900 mb-1">Email</label>
                <input type="email" className="w-full border border-border rounded-md px-3 py-2 mb-4" value={email} onChange={(e) => setEmail(e.target.value)} />
                <div className="flex justify-end">
                  <button className="px-3 py-2 border border-border rounded-md" onClick={() => setSent(true)} disabled={!code || !email}>Send link</button>
                </div>
              </>
            ) : (
              <div className="text-sm text-text-700">If this booking exists, we’ve sent a link to {email}. Check your inbox.</div>
            )}
          </Card>
        </Container>
      </section>
    </Layout>
  );
};

export default TrackPage;
