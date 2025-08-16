import React from 'react';
import Head from 'next/head';
import { useRouter } from 'next/router';
import { Button } from '@/components/ui/Button';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/lib/supabaseClient';

export default function OnboardingPage() {
  const { user } = useAuth();
  const router = useRouter();
  const [fullName, setFullName] = React.useState('');
  const [nic, setNic] = React.useState('');
  const [phone, setPhone] = React.useState('');
  const [preferredLanguage, setPreferredLanguage] = React.useState('en');
  const [loading, setLoading] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);
  const isNew = router.query.new === '1';

  React.useEffect(() => {
    if (!user) return;
    (async () => {
  const { data } = await supabase.from('profiles').select('full_name, nic, phone, preferred_language').eq('id', user.id).maybeSingle();
  if (data && data.full_name && data.nic && data.phone) {
        router.replace('/appointments');
      }
    })();
  }, [user, router]);

  async function submit() {
    if (!user) return;
    setLoading(true);
    setError(null);
    try {
      const { data: { session } } = await supabase.auth.getSession();
      const ac = new AbortController();
      const t = setTimeout(() => ac.abort(), 15000);
      const resp = await fetch('/api/profile-upsert', {
        method: 'POST',
        headers: {
          'content-type': 'application/json',
          ...(session?.access_token ? { Authorization: `Bearer ${session.access_token}` } : {}),
        },
  body: JSON.stringify({ full_name: fullName, nic, phone, preferred_language: preferredLanguage }),
        signal: ac.signal,
      }).catch((e) => { throw new Error(e?.name === 'AbortError' ? 'Network timeout' : (e?.message || 'Network error')); });
      clearTimeout(t);
      if (!resp.ok) {
        // Fallback to direct function invoke (CORS enabled in function)
        const text = await resp.text().catch(() => '');
  const fallback = await supabase.functions.invoke('profile-upsert', { body: { full_name: fullName, nic, phone, preferred_language: preferredLanguage } });
        if (fallback.error) throw new Error(fallback.error.message || text || 'Failed to save');
      }
      router.replace('/appointments');
    } catch (e: any) {
      setError(e?.message ?? 'Something went wrong');
    } finally {
      setLoading(false);
    }
  }

  if (!user) return null;

  return (
    <>
      <Head><title>Onboarding</title></Head>
      <div className="min-h-screen bg-bg-100 flex items-center justify-center p-4">
        <div className="w-full max-w-md bg-white border border-border rounded-lg p-5 shadow-card">
          <h1 className="text-xl font-semibold mb-1">Welcome</h1>
          <p className="text-sm text-text-600 mb-4">
            {isNew ? 'We didn\'t find an existing account for this email. Create your account to continue.' : 'Complete your profile to continue.'}
          </p>
          <label className="block text-sm font-medium mb-1">Full name</label>
          <input className="w-full border border-border rounded-md px-3 py-2 mb-3" value={fullName} onChange={(e) => setFullName(e.target.value)} />
          <label className="block text-sm font-medium mb-1">NIC</label>
          <input className="w-full border border-border rounded-md px-3 py-2 mb-3" value={nic} onChange={(e) => setNic(e.target.value)} placeholder="NIC number" />
          <label className="block text-sm font-medium mb-1">Preferred language</label>
          <select className="w-full border border-border rounded-md px-3 py-2 mb-3" value={preferredLanguage} onChange={(e) => setPreferredLanguage(e.target.value)}>
            <option value="en">English</option>
            <option value="si">සිංහල</option>
            <option value="ta">தமிழ்</option>
          </select>
          <label className="block text-sm font-medium mb-1">Phone (for reminders)</label>
          <input className="w-full border border-border rounded-md px-3 py-2 mb-3" value={phone} onChange={(e) => setPhone(e.target.value)} placeholder="07X-XXXXXXX" />
          {error && <div className="text-xs text-red-700 bg-red-50 border border-red-200 rounded p-2 mb-3">{error}</div>}
          <div className="flex justify-end">
            <Button onClick={submit} disabled={!fullName || !nic || !phone || loading}>{loading ? 'Saving…' : 'Create account & continue'}</Button>
          </div>
        </div>
      </div>
    </>
  );
}
