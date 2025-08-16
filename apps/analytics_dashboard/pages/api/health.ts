import type { NextApiRequest, NextApiResponse } from 'next';
import { createClient } from '@supabase/supabase-js';

type HealthResult = {
  ok: boolean;
  env: { hasUrl: boolean; hasAnonKey: boolean };
  checks: Array<{
    table: string;
    ok: boolean;
    count?: number | null;
    error?: string;
  }>;
};

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<HealthResult>
) {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  const env = { hasUrl: !!url, hasAnonKey: !!key };

  if (!url || !key) {
    return res.status(200).json({ ok: false, env, checks: [] });
  }

  const supabase = createClient(url, key);

  const tables = ['services', 'departments', 'bookings', 'slots'];
  const checks: HealthResult['checks'] = [];

  for (const table of tables) {
    try {
      // Try head count first
      const { count, error } = await supabase
        .from(table)
        .select('*', { count: 'exact', head: true });

      if (error) {
        // Fallback to selecting a single row
        const { data, error: err2 } = await supabase
          .from(table)
          .select('*')
          .limit(1);

        if (err2) {
          checks.push({ table, ok: false, count: null, error: err2.message });
        } else {
          checks.push({ table, ok: true, count: (data?.length ?? 0) });
        }
      } else {
        checks.push({ table, ok: true, count: count ?? null });
      }
    } catch (e: any) {
      checks.push({ table, ok: false, count: null, error: e?.message || 'unknown error' });
    }
  }

  const ok = env.hasUrl && env.hasAnonKey && checks.every(c => c.ok);
  res.status(200).json({ ok, env, checks });
}
