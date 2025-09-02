import { supabase } from '@/lib/supabaseClient';
import { track } from '@/lib/analytics';

export type Profile = {
  id: string;
  full_name?: string | null;
  nic?: string | null;
  dob?: string | null;
  phone?: string | null;
  email?: string | null;
  address_line1?: string | null;
  address_line2?: string | null;
  district?: string | null;
  postal_code?: string | null;
  preferred_language?: 'en' | 'si' | 'ta' | null;
  verified?: boolean | null;
  selfie_key?: string | null;
  updated_at?: string;
};

export async function getMyProfile() {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return null;
  const { data, error } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', user.id)
    .maybeSingle();
  if (error) return null;
  return data as Profile | null;
}

export async function upsertProfile(fields: Partial<Profile>) {
  const { data: { session } } = await supabase.auth.getSession();
  const resp = await fetch('/api/profile-upsert', {
    method: 'POST',
    headers: {
      'content-type': 'application/json',
      ...(session?.access_token ? { Authorization: `Bearer ${session.access_token}` } : {}),
    },
    body: JSON.stringify(fields),
  });
  if (!resp.ok) {
    const text = await resp.text().catch(() => '');
    throw new Error(text || 'Failed to update profile');
  }
  track('filter_change', { kind: 'profile_updated', fields: Object.keys(fields) });
  return (await resp.json()) as { ok: true };
}

export async function listSavedForms() {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return [] as Array<{service_key: string; updated_at: string}>;
  const { data, error } = await supabase
    .from('saved_forms')
    .select('service_key, updated_at')
    .eq('user_id', user.id)
    .order('updated_at', { ascending: false });
  if (error) return [] as Array<{service_key: string; updated_at: string}>;
  return data as Array<{service_key: string; updated_at: string}>;
}

export async function getSavedForm(service_key: string) {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return null;
  const { data } = await supabase
    .from('saved_forms')
    .select('payload')
    .eq('user_id', user.id)
    .eq('service_key', service_key)
    .maybeSingle();
  return (data?.payload as any) ?? null;
}

export async function upsertSavedForm(service_key: string, payload: any) {
  const { error, data } = await supabase.functions.invoke('saved-form-upsert', { body: { service_key, payload } });
  if (error) throw error;
  track('filter_change', { kind: 'saved_form_upsert', service_key });
  return data as { ok: true };
}

export async function presignProfilePhoto(contentType: string) {
  const { error, data } = await supabase.functions.invoke('profile-photo-presign', { body: { contentType } });
  if (error) throw error;
  return data as { url: string; object_key: string };
}

export async function completeProfilePhoto(object_key: string, hash: string | null, device_info?: any) {
  const { error, data } = await supabase.functions.invoke('profile-photo-complete', { body: { object_key, hash, device_info } });
  if (error) throw error;
  track('filter_change', { kind: 'profile_photo_updated' });
  return data as { ok: true };
}

export async function getCurrentPhotoSignedUrl(selfie_key: string | null) {
  if (!selfie_key) return null;
  try {
    const { data, error } = await supabase.storage.from('profile-photos').createSignedUrl(selfie_key, 60);
    if (error) return null;
    return data?.signedUrl ?? null;
  } catch {
    return null;
  }
}
