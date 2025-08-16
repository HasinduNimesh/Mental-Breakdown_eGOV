import type { NextApiRequest, NextApiResponse } from 'next';
import { createClient } from '@supabase/supabase-js';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') return res.status(405).end();
  const authHeader = req.headers.authorization as string | undefined;
  if (!authHeader) return res.status(401).json({ error: 'UNAUTHENTICATED' });
  const { deviceId } = (req.body ?? {}) as { deviceId?: string };
  if (!deviceId) return res.status(400).json({ error: 'MISSING_DEVICE' });

  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    { global: { headers: { Authorization: authHeader } } }
  );

  const { data: udata, error: uerr } = await supabase.auth.getUser();
  if (uerr || !udata?.user) return res.status(401).json({ error: 'UNAUTHENTICATED' });

  // Read current lock (handle missing table gracefully)
  const { data: lock, error: readErr } = await supabase.from('session_locks').select('*').eq('user_id', udata.user.id).maybeSingle();
  if (readErr && (readErr as any).code === '42P01') {
    return res.status(400).json({ error: 'MISSING_TABLE', message: 'Table session_locks does not exist. Run the latest migration.' });
  }
  if (lock && lock.device_id !== deviceId) {
    return res.status(409).json({ error: 'SESSION_TAKEN', holder: lock.device_id });
  }

  // Upsert lock to this device
  const { error } = await supabase.from('session_locks').upsert({ user_id: udata.user.id, device_id: deviceId, updated_at: new Date().toISOString() }, { onConflict: 'user_id' });
  if (error) return res.status(400).json({ error: error.code || 'LOCK_FAILED', message: error.message });
  return res.status(200).json({ ok: true });
}
