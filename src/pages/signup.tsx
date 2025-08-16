import React from 'react';
import Head from 'next/head';
import Link from 'next/link';
import { useRouter } from 'next/router';
import { supabase } from '@/lib/supabaseClient';
import { Button } from '@/components/ui/Button';
import { Container } from '@/components/ui/Container';
// Icons removed per design – no icon imports needed

export default function SignUpPage() {
  const router = useRouter();
  const [email, setEmail] = React.useState('');
  const [password, setPassword] = React.useState('');
  const [confirmPassword, setConfirmPassword] = React.useState('');
  const [error, setError] = React.useState<string|null>(null);
  const [loading, setLoading] = React.useState(false);
  const [awaitingConfirmation, setAwaitingConfirmation] = React.useState(false);

  async function signUp(e: React.FormEvent) {
    e.preventDefault(); setError(null);
    if (password !== confirmPassword) { setError('Passwords do not match'); return; }
    setLoading(true);
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      // If email confirmations are enabled in Supabase, a confirmation email will be sent
      // and no session will be returned until the user confirms. We set a redirect URL for that case.
      options: { emailRedirectTo: typeof window !== 'undefined' ? window.location.origin : undefined }
    });
    setLoading(false);
    if (error) { setError(error.message); return; }
    // Redirect to onboarding only when a session exists (auto-confirm environments)
    if (data?.session && data.user) {
      router.replace('/onboarding?new=1');
      return;
    }
    // Otherwise, show confirmation-needed state (prevents blank onboarding without a session)
    setAwaitingConfirmation(true);
  }

  return (
    <>
      <Head>
        <title>Sign Up - Sri Lanka Citizen Services</title>
        <meta name="description" content="Create your citizen services account to access government services online" />
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
            <Link href="/signin" className="text-sm text-text-600 hover:text-primary-700">
              Already have an account? <span className="font-medium text-primary-700">Sign in</span>
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
                <h1 className="text-xl sm:text-2xl font-bold">Create your account</h1>
                <p className="text-blue-100 text-sm">Sign up to access government services online</p>
              </div>

              {/* Simple indicator */}
              <div className="flex items-center gap-2 text-sm">
                <div className="w-6 h-6 rounded-full flex items-center justify-center text-xs font-semibold bg-white text-blue-900">1</div>
                <span>Email & Password</span>
              </div>
            </div>

            {/* Form section */}
            <div className="p-6 sm:p-8">
              {!awaitingConfirmation ? (
              <form onSubmit={signUp} className="space-y-4">
                <div className="mb-6">
                  <h2 className="text-lg font-semibold text-text-900 mb-2">Enter your details</h2>
                  <p className="text-sm text-text-600">Create your account with email and a strong password.</p>
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
                    autoComplete="new-password"
                    className="w-full border border-border rounded-md px-3 py-3 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                    placeholder="At least 8 characters"
                    value={password}
                    onChange={e=>setPassword(e.target.value)}
                    required
                    minLength={8}
                  />
                  <p className="text-xs text-text-500 mt-1">Use 8+ characters with a mix of letters, numbers, and symbols.</p>
                </div>

                <div>
                  <label className="block text-sm font-medium text-text-700 mb-2">Confirm password</label>
                  <input
                    type="password"
                    autoComplete="new-password"
                    className="w-full border border-border rounded-md px-3 py-3 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                    placeholder="Re-enter your password"
                    value={confirmPassword}
                    onChange={e=>setConfirmPassword(e.target.value)}
                    required
                    minLength={8}
                  />
                </div>

                {error && (
                  <div className="p-3 bg-red-50 border border-red-200 rounded-md">
                    <p className="text-sm text-red-700">{error}</p>
                  </div>
                )}

                <Button type="submit" disabled={!email || !password || !confirmPassword || loading} className="w-full h-12 text-base">
                  {loading ? 'Creating account…' : 'Create account'}
                </Button>
              </form>
              ) : (
                <div className="space-y-4">
                  <div className="mb-6">
                    <h2 className="text-lg font-semibold text-text-900 mb-2">Confirm your email</h2>
                    <p className="text-sm text-text-600">We sent a confirmation link to <span className="font-medium text-text-900">{email}</span>. Click the link to activate your account, then sign in.</p>
                  </div>
                  <Button href="/signin" className="w-full h-12 text-base">Go to sign in</Button>
                </div>
              )}

              {/* Info section */}
              <div className="mt-8 p-4 bg-blue-50 border border-blue-200 rounded-md">
                <div className="text-sm">
                  <p className="font-medium text-blue-900 mb-1">Secure Registration</p>
                  <p className="text-blue-700">
                    Passwords are encrypted and managed by our identity provider; this app never stores raw passwords.
                  </p>
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
