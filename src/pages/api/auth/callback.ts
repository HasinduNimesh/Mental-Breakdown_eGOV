import type { NextApiRequest, NextApiResponse } from 'next';
import { createServerClient } from '@supabase/ssr';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const code = (req.query.code as string) || '';
  const next = (req.query.next as string) || '/';
  const redirectTo = next.startsWith('/') ? next : '/';

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        get(name) {
          return req.cookies[name];
        },
        set(name, value, options) {
          // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
          res.setHeader('Set-Cookie', `${name}=${value}; Path=${options.path ?? '/'}; HttpOnly; SameSite=Lax; Secure; Max-Age=${options.maxAge ?? 60 * 60 * 24 * 14}`);
        },
        remove(name, options) {
          res.setHeader('Set-Cookie', `${name}=; Path=${options.path ?? '/'}; Max-Age=0`);
        },
      },
    }
  );

  try {
    if (code) {
      const { error } = await supabase.auth.exchangeCodeForSession(code);
      if (error) {
        console.error('exchangeCodeForSession error', error);
      }
    }
  } catch (e) {
    console.error('Auth callback error', e);
  }

  res.writeHead(302, { Location: redirectTo });
  res.end();
}
