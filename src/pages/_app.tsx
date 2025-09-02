import type { AppProps } from 'next/app';
import Head from 'next/head';
import { appWithTranslation } from 'next-i18next';
// eslint-disable-next-line @typescript-eslint/no-var-requires
const nextI18NextConfig = require('../../next-i18next.config.js');
import '../styles/globals.css';
import { AuthProvider, useAuth } from '@/contexts/AuthContext';
import React, { useEffect } from 'react';
import { useRouter } from 'next/router';
import { supabase } from '@/lib/supabaseClient';
import { Rubik, Roboto } from 'next/font/google';

const rubik = Rubik({ subsets: ['latin'], weight: ['400','500','600','700'], display: 'swap', variable: '--font-rubik' });
const roboto = Roboto({ subsets: ['latin'], weight: ['400','500','700'], display: 'swap', variable: '--font-roboto' });

function App({ Component, pageProps }: AppProps) {
  return (
    
    <>
      <Head>
        <meta name="viewport" content="width=device-width, initial-scale=1, viewport-fit=cover" />
      </Head>
      <AuthProvider>
        <AuthGate>
          <div className={`${rubik.variable} ${roboto.variable}`}>
            <Component {...pageProps} />
          </div>
        </AuthGate>
      </AuthProvider>
    </>
  );
}

export default appWithTranslation(App, nextI18NextConfig);

function AuthGate({ children }: { children: React.ReactNode }) {
  const { user, loading } = useAuth();
  const router = useRouter();
  const didRedirect = React.useRef(false);

  useEffect(() => {
    // Wait for initial auth restoration to finish to avoid flicker
    if (loading) return;
    // If signed out on a protected route, go home
    const protectedPaths = ['/appointments', '/book', '/documents', '/profile'];
    if (!user && protectedPaths.some(p => router.pathname.startsWith(p))) {
      router.replace('/');
      return;
    }
    if (!user) return;
    // Only check profile completeness on specific routes; skip home and onboarding/api to avoid loops
    const shouldCheck = ['/appointments', '/book', '/documents', '/profile', '/services']
      .some(p => router.pathname.startsWith(p));
    if (!shouldCheck || router.pathname.startsWith('/onboarding') || router.pathname.startsWith('/api')) return;
    (async () => {
      const { data, error } = await supabase
        .from('profiles')
        .select('full_name, nic, phone')
        .eq('id', user.id)
        .maybeSingle();
      // If permissions/RLS block reads, avoid bouncing the user. Treat as incomplete and allow navigation.
      if (error && (error.code === '42501' || error.code === 'PGRST302' || error.message?.toLowerCase().includes('permission'))) {
        return;
      }
      const incomplete = !data || !data.full_name || !data.nic || !data.phone;
      if (incomplete && !didRedirect.current && !router.pathname.startsWith('/onboarding')) {
        didRedirect.current = true;
        router.replace('/onboarding?new=1');
      }
    })();
  }, [user, loading, router]);

  return <>{children}</>;
}
