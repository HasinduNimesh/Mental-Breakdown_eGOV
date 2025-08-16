-- Profile documents for reuse across bookings

create table if not exists public.profile_documents (
  id bigserial primary key,
  user_id uuid not null references public.profiles(id) on delete cascade,
  doc_type text, -- e.g., 'nic-front','nic-back','birth-certificate','photo','other'
  label text,
  object_key text not null,
  original_name text,
  mime_type text,
  size_bytes bigint,
  uploaded_at timestamptz not null default now()
);

alter table public.profile_documents
  alter column user_id set default auth.uid();

create index if not exists profile_documents_user_idx on public.profile_documents(user_id);
create index if not exists profile_documents_type_idx on public.profile_documents(doc_type);

alter table public.profile_documents enable row level security;

drop policy if exists "profile_docs_owner_select" on public.profile_documents;
create policy "profile_docs_owner_select" on public.profile_documents
  for select using (user_id = auth.uid());

drop policy if exists "profile_docs_owner_insert" on public.profile_documents;
create policy "profile_docs_owner_insert" on public.profile_documents
  for insert with check (user_id = auth.uid());

drop policy if exists "profile_docs_owner_update" on public.profile_documents;
create policy "profile_docs_owner_update" on public.profile_documents
  for update using (user_id = auth.uid()) with check (user_id = auth.uid());

drop policy if exists "profile_docs_owner_delete" on public.profile_documents;
create policy "profile_docs_owner_delete" on public.profile_documents
  for delete using (user_id = auth.uid());

-- Private bucket for reusable profile documents
insert into storage.buckets (id, name, public)
values ('user-docs', 'user-docs', false)
on conflict (id) do nothing;

-- Storage policies scoped to user's own folder
-- Note: storage.objects is shared; policies are additive and filtered by bucket_id

drop policy if exists "userdocs_select_own" on storage.objects;
create policy "userdocs_select_own" on storage.objects
  for select to authenticated
  using (
    bucket_id = 'user-docs'
    and split_part(name, '/', 1) = auth.uid()::text
  );

drop policy if exists "userdocs_insert_own" on storage.objects;
create policy "userdocs_insert_own" on storage.objects
  for insert to authenticated
  with check (
    bucket_id = 'user-docs'
    and split_part(name, '/', 1) = auth.uid()::text
  );

drop policy if exists "userdocs_delete_own" on storage.objects;
create policy "userdocs_delete_own" on storage.objects
  for delete to authenticated
  using (
    bucket_id = 'user-docs'
    and split_part(name, '/', 1) = auth.uid()::text
  );
