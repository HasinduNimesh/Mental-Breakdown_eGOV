import React from 'react';
import Head from 'next/head';
import { useRouter } from 'next/router';
import Link from 'next/link';
import { supabase } from '@/lib/supabaseClient';
import { Button } from '@/components/ui/Button';
import { Container } from '@/components/ui/Container';
import { useAuth } from '@/contexts/AuthContext';
// Icons removed per design – no icon imports needed

export default function SignInPage() {
  const router = useRouter();
  const { user } = useAuth();
  const [email, setEmail] = React.useState('');
  const [password, setPassword] = React.useState('');
  const [error, setError] = React.useState<string|null>(null);
  const [loading, setLoading] = React.useState(false);
  const [sent, setSent] = React.useState(false);

  // Do not auto-redirect when user becomes authenticated here; we enforce a second step via email
  async function signIn(e: React.FormEvent) {
    e.preventDefault(); setError(null); setLoading(true);
    try {
      // Step 1: verify password
      const pwRes = await supabase.auth.signInWithPassword({ email, password });
      if (pwRes.error) throw pwRes.error;

      // Step 2: send magic link and immediately sign out (enforce second factor)
      const redirectTo = typeof window !== 'undefined'
        ? `${window.location.origin}/auth/callback${router.query.next ? `?next=${encodeURIComponent(String(router.query.next))}` : ''}`
        : undefined;
  const otpRes = await supabase.auth.signInWithOtp({
        email,
        options: { emailRedirectTo: redirectTo, shouldCreateUser: false },
      });
      if (otpRes.error) throw otpRes.error;

      // Invalidate the session so access is only granted after clicking the link
      await supabase.auth.signOut();
  // Navigate to verification screen
  router.replace(`/signin/verify?email=${encodeURIComponent(email)}`);
  return;
    } catch (err: any) {
      setError(err?.message || 'Sign-in failed');
    } finally {
      setLoading(false);
    }
  }

  return (
    <>
      <Head>
        <title>Sign In - Sri Lanka Citizen Services</title>
        <meta name="description" content="Sign in to your citizen services account to access government services online" />
      </Head>
      
      {/* Header with branding */}
      <div className="bg-white border-b border-border">
        <Container className="max-w-[1200px] px-6">
          <div className="flex items-center justify-between h-16">
            <Link href="/" className="flex items-center gap-3">
              <img src="/logo.svg" alt="Sri Lanka Coat of Arms" className="h-9 w-auto" />
              <div className="leading-tight">
                <div className="text-[14px] font-semibold text-[#163B8F]">Government of Sri Lanka</div>
                <div className="text-[12px] font-medium text-[#4B5563]">Citizen Services Portal</div>
              </div>
            </Link>
            <Link href="/signup" className="text-sm text-text-600 hover:text-primary-700">
              Need an account? <span className="font-medium text-primary-700">Sign up</span>
            </Link>
          </div>
        </Container>
      </div>

      {/* Main content */}
      <div className="min-h-screen bg-bg-100">
        <Container className="max-w-lg py-12 sm:py-16">
          <div className="bg-white border border-border rounded-lg shadow-card overflow-hidden">
              {/* Header section */}
            <div className="bg-gradient-to-r from-blue-900 to-blue-800 text-white p-6 sm:p-8">
                <div className="mb-4">
                  <h1 className="text-xl sm:text-2xl font-bold">Welcome Back</h1>
                  <p className="text-blue-100 text-sm">Sign in to access your government services</p>
                </div>
              
              {/* Simple indicator */}
              <div className="flex items-center gap-2 text-sm">
                <div className="w-6 h-6 rounded-full flex items-center justify-center text-xs font-semibold bg-white text-blue-900">1</div>
                <span>Two-step sign-in</span>
              </div>
            </div>

            {/* Form section */}
            <div className="p-6 sm:p-8">
              {!sent ? (
                <form onSubmit={signIn} className="space-y-4">
                  <div className="mb-6">
                    <h2 className="text-lg font-semibold text-text-900 mb-2">Two-step sign in</h2>
                    <p className="text-sm text-text-600">Enter your email and password to request a secure sign-in email. You’ll complete sign-in from your inbox.</p>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-text-700 mb-2">Email address</label>
                    <input
                      type="email"
                      autoComplete="email"
                      className="w-full border border-border rounded-md px-3 py-3 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                      placeholder="your.email@example.com"
                      value={email}
                      onChange={e=>setEmail(e.target.value)}
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-text-700 mb-2">Password</label>
                    <input
                      type="password"
                      autoComplete="current-password"
                      className="w-full border border-border rounded-md px-3 py-3 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                      placeholder="Your password"
                      value={password}
                      onChange={e=>setPassword(e.target.value)}
                      required
                    />
                  </div>

                  {error && (
                    <div className="p-3 bg-red-50 border border-red-200 rounded-md">
                      <p className="text-sm text-red-700">{error}</p>
                    </div>
                  )}

                  <Button type="submit" disabled={!email || !password || loading} className="w-full h-12 text-base">
                    {loading ? 'Verifying…' : 'Continue'}
                  </Button>
                </form>
              ) : (
                <div className="space-y-4">
                  <div className="mb-2">
                    <h2 className="text-lg font-semibold text-text-900 mb-2">Continue in your email</h2>
                    <p className="text-sm text-text-600">A sign-in email has been sent to <span className="font-medium text-text-900">{email}</span>. Open it on this device to finish signing in.</p>
                  </div>
                  <Button onClick={(e)=>{ e.preventDefault(); setSent(false); }} variant="outline" className="w-full h-12 text-base">Use a different email</Button>
                </div>
              )}
              
              {/* Info section */}
              <div className="mt-8 p-4 bg-blue-50 border border-blue-200 rounded-md">
                <div className="text-sm">
                  <p className="font-medium text-blue-900 mb-1">Secure Access</p>
                  <p className="text-blue-700">This account requires two steps: 1) verify your password, 2) confirm using the email we sent. This helps prevent unauthorized access.</p>
                </div>
              </div>
            </div>
          </div>
          
          {/* Footer links */}
          <div className="mt-8 text-center">
            <div className="flex items-center justify-center gap-6 text-sm text-text-600">
              <Link href="/help" className="hover:text-primary-700">Help Center</Link>
              <span>•</span>
              <Link href="/contact" className="hover:text-primary-700">Contact Support</Link>
              <span>•</span>
              <Link href="/privacy" className="hover:text-primary-700">Privacy Policy</Link>
            </div>
          </div>
        </Container>
      </div>
    </>
  );
}
