import type { NextApiRequest, NextApiResponse } from 'next';
import { createClient } from '@supabase/supabase-js';
// Server API: tries Edge Function first; if unavailable, falls back to direct upsert via RLS.

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') return res.status(405).end();
  try {
  const authHeader = req.headers.authorization as string | undefined;
  if (!authHeader) return res.status(401).json({ error: 'UNAUTHENTICATED' });
    const resp = await fetch(`${process.env.NEXT_PUBLIC_SUPABASE_URL}/functions/v1/profile-upsert`, {
      method: 'POST',
      headers: {
        'content-type': 'application/json',
    Authorization: authHeader,
      },
      body: JSON.stringify(req.body),
    });
    if (resp.ok) {
      const json = await resp.json().catch(() => ({ ok: true }));
      return res.status(resp.status).json(json);
    }

    // Fallback: direct upsert using RLS with the caller's Authorization
    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      { global: { headers: { Authorization: authHeader } } }
    );

    // Get user id from the token
    const { data: udata, error: uerr } = await supabase.auth.getUser();
    if (uerr || !udata?.user) return res.status(401).json({ error: 'UNAUTHENTICATED' });

    const allowed = [
      'full_name','nic','dob','phone','email','address_line1','address_line2','district','postal_code','preferred_language'
    ];
    const update: Record<string, unknown> = {};
    for (const k of allowed) if (k in (req.body ?? {})) update[k] = (req.body as any)[k];

    const { error } = await supabase.from('profiles').upsert({ id: udata.user.id, ...update }, { onConflict: 'id' });
    if (error) {
      if ((error as any).code === '42P01') {
        return res.status(400).json({ error: 'MISSING_TABLE', message: 'Supabase table "profiles" is missing. Run the migration to create it.' });
      }
      return res.status(400).json({ error: error.code || 'UPSERT_FAILED', message: error.message });
    }
    return res.status(200).json({ ok: true, via: 'direct' });
  } catch (e: any) {
    return res.status(500).json({ error: 'SERVER_ERROR', message: e?.message || 'Unknown error' });
  }
}
