-- Appointment documents: metadata table and storage bucket/policies (idempotent)

-- Table to track uploaded appointment documents
create table if not exists public.appointment_documents (
  id bigserial primary key,
  user_id uuid not null references public.profiles(id) on delete cascade,
  booking_code text not null,
  object_key text not null,
  original_name text,
  mime_type text,
  size_bytes bigint,
  status text not null default 'Pending review', -- 'Pending review' | 'Needs fix' | 'Pre-checked'
  notes text,
  uploaded_at timestamptz not null default now()
);

-- Helpful defaults and indexes
alter table public.appointment_documents
  alter column user_id set default auth.uid();

create index if not exists appointment_documents_user_idx on public.appointment_documents(user_id);
create index if not exists appointment_documents_booking_idx on public.appointment_documents(booking_code);

-- RLS
alter table public.appointment_documents enable row level security;

-- Policies: owners can manage their own rows
drop policy if exists "app_docs_owner_select" on public.appointment_documents;
create policy "app_docs_owner_select" on public.appointment_documents
  for select using (user_id = auth.uid());

drop policy if exists "app_docs_owner_insert" on public.appointment_documents;
create policy "app_docs_owner_insert" on public.appointment_documents
  for insert with check (user_id = auth.uid());

drop policy if exists "app_docs_owner_update" on public.appointment_documents;
create policy "app_docs_owner_update" on public.appointment_documents
  for update using (user_id = auth.uid()) with check (user_id = auth.uid());

drop policy if exists "app_docs_owner_delete" on public.appointment_documents;
create policy "app_docs_owner_delete" on public.appointment_documents
  for delete using (user_id = auth.uid());

-- Storage bucket (private) for appointment docs – idempotent
insert into storage.buckets (id, name, public)
values ('appointment-docs', 'appointment-docs', false)
on conflict (id) do nothing;

-- Storage policies: users can only access their own folder in this bucket
-- Note: these policies coexist with other bucket policies already defined.
drop policy if exists "appdocs_select_own" on storage.objects;
create policy "appdocs_select_own" on storage.objects
  for select to authenticated
  using (
    bucket_id = 'appointment-docs'
    and split_part(name, '/', 1) = auth.uid()::text
  );

drop policy if exists "appdocs_insert_own" on storage.objects;
create policy "appdocs_insert_own" on storage.objects
  for insert to authenticated
  with check (
    bucket_id = 'appointment-docs'
    and split_part(name, '/', 1) = auth.uid()::text
  );

drop policy if exists "appdocs_delete_own" on storage.objects;
create policy "appdocs_delete_own" on storage.objects
  for delete to authenticated
  using (
    bucket_id = 'appointment-docs'
    and split_part(name, '/', 1) = auth.uid()::text
  );
