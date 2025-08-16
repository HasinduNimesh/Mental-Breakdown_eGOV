import { useEffect } from 'react';
import { useRouter } from 'next/router';
import Head from 'next/head';
import { supabase } from '@/lib/supabaseClient';

export default function AuthCallbackPage() {
  const router = useRouter();

  useEffect(() => {
    const doExchange = async () => {
      try {
        const params = new URLSearchParams(window.location.search);
        const code = params.get('code');
        const next = params.get('next') || '/';
        if (code) {
          const { error } = await supabase.auth.exchangeCodeForSession(code);
          if (error) console.error('exchangeCodeForSession error', error);
        }
        router.replace(next.startsWith('/') ? next : '/');
      } catch (e) {
        console.error(e);
        router.replace('/');
      }
    };
    doExchange();
  }, [router]);

  return (
    <>
      <Head><title>Signing you in…</title></Head>
      <div className="min-h-screen flex items-center justify-center">
        <p className="text-sm text-text-600">Completing sign-in…</p>
      </div>
    </>
  );
}
