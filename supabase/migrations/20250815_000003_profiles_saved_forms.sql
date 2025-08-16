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

create table if not exists public.profile_photos (
  id bigserial primary key,
  user_id uuid not null references public.profiles(id) on delete cascade,
  object_key text not null,
  taken_at timestamptz not null default now(),
  is_current boolean not null default true,
  device_info jsonb,
  hash text
);

create table if not exists public.saved_forms (
  id bigserial primary key,
  user_id uuid not null references public.profiles(id) on delete cascade,
  service_key text not null,
  payload jsonb not null,
  updated_at timestamptz not null default now(),
  unique (user_id, service_key)
);

-- RLS
alter table public.profiles enable row level security;
alter table public.profile_photos enable row level security;
alter table public.saved_forms enable row level security;

-- Policies
create policy if not exists "profiles_self_select2" on public.profiles
  for select using (id = auth.uid());
create policy if not exists "profiles_self_upsert2" on public.profiles
  for insert with check (id = auth.uid());
create policy if not exists "profiles_self_update2" on public.profiles
  for update using (id = auth.uid());

create policy if not exists "profile_photos_owner_select" on public.profile_photos
  for select using (user_id = auth.uid());
-- writes via Edge Functions only (no direct insert/update/delete policies)

create policy if not exists "saved_forms_owner_select" on public.saved_forms
  for select using (user_id = auth.uid());
create policy if not exists "saved_forms_owner_upsert" on public.saved_forms
  for insert with check (user_id = auth.uid());
create policy if not exists "saved_forms_owner_update" on public.saved_forms
  for update using (user_id = auth.uid());

-- Storage bucket (private)
select storage.create_bucket('profile-photos', false, 'standard');

-- Optional: storage policies remain strict (private); uploads via presigned URLs
