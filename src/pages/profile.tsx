import React from 'react';
import { Layout } from '@/components/layout/Layout';
import { Container } from '@/components/ui/Container';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { Breadcrumbs } from '@/components/ui/Breadcrumbs';
import { useAuth } from '@/contexts/AuthContext';
import { getMyProfile, upsertProfile, getCurrentPhotoSignedUrl } from '@/lib/profile';

const ProfilePage: React.FC = () => {
  // Prevent SSR/CSR markup mismatch by rendering a stable placeholder until hydrated
  const [hydrated, setHydrated] = React.useState(false);
  React.useEffect(() => {
    setHydrated(true);
  }, []);

  const { user } = useAuth();
  const [loading, setLoading] = React.useState(true);
  const [error, setError] = React.useState<string | null>(null);
  const [p, setP] = React.useState<any>(null);
  const [phone, setPhone] = React.useState('');
  const [lang, setLang] = React.useState<'en'|'si'|'ta'>('en');
  const [photoUrl, setPhotoUrl] = React.useState<string | null>(null);

  React.useEffect(() => {
    let cancelled = false;
    async function load() {
      if (!hydrated || !user) { setLoading(false); return; }
      setLoading(true);
      setError(null);
      try {
        const prof = await getMyProfile();
        if (cancelled) return;
        setP(prof);
        setPhone(prof?.phone ?? '');
        setLang((prof?.preferred_language as any) ?? 'en');
        const url = await getCurrentPhotoSignedUrl(prof?.selfie_key ?? null);
        if (!cancelled) setPhotoUrl(url);
      } catch (e: any) {
        if (!cancelled) setError('Failed to load profile');
      } finally {
        if (!cancelled) setLoading(false);
      }
    }
    load();
    return () => { cancelled = true; };
  }, [hydrated, user]);

  if (!hydrated) {
    return (
      <Layout>
        <section className="bg-white">
          <Container className="py-4">
            <Breadcrumbs items={[{ label: 'Home', href: '/' }, { label: 'Profile' }]} />
          </Container>
        </section>
        <section className="py-8 sm:py-12">
          <Container>
            <Card className="p-6">Loading…</Card>
          </Container>
        </section>
      </Layout>
    );
  }

  async function onSaveBasics() {
    try {
      setError(null);
      await upsertProfile({ phone, preferred_language: lang });
    } catch {
      setError('Failed to save');
    }
  }

  if (!user) {
    return (
      <Layout>
        <section className="bg-white">
          <Container className="py-4">
            <Breadcrumbs items={[{ label: 'Home', href: '/' }, { label: 'Profile' }]} />
          </Container>
        </section>
        <section className="py-8 sm:py-12">
          <Container>
            <Card className="p-6 text-center">
              Please sign in to view your profile.
            </Card>
          </Container>
        </section>
      </Layout>
    );
  }

  return (
    <Layout>
      <section className="bg-white">
        <Container className="py-4">
          <Breadcrumbs items={[{ label: 'Home', href: '/' }, { label: 'Profile' }]} />
        </Container>
      </section>

      <section className="py-8 sm:py-12">
        <Container>
          {loading ? (
            <Card className="p-6">Loading…</Card>
          ) : (
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              <div className="lg:col-span-2 space-y-6">
                <Card className="p-6 flex items-center gap-4">
                  <div className="w-16 h-16 rounded-full bg-bg-100 overflow-hidden flex items-center justify-center text-xl font-semibold">
                    {photoUrl ? (
                      <img src={photoUrl} alt="Avatar" className="w-full h-full object-cover" />
                    ) : (
                      <span>{(p?.full_name || user.email || 'U').slice(0,1).toUpperCase()}</span>
                    )}
                  </div>
                  <div className="min-w-0">
                    <div className="text-lg font-semibold text-text-900 truncate">{p?.full_name || 'Your name'}</div>
                    <div className="text-sm text-text-600 truncate">{user.email}</div>
                    <div className="mt-1">
                      {p?.verified ? (
                        <Badge tone="success">Verified</Badge>
                      ) : (
                        <Badge tone="neutral">Not verified</Badge>
                      )}
                    </div>
                  </div>
                </Card>

                <Card className="p-6">
                  <div className="font-semibold text-text-900 mb-3">Contact & Preferences</div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-text-900 mb-1">Phone</label>
                      <input className="w-full border border-border rounded-md px-3 py-2" value={phone} onChange={(e) => setPhone(e.target.value)} />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-text-900 mb-1">Preferred language</label>
                      <select className="w-full border border-border rounded-md px-3 py-2" value={lang} onChange={(e) => setLang(e.target.value as any)}>
                        <option value="en">English</option>
                        <option value="si">සිංහල</option>
                        <option value="ta">தமிழ்</option>
                      </select>
                    </div>
                  </div>
                  <div className="mt-4 flex items-center gap-3">
                    <Button onClick={onSaveBasics}>Save</Button>
                  </div>
                </Card>

                <Card className="p-6">
                  <div className="font-semibold text-text-900 mb-3">Security & Sessions</div>
                  <div className="text-sm text-text-700">Sign-in: Email (passwordless). Session management coming soon.</div>
                </Card>
              </div>

              <div className="lg:col-span-1 space-y-6">
                <Card className="p-6">
                  <div className="font-semibold text-text-900 mb-3">Next appointment</div>
                  <div className="text-sm text-text-600">No upcoming appointments.</div>
                </Card>
                {error && (
                  <Card className="p-3 text-red-700 bg-red-50 border border-red-200">{error}</Card>
                )}
              </div>
            </div>
          )}
        </Container>
      </section>
    </Layout>
  );
};

export default ProfilePage;
