import React from 'react';
import Head from 'next/head';
import { useRouter } from 'next/router';
import Link from 'next/link';
import { supabase } from '@/lib/supabaseClient';
import { Button } from '@/components/ui/Button';
import { Container } from '@/components/ui/Container';
import { useAuth } from '@/contexts/AuthContext';
import { EnvelopeIcon, ShieldCheckIcon, ArrowRightOnRectangleIcon } from '@heroicons/react/24/outline';

export default function SignInPage() {
  const router = useRouter();
  const { user } = useAuth();
  const [email, setEmail] = React.useState('');
  const [otp, setOtp] = React.useState('');
  const [phase, setPhase] = React.useState<'request'|'verify'>('request');
  const [error, setError] = React.useState<string|null>(null);
  const [timer, setTimer] = React.useState(0);

  React.useEffect(() => { if (user) router.replace('/'); }, [user, router]);
  React.useEffect(() => {
    if (timer <= 0) return; const id = setInterval(() => setTimer(t=>t-1), 1000); return () => clearInterval(id);
  }, [timer]);

  async function requestOtp(e: React.FormEvent) {
    e.preventDefault(); setError(null);
    const { error } = await supabase.auth.signInWithOtp({ email, options: { shouldCreateUser: false } });
    if (error) { setError(error.message); return; }
    setPhase('verify'); setTimer(60);
  }
  async function verifyOtp(e: React.FormEvent) {
    e.preventDefault(); setError(null);
    const { error } = await supabase.auth.verifyOtp({ email, token: otp, type: 'email' });
    if (error) { setError(error.message); return; }
    router.replace('/');
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
              <div className="flex items-center gap-3 mb-4">
                <div className="w-12 h-12 bg-white/20 rounded-lg flex items-center justify-center">
                  <ArrowRightOnRectangleIcon className="w-6 h-6" />
                </div>
                <div>
                  <h1 className="text-xl sm:text-2xl font-bold">Welcome Back</h1>
                  <p className="text-blue-100 text-sm">Sign in to access your government services</p>
                </div>
              </div>
              
              {/* Progress indicator */}
              <div className="flex items-center gap-4 text-sm">
                <div className={`flex items-center gap-2 ${phase === 'request' ? 'text-white' : 'text-blue-200'}`}>
                  <div className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-semibold ${phase === 'request' ? 'bg-white text-blue-900' : 'bg-blue-700'}`}>1</div>
                  Email
                </div>
                <div className="flex-1 h-px bg-blue-700"></div>
                <div className={`flex items-center gap-2 ${phase === 'verify' ? 'text-white' : 'text-blue-200'}`}>
                  <div className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-semibold ${phase === 'verify' ? 'bg-white text-blue-900' : 'bg-blue-700'}`}>2</div>
                  Verify
                </div>
              </div>
            </div>

            {/* Form section */}
            <div className="p-6 sm:p-8">
              {phase === 'request' ? (
                <form onSubmit={requestOtp} className="space-y-4">
                  <div className="mb-6">
                    <h2 className="text-lg font-semibold text-text-900 mb-2">Enter your email address</h2>
                    <p className="text-sm text-text-600">We'll send you a secure verification code to sign in.</p>
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-text-700 mb-2">Email address</label>
                    <div className="relative">
                      <input 
                        type="email" 
                        className="w-full border border-border rounded-md px-3 py-3 pl-10 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500" 
                        placeholder="your.email@example.com"
                        value={email} 
                        onChange={e=>setEmail(e.target.value)} 
                        required 
                      />
                      <EnvelopeIcon className="absolute left-3 top-3.5 w-4 h-4 text-text-400" />
                    </div>
                  </div>
                  
                  {error && (
                    <div className="p-3 bg-red-50 border border-red-200 rounded-md">
                      <p className="text-sm text-red-700">{error}</p>
                    </div>
                  )}
                  
                  <Button type="submit" disabled={!email} className="w-full h-12 text-base">
                    Send verification code
                  </Button>
                </form>
              ) : (
                <form onSubmit={verifyOtp} className="space-y-4">
                  <div className="mb-6">
                    <h2 className="text-lg font-semibold text-text-900 mb-2">Enter verification code</h2>
                    <p className="text-sm text-text-600">
                      We sent a 6-digit code to <span className="font-medium text-text-900">{email}</span>
                    </p>
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-text-700 mb-2">Verification code</label>
                    <div className="relative">
                      <input 
                        inputMode="numeric" 
                        pattern="[0-9]*" 
                        className="w-full border border-border rounded-md px-3 py-3 pl-10 text-center text-lg tracking-widest focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500" 
                        placeholder="000000"
                        maxLength={6}
                        value={otp} 
                        onChange={e=>setOtp(e.target.value)} 
                        required 
                      />
                      <ShieldCheckIcon className="absolute left-3 top-3.5 w-4 h-4 text-text-400" />
                    </div>
                  </div>
                  
                  {error && (
                    <div className="p-3 bg-red-50 border border-red-200 rounded-md">
                      <p className="text-sm text-red-700">{error}</p>
                    </div>
                  )}
                  
                  <div className="space-y-3">
                    <Button type="submit" disabled={!otp} className="w-full h-12 text-base">
                      Sign in to your account
                    </Button>
                    <Button 
                      type="button" 
                      variant="outline" 
                      disabled={timer>0} 
                      onClick={requestOtp}
                      className="w-full h-12 text-base"
                    >
                      {timer>0 ? `Resend code in ${timer}s` : 'Resend verification code'}
                    </Button>
                  </div>
                </form>
              )}
              
              {/* Info section */}
              <div className="mt-8 p-4 bg-blue-50 border border-blue-200 rounded-md">
                <div className="flex gap-3">
                  <ShieldCheckIcon className="w-5 h-5 text-blue-600 mt-0.5 flex-shrink-0" />
                  <div className="text-sm">
                    <p className="font-medium text-blue-900 mb-1">Secure Access</p>
                    <p className="text-blue-700">
                      Your email is your secure gateway to all government services. 
                      We use verification codes to keep your account safe.
                    </p>
                  </div>
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
