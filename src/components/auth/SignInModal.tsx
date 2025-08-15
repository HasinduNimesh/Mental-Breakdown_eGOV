import React from 'react';
import { supabase } from '@/lib/supabaseClient';
import { Button } from '@/components/ui/Button';

type Props = {
  open: boolean;
  onClose: () => void;
  afterSignIn?: () => void;
  emailPrefill?: string;
  context?: 'generic' | 'review' | 'appointments' | 'upload';
};

const titles: Record<NonNullable<Props['context']>, string> = {
  generic: 'Sign in to continue',
  review: 'Sign in to confirm your booking',
  appointments: 'Sign in to view your appointments',
  upload: 'Sign in to upload your documents',
};

export const SignInModal: React.FC<Props> = ({ open, onClose, afterSignIn, emailPrefill = '', context = 'generic' }) => {
  const [email, setEmail] = React.useState(emailPrefill);
  const [sent, setSent] = React.useState(false);
  const [loading, setLoading] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);

  React.useEffect(() => {
    if (!open) {
      setEmail(emailPrefill);
      setSent(false);
      setError(null);
    }
  }, [open, emailPrefill]);

  async function sendLink() {
    setLoading(true);
    setError(null);
    try {
      const redirectTo = typeof window !== 'undefined' ? window.location.origin : undefined;
      const { error } = await supabase.auth.signInWithOtp({ email, options: { emailRedirectTo: redirectTo } });
      if (error) throw error;
      setSent(true);
    } catch (e: any) {
      setError(e?.message ?? 'Could not send link. Please try again later.');
    } finally {
      setLoading(false);
    }
  }

  return open ? (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
      <div className="w-full max-w-md rounded-lg bg-white p-4 shadow-xl">
        <div className="text-lg font-semibold mb-2">{titles[context]}</div>
        <p className="text-sm text-text-600 mb-4">We’ll email you a secure link. No password needed.</p>
        {!sent ? (
          <>
            <label className="block text-sm font-medium text-text-900 mb-1">Email</label>
            <input
              type="email"
              className="w-full border border-border rounded-md px-3 py-2 mb-3"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="you@example.com"
            />
            {error && <div className="text-xs text-red-700 bg-red-50 border border-red-200 rounded p-2 mb-3">{error}</div>}
            <div className="flex gap-2 justify-end">
              <Button variant="outline" onClick={onClose}>Cancel</Button>
              <Button onClick={sendLink} disabled={!email || loading}>{loading ? 'Sending…' : 'Send sign-in link'}</Button>
            </div>
          </>
        ) : (
          <>
            <div className="text-sm text-text-700">Check {email} for a magic link to sign in. You can close this window.</div>
            <div className="mt-4 flex justify-end">
              <Button onClick={() => { onClose(); afterSignIn?.(); }}>Close</Button>
            </div>
          </>
        )}
      </div>
    </div>
  ) : null;
};

export default SignInModal;
