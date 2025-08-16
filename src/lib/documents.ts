import { supabase } from '@/lib/supabaseClient';

export type ProfileDoc = {
  id: number;
  doc_type: string | null;
  label: string | null;
  object_key: string;
  original_name: string | null;
  mime_type: string | null;
  size_bytes: number | null;
  uploaded_at: string;
};

export async function listProfileDocuments(): Promise<ProfileDoc[]> {
  const { data, error } = await supabase
    .from('profile_documents')
    .select('*')
    .order('uploaded_at', { ascending: false });
  if (error) throw error;
  return data || [];
}

export async function uploadProfileDocument(file: File, docType?: string, label?: string): Promise<number> {
  const user = (await supabase.auth.getUser()).data.user;
  if (!user) throw new Error('Not signed in');
  const ext = file.name.split('.').pop() || 'bin';
  const key = `${user.id}/${Date.now()}-${Math.random().toString(36).slice(2)}.${ext}`;
  const up = await supabase.storage.from('user-docs').upload(key, file, {
    cacheControl: '3600',
    upsert: false,
    contentType: file.type || undefined,
  });
  if (up.error) throw up.error;
  const ins = await supabase
    .from('profile_documents')
    .insert({ object_key: key, original_name: file.name, mime_type: file.type || null, size_bytes: file.size, doc_type: docType || null, label: label || null })
    .select('id')
    .single();
  if (ins.error) throw ins.error;
  return ins.data.id as number;
}

export async function removeProfileDocument(id: number) {
  // Optional: fetch key to also delete from storage
  const { data, error } = await supabase.from('profile_documents').select('object_key').eq('id', id).single();
  if (error) throw error;
  const key = data.object_key as string;
  await supabase.from('profile_documents').delete().eq('id', id);
  await supabase.storage.from('user-docs').remove([key]);
}
