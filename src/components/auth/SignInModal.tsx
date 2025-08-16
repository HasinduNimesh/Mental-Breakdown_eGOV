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
  const [code, setCode] = React.useState('');
  const [timer, setTimer] = React.useState(0);
  const [loading, setLoading] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);

  React.useEffect(() => {
    if (!open) {
      setEmail(emailPrefill);
      setSent(false);
      setError(null);
    }
  }, [open, emailPrefill]);

  React.useEffect(() => {
    if (!sent || timer <= 0) return;
    const id = setInterval(() => setTimer((t) => (t > 0 ? t - 1 : 0)), 1000);
    return () => clearInterval(id);
  }, [sent, timer]);

  async function sendCodeOrLink() {
    setLoading(true);
    setError(null);
    try {
      // Always send a 6-digit OTP via email (no magic link)
      const { error } = await supabase.auth.signInWithOtp({
        email,
        options: { shouldCreateUser: true },
      });
      if (error) throw error;
      setSent(true);
      // Enforce a 60s cooldown before allowing resend
      setTimer(60);
    } catch (e: any) {
      // Normalize Supabase rate limit message to our 60s policy
      const msg: string = e?.message ?? 'Could not send link. Please try again later.';
      if (/only request this after/i.test(msg)) {
        setTimer((t) => (t < 60 ? 60 : t));
        setError('For security purposes, please wait 60 seconds before requesting a new code.');
      } else {
        setError(msg);
      }
    } finally {
      setLoading(false);
    }
  }

  async function verifyCode() {
    setLoading(true);
    setError(null);
    try {
      const { data, error } = await supabase.auth.verifyOtp({ email, token: code, type: 'email' });
      if (error) throw error;
      if (data?.session) {
        // close on success; post-auth handlers will take over
        onClose();
        afterSignIn?.();
      }
    } catch (e: any) {
      setError(e?.message ?? 'Invalid or expired code.');
    } finally {
      setLoading(false);
    }
  }

  return open ? (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
      <div className="w-full max-w-md rounded-lg bg-white p-4 shadow-xl">
        <div className="text-lg font-semibold mb-1">{titles[context]}</div>
        <p className="text-xs text-text-600 mb-3">No account? You’ll create one when you sign in.</p>
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
            <div className="flex items-center justify-end mb-2 text-xs">
              <a href="/help#tracking" className="text-text-600 hover:underline">Track a booking by code</a>
            </div>
            {error && <div className="text-xs text-red-700 bg-red-50 border border-red-200 rounded p-2 mb-3">{error}</div>}
            <div className="flex gap-2 justify-end">
              <Button variant="outline" onClick={onClose}>Cancel</Button>
              <Button onClick={sendCodeOrLink} disabled={!email || loading}>{loading ? 'Sending…' : 'Send code'}</Button>
            </div>
          </>
        ) : (
          <>
            <div>
              <label className="block text-sm font-medium text-text-900 mb-1">Enter 6-digit code</label>
              <input
                inputMode="numeric"
                pattern="[0-9]*"
                maxLength={6}
                className="w-full border border-border rounded-md px-3 py-2 mb-2 tracking-widest text-center"
                value={code}
                onChange={(e) => setCode(e.target.value.replace(/\D/g, '').slice(0, 6))}
                placeholder="••••••"
              />
              <div className="flex items-center justify-between text-xs text-text-600 mb-3">
                <button className="text-primary-700 hover:underline disabled:text-text-400" onClick={sendCodeOrLink} disabled={timer > 0}>
                  {timer > 0 ? `Resend in ${timer}s` : 'Resend code'}
                </button>
                <span className="text-text-500">Code sent to {email}</span>
              </div>
              {error && <div className="text-xs text-red-700 bg-red-50 border border-red-200 rounded p-2 mb-2">{error}</div>}
              <div className="flex gap-2 justify-end">
                <Button variant="outline" onClick={onClose}>Cancel</Button>
                <Button onClick={verifyCode} disabled={code.length !== 6 || loading}>{loading ? 'Verifying…' : 'Verify & continue'}</Button>
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  ) : null;
};

export default SignInModal;
