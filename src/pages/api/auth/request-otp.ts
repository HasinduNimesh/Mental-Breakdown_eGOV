import type { NextApiRequest, NextApiResponse } from 'next';
import { createServerClient } from '@supabase/ssr';

// Very simple in-memory rate limiting for dev/testing purposes
const buckets = new Map<string, { count: number; reset: number }>();
function rateLimit(key: string, limit: number, windowMs: number) {
  const now = Date.now();
  const entry = buckets.get(key);
  if (!entry || entry.reset < now) {
    buckets.set(key, { count: 1, reset: now + windowMs });
    return { ok: true };
  }
  if (entry.count >= limit) return { ok: false, retryAfter: Math.ceil((entry.reset - now) / 1000) };
  entry.count++;
  return { ok: true };
}

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') return res.status(405).end();
  const { email, next = '/' } = req.body ?? {};
  if (!email || typeof email !== 'string') return res.status(400).json({ ok: true });

  // Basic rate limits: 5/min, 10/hour per email + IP
  const ip = (req.headers['x-forwarded-for'] as string)?.split(',')[0]?.trim() || req.socket.remoteAddress || 'unknown';
  const key1 = `min:${email}:${ip}`;
  const key2 = `hr:${email}:${ip}`;
  if (!rateLimit(key1, 5, 60_000).ok) return res.status(200).json({ ok: true });
  if (!rateLimit(key2, 10, 60 * 60_000).ok) return res.status(200).json({ ok: true });

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        get(name) {
          return req.cookies[name];
        },
        set() {/* no-op for OTP request */},
        remove() {/* no-op */},
      },
    }
  );

  // Enumeration-safe response: always 200 + ok: true
  try {
    const { error } = await supabase.auth.signInWithOtp({
      email,
      options: { emailRedirectTo: `${req.headers.origin || ''}/api/auth/callback?next=${encodeURIComponent(next)}` },
    });
    if (error) console.warn('request-otp error', error.message);
  } catch (e) {
    console.warn('request-otp exception', (e as any)?.message);
  }

  res.status(200).json({ ok: true });
}
