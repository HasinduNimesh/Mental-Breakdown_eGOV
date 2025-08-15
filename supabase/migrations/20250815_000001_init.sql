-- Enable helpers
create extension if not exists pgcrypto;   -- gen_random_uuid
create extension if not exists pgjwt;

-- ENUMs
do $$ begin
  create type booking_status as enum ('booked','rescheduled','cancelled','checked_in','completed','no_show');
exception when duplicate_object then null; end $$;

do $$ begin
  create type doc_status as enum ('pending','needs_fix','pre_checked','rejected');
exception when duplicate_object then null; end $$;

-- Citizens (profile linked to auth.users)
create table if not exists public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  full_name text,
  phone text,
  nic text,
  preferred_language text check (preferred_language in ('en','si','ta')),
  created_at timestamptz not null default now()
);

-- Departments / Services / Offices
create table if not exists public.departments (
  id bigserial primary key,
  name text not null
);

create table if not exists public.services (
  id bigserial primary key,
  department_id bigint not null references public.departments(id) on delete restrict,
  name text not null,
  description text,
  required_docs jsonb default '[]'::jsonb,
  duration_minutes int not null check (duration_minutes > 0),
  is_online boolean not null default true,
  policies jsonb default '{}'::jsonb
);

create table if not exists public.offices (
  id bigserial primary key,
  name text not null,
  address text,
  tz text not null default 'Asia/Colombo',
  lat double precision,
  lng double precision
);

create table if not exists public.working_hours (
  id bigserial primary key,
  office_id bigint not null references public.offices(id) on delete cascade,
  day_of_week int not null check (day_of_week between 0 and 6), -- 0=Sun
  open_time time not null,
  close_time time not null,
  breaks jsonb default '[]'::jsonb
);

create table if not exists public.holidays (
  id bigserial primary key,
  office_id bigint not null references public.offices(id) on delete cascade,
  date date not null,
  reason text
);

-- Slots (capacity-aware)
create table if not exists public.slots (
  id bigserial primary key,
  office_id bigint not null references public.offices(id) on delete cascade,
  service_id bigint not null references public.services(id) on delete cascade,
  starts_at timestamptz not null,
  ends_at   timestamptz not null,
  capacity int not null check (capacity >= 1),
  remaining int not null check (remaining >= 0),
  unique (office_id, service_id, starts_at, ends_at)
);

-- Bookings
create table if not exists public.bookings (
  id bigserial primary key,
  citizen_id uuid not null references public.profiles(id) on delete cascade,
  service_id bigint not null references public.services(id),
  office_id bigint not null references public.offices(id),
  slot_id bigint not null references public.slots(id),
  status booking_status not null default 'booked',
  code varchar(12) not null unique,         -- human code e.g. AB12CD34
  qr_token uuid not null default gen_random_uuid(),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index on public.bookings (citizen_id, status);

-- Documents
create table if not exists public.documents (
  id bigserial primary key,
  booking_id bigint not null references public.bookings(id) on delete cascade,
  type text not null,                        -- 'NIC','FORM_1'...
  object_key text,                           -- storage key
  mime text,
  size_bytes int,
  status doc_status not null default 'pending',
  version int not null default 1,
  reviewer_notes text,
  uploaded_at timestamptz default now()
);

-- Notification logs
create table if not exists public.notification_log (
  id bigserial primary key,
  booking_id bigint references public.bookings(id) on delete set null,
  event text not null,                       -- 'booking.created','reminder.24h', etc.
  channel text not null,                     -- 'email','sms'
  status text not null,                      -- 'queued','sent','failed'
  provider_id text,
  created_at timestamptz not null default now()
);

-- RLS
alter table public.profiles enable row level security;
alter table public.bookings enable row level security;
alter table public.documents enable row level security;

-- Public catalog readable by anyone
grant select on public.departments, public.services, public.offices, public.working_hours, public.holidays, public.slots to anon, authenticated;

-- Profile policies (owner-only)
create policy "profiles_self_select" on public.profiles
  for select using (id = auth.uid());
create policy "profiles_self_upsert" on public.profiles
  for insert with check (id = auth.uid());
create policy "profiles_self_update" on public.profiles
  for update using (id = auth.uid());

-- Bookings: citizens can read their own; writes via RPC/Edge only
create policy "bookings_owner_read" on public.bookings
  for select using (citizen_id = auth.uid());

-- Documents: citizens can read their own booking docs; writes via RPC/Edge only
create policy "documents_owner_read" on public.documents
  for select using (
    exists (select 1 from public.bookings b where b.id = booking_id and b.citizen_id = auth.uid())
  );
