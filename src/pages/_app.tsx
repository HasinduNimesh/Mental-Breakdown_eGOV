import type { AppProps } from 'next/app';
import Head from 'next/head';
import { appWithTranslation } from 'next-i18next';
// eslint-disable-next-line @typescript-eslint/no-var-requires
const nextI18NextConfig = require('../../next-i18next.config.js');
import '../styles/globals.css';
import { AuthProvider, useAuth } from '@/contexts/AuthContext';
import { useEffect } from 'react';
import { useRouter } from 'next/router';
import { supabase } from '@/lib/supabaseClient';

function App({ Component, pageProps }: AppProps) {
  return (
    
    <>
      <Head>
        <meta name="viewport" content="width=device-width, initial-scale=1, shrink-to-fit=no" />
      </Head>
      <AuthProvider>
        <AuthGate>
          <Component {...pageProps} />
        </AuthGate>
      </AuthProvider>
    </>
  );
}

export default appWithTranslation(App, nextI18NextConfig);

function AuthGate({ children }: { children: React.ReactNode }) {
  const { user, loading } = useAuth();
  const router = useRouter();

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
    // Only on certain pages, avoid loops on onboarding
    const skip = router.pathname.startsWith('/onboarding') || router.pathname.startsWith('/api');
    if (skip) return;
    (async () => {
      const { data, error } = await supabase
        .from('profiles')
        .select('full_name, nic, phone')
        .eq('id', user.id)
        .maybeSingle();
      if (error && (error.code === '42501' || error.code === 'PGRST302' || error.message?.toLowerCase().includes('permission'))) {
        // Stale/invalid session cookie: force clear by reloading root
        router.replace('/');
        return;
      }
      const incomplete = !data || !data.full_name || !data.nic || !data.phone;
      if (incomplete) {
        router.replace('/onboarding?new=1');
      }
    })();
  }, [user, loading, router]);

  return <>{children}</>;
}
