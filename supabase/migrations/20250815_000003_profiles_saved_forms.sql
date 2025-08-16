-- Profiles, profile photos, and saved forms

-- Tables
create table if not exists public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  full_name text,
  nic text,
  dob date,
  phone text,
  email text,
  address_line1 text,
  address_line2 text,
  district text,
  postal_code text,
  preferred_language text check (preferred_language in ('en','si','ta')),
  verified boolean not null default false,
  updated_at timestamptz not null default now()
);

-- Auto-create a profile row whenever a new auth.user is created (idempotent)
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into public.profiles (id, email, preferred_language)
  values (new.id, new.email, 'en')
  on conflict (id) do nothing;
  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
after insert on auth.users
for each row execute function public.handle_new_user();

-- Uniqueness constraints for user-identifying fields (case-insensitive where applicable)
create unique index if not exists profiles_email_unique on public.profiles ((lower(email))) where email is not null;
create unique index if not exists profiles_nic_unique on public.profiles ((upper(nic))) where nic is not null;
create unique index if not exists profiles_phone_unique on public.profiles (phone) where phone is not null;

create table if not exists public.profile_photos (
  id bigserial primary key,
  user_id uuid not null references public.profiles(id) on delete cascade,
  object_key text not null,
  taken_at timestamptz not null default now(),
  is_current boolean not null default true,
  device_info jsonb,
  hash text
);

-- Helpful default so client doesn't need to send user_id explicitly
alter table public.profile_photos
  alter column user_id set default auth.uid();

-- Indexes for FK lookups
create index if not exists profile_photos_user_id_idx on public.profile_photos(user_id);

create table if not exists public.saved_forms (
  id bigserial primary key,
  user_id uuid not null references public.profiles(id) on delete cascade,
  service_key text not null,
  payload jsonb not null,
  updated_at timestamptz not null default now(),
  unique (user_id, service_key)
);

create index if not exists saved_forms_user_id_idx on public.saved_forms(user_id);

-- Single-device session lock per user
create table if not exists public.session_locks (
  user_id uuid primary key references public.profiles(id) on delete cascade,
  device_id text not null,
  updated_at timestamptz not null default now()
);

-- RLS
alter table public.profiles enable row level security;
alter table public.profile_photos enable row level security;
alter table public.saved_forms enable row level security;
alter table public.session_locks enable row level security;

-- Policies
drop policy if exists "profiles_self_select2" on public.profiles;
create policy "profiles_self_select2" on public.profiles
  for select using (id = auth.uid());
drop policy if exists "profiles_self_upsert2" on public.profiles;
create policy "profiles_self_upsert2" on public.profiles
  for insert with check (id = auth.uid());
drop policy if exists "profiles_self_update2" on public.profiles;
create policy "profiles_self_update2" on public.profiles
  for update using (id = auth.uid()) with check (id = auth.uid());

drop policy if exists "profile_photos_owner_select" on public.profile_photos;
create policy "profile_photos_owner_select" on public.profile_photos
  for select using (user_id = auth.uid());
-- Allow users to manage their own profile photos
drop policy if exists "profile_photos_owner_insert" on public.profile_photos;
create policy "profile_photos_owner_insert" on public.profile_photos
  for insert with check (user_id = auth.uid());
drop policy if exists "profile_photos_owner_update" on public.profile_photos;
create policy "profile_photos_owner_update" on public.profile_photos
  for update using (user_id = auth.uid()) with check (user_id = auth.uid());
drop policy if exists "profile_photos_owner_delete" on public.profile_photos;
create policy "profile_photos_owner_delete" on public.profile_photos
  for delete using (user_id = auth.uid());

drop policy if exists "saved_forms_owner_select" on public.saved_forms;
create policy "saved_forms_owner_select" on public.saved_forms
  for select using (user_id = auth.uid());
drop policy if exists "saved_forms_owner_upsert" on public.saved_forms;
create policy "saved_forms_owner_upsert" on public.saved_forms
  for insert with check (user_id = auth.uid());
drop policy if exists "saved_forms_owner_update" on public.saved_forms;
create policy "saved_forms_owner_update" on public.saved_forms
  for update using (user_id = auth.uid());
drop policy if exists "saved_forms_owner_delete" on public.saved_forms;
create policy "saved_forms_owner_delete" on public.saved_forms
  for delete using (user_id = auth.uid());

drop policy if exists "session_locks_owner_select" on public.session_locks;
create policy "session_locks_owner_select" on public.session_locks
  for select using (user_id = auth.uid());
drop policy if exists "session_locks_owner_upsert" on public.session_locks;
create policy "session_locks_owner_upsert" on public.session_locks
  for insert with check (user_id = auth.uid());
drop policy if exists "session_locks_owner_update" on public.session_locks;
create policy "session_locks_owner_update" on public.session_locks
  for update using (user_id = auth.uid()) with check (user_id = auth.uid());

-- Storage bucket (private) – idempotent creation
insert into storage.buckets (id, name, public)
values ('profile-photos', 'profile-photos', false)
on conflict (id) do nothing;

-- Storage object policies: users can upload/select only their own folder in profile-photos bucket
drop policy if exists "pp_objs_select_own" on storage.objects;
create policy "pp_objs_select_own" on storage.objects
  for select to authenticated
  using (
    bucket_id = 'profile-photos'
    and split_part(name, '/', 1) = auth.uid()::text
  );

drop policy if exists "pp_objs_insert_own" on storage.objects;
create policy "pp_objs_insert_own" on storage.objects
  for insert to authenticated
  with check (
    bucket_id = 'profile-photos'
    and split_part(name, '/', 1) = auth.uid()::text
  );

drop policy if exists "pp_objs_delete_own" on storage.objects;
create policy "pp_objs_delete_own" on storage.objects
  for delete to authenticated
  using (
    bucket_id = 'profile-photos'
    and split_part(name, '/', 1) = auth.uid()::text
  );

-- Optional: storage policies remain strict (private); uploads via presigned URLs
