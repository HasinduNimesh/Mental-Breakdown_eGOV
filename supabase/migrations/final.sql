-- ========== 0) Schema usage for anon/authenticated ==========
grant usage on schema public to anon;
grant usage on schema public to authenticated;

-- Ensure future objects also have usage/select by default (best-effort; safe if repeated)
alter default privileges in schema public grant select on tables to anon, authenticated;
alter default privileges in schema public grant usage on sequences to anon, authenticated;

-- ========== 1) User-owned: profiles, profile_photos, saved_forms, session_locks ==========
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

-- Create stub profile on new auth.user (idempotent)
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

-- Helpful uniqueness indexes (safe if repeated)
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
alter table public.profile_photos alter column user_id set default auth.uid();
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

create table if not exists public.session_locks (
  user_id uuid primary key references public.profiles(id) on delete cascade,
  device_id text not null,
  updated_at timestamptz not null default now()
);

-- Enable RLS on user-owned tables
alter table public.profiles enable row level security;
alter table public.profile_photos enable row level security;
alter table public.saved_forms enable row level security;
alter table public.session_locks enable row level security;

-- RLS policies (idempotent)
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
  for update using (user_id = auth.uid()) with check (user_id = auth.uid());

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

-- Grants for user-owned tables
grant select, insert, update, delete on table public.profiles to authenticated;
grant select, insert, update, delete on table public.profile_photos to authenticated;
grant select, insert, update, delete on table public.saved_forms to authenticated;
grant select, insert, update, delete on table public.session_locks to authenticated;

-- Fix for “permission denied for sequence profile_photos_id_seq”
do $$ begin
  if exists (
    select 1 from pg_class c
    join pg_namespace n on n.oid = c.relnamespace
    where c.relkind = 'S' and n.nspname = 'public' and c.relname = 'profile_photos_id_seq'
  ) then
    execute 'grant usage, select on sequence public.profile_photos_id_seq to authenticated';
  end if;
end $$;

do $$ begin
  if exists (
    select 1 from pg_class c
    join pg_namespace n on n.oid = c.relnamespace
    where c.relkind = 'S' and n.nspname = 'public' and c.relname = 'saved_forms_id_seq'
  ) then
    execute 'grant usage, select on sequence public.saved_forms_id_seq to authenticated';
  end if;
end $$;

-- ========== 2) Public catalog: services model (TEXT ids), requirements, faqs ==========
create table if not exists public.services (
  id text primary key,          -- keep TEXT id to avoid FK/type mismatches
  title text not null,
  department text,              -- free text; optional normalization later
  description text,
  active boolean not null default true,
  sort_order int
);

create table if not exists public.service_requirements (
  id bigserial primary key,
  service_id text not null references public.services(id) on delete cascade,
  label text not null,
  example text
);

create table if not exists public.service_faqs (
  id bigserial primary key,
  service_id text not null references public.services(id) on delete cascade,
  question text not null,
  answer text not null
);

-- Public read grants
grant select on table public.services to anon, authenticated;
grant select on table public.service_requirements to anon, authenticated;
grant select on table public.service_faqs to anon, authenticated;

-- ========== 3) Booking read models: offices and slots ==========
create table if not exists public.offices (
  id text primary key,
  name text not null,
  city text,
  address text
);

create table if not exists public.slots (
  service_id text not null,
  office_id text not null,
  slot_date date not null,
  slot_time time not null,
  remaining int not null default 0,
  primary key (service_id, office_id, slot_date, slot_time)
);

grant select on table public.offices to anon, authenticated;
grant select on table public.slots to anon, authenticated;

-- ========== 4) Storage bucket for profile photos (private) ==========
insert into storage.buckets (id, name, public)
values ('profile-photos', 'profile-photos', false)
on conflict (id) do nothing;

-- Storage RLS policies for the profile-photos bucket (idempotent)
drop policy if exists "pp_objs_select_own" on storage.objects;
create policy "pp_objs_select_own" on storage.objects
  for select to authenticated
  using (bucket_id = 'profile-photos' and split_part(name, '/', 1) = auth.uid()::text);

drop policy if exists "pp_objs_insert_own" on storage.objects;
create policy "pp_objs_insert_own" on storage.objects
  for insert to authenticated
  with check (bucket_id = 'profile-photos' and split_part(name, '/', 1) = auth.uid()::text);

drop policy if exists "pp_objs_delete_own" on storage.objects;
create policy "pp_objs_delete_own" on storage.objects
  for delete to authenticated
  using (bucket_id = 'profile-photos' and split_part(name, '/', 1) = auth.uid()::text);