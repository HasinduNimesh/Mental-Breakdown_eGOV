import type { AppProps } from 'next/app';
import Head from 'next/head';
import { appWithTranslation } from 'next-i18next';
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

export default appWithTranslation(App);

function AuthGate({ children }: { children: React.ReactNode }) {
  const { user, loading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    // Wait for initial auth restoration to finish to avoid flicker
    if (loading || !user) return;
    // Only on certain pages, avoid loops on onboarding
    const skip = router.pathname.startsWith('/onboarding') || router.pathname.startsWith('/api');
    if (skip) return;
    (async () => {
      const { data } = await supabase
        .from('profiles')
        .select('full_name, nic, phone')
        .eq('id', user.id)
        .maybeSingle();
      const incomplete = !data || !data.full_name || !data.nic || !data.phone;
      if (incomplete) {
        router.replace('/onboarding?new=1');
      }
    })();
  }, [user, loading, router]);

  return <>{children}</>;
}
