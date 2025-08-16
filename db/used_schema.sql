-- Authentication note:
-- Password-based sign-up/sign-in is implemented via Supabase Auth. Passwords are NEVER stored
-- in application tables. They are salted and hashed by Supabase in the auth schema. Do not add
-- any plaintext password columns to public tables.

-- =========================
-- Core reference tables
-- =========================
create table if not exists public.departments (
  id text primary key,
  name text not null
);

create table if not exists public.services (
  id text primary key,
  slug text unique not null,
  title text not null,
  short_description text,
  category text,
  is_online boolean default false,
  processing_time_days_min integer,
  processing_time_days_max integer,
  fee_min numeric,
  fee_max numeric,
  popularity text check (popularity in ('high','medium','low')) default 'medium',
  default_location text,
  updated_at timestamptz not null default now(),
  department_id text references public.departments(id)
);
create index if not exists services_by_popularity on public.services(popularity);
create index if not exists services_by_updated_at on public.services(updated_at desc);

-- Offices used by booking flow
create table if not exists public.offices (
  id text primary key,
  name text not null,
  city text not null,
  timezone text not null default 'Asia/Colombo'
);

-- =========================
-- Booking capacity and bookings
-- =========================
create table if not exists public.slots (
  id bigserial primary key,
  service_id text not null,
  office_id text not null,
  slot_date date not null,
  slot_time time not null,
  capacity integer not null default 0,
  remaining integer not null default 0,
  constraint uq_slot unique (service_id, office_id, slot_date, slot_time)
);
create index if not exists slots_by_service_office_date on public.slots(service_id, office_id, slot_date);

create table if not exists public.bookings (
  id bigserial primary key,
  booking_code text unique not null,
  user_id uuid references auth.users(id) on delete set null,
  service_id text not null,
  office_id text not null,
  slot_date date not null,
  slot_time time not null,
  full_name text not null,
  nic text not null,
  email text not null,
  phone text not null,
  alt_phone text,
  status text not null default 'Scheduled',
  qr_payload jsonb,
  qr_data_url text,
  created_at timestamptz not null default now(),
  constraint fk_slot foreign key (service_id, office_id, slot_date, slot_time)
    references public.slots(service_id, office_id, slot_date, slot_time)
);
create index if not exists bookings_by_user on public.bookings(user_id);
create index if not exists bookings_by_code on public.bookings(booking_code);

create table if not exists public.appointment_documents (
  id bigserial primary key,
  booking_code text not null references public.bookings(booking_code) on delete cascade,
  object_key text not null,
  original_name text,
  mime_type text,
  size_bytes bigint,
  status text not null default 'Pending review',
  created_at timestamptz not null default now()
);
create index if not exists appt_docs_by_booking on public.appointment_documents(booking_code);

-- Daily availability view used by month view
create or replace view public.daily_availability as
select service_id, office_id, slot_date,
       sum(remaining) as remaining,
       sum(capacity) as capacity
from public.slots
group by service_id, office_id, slot_date;

-- Atomic booking RPC
create or replace function public.book_appointment(
  p_service_id text,
  p_office_id text,
  p_slot_date date,
  p_slot_time time,
  p_full_name text,
  p_nic text,
  p_email text,
  p_phone text,
  p_alt_phone text,
  p_booking_code text
) returns jsonb
language plpgsql
security definer
as $$
DECLARE
  v_remaining integer;
  v_user_id uuid;
BEGIN
  select remaining into v_remaining
  from public.slots
  where service_id = p_service_id
    and office_id = p_office_id
    and slot_date = p_slot_date
    and slot_time = p_slot_time
  for update;

  if v_remaining is null then
    raise exception 'Slot not found';
  end if;
  if v_remaining <= 0 then
    raise exception 'Slot is full';
  end if;

  update public.slots
  set remaining = remaining - 1
  where service_id = p_service_id
    and office_id = p_office_id
    and slot_date = p_slot_date
    and slot_time = p_slot_time;

  begin
    v_user_id := auth.uid();
  exception when others then
    v_user_id := null;
  end;

  insert into public.bookings(
    booking_code, user_id, service_id, office_id, slot_date, slot_time,
    full_name, nic, email, phone, alt_phone, status
  ) values (
    p_booking_code, v_user_id, p_service_id, p_office_id, p_slot_date, p_slot_time,
    p_full_name, p_nic, p_email, p_phone, p_alt_phone, 'Scheduled'
  );

  return jsonb_build_object('booking_code', p_booking_code);
END;
$$;

-- =========================
-- Profiles & Documents
-- =========================
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
  preferred_language text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
create index if not exists profiles_by_name on public.profiles(full_name);

create table if not exists public.profile_documents (
  id bigserial primary key,
  user_id uuid not null references auth.users(id) on delete cascade default auth.uid(),
  object_key text not null,
  original_name text,
  mime_type text,
  size_bytes bigint,
  doc_type text,
  label text,
  uploaded_at timestamptz not null default now()
);
create index if not exists prof_docs_by_user on public.profile_documents(user_id);

create table if not exists public.profile_photos (
  id bigserial primary key,
  user_id uuid not null references auth.users(id) on delete cascade,
  object_key text not null,
  is_current boolean not null default false,
  device_info jsonb,
  created_at timestamptz not null default now()
);
create index if not exists prof_photos_by_user on public.profile_photos(user_id);

-- =========================
-- Session locks (API)
-- =========================
create table if not exists public.session_locks (
  user_id uuid primary key references auth.users(id) on delete cascade,
  device_id text not null,
  updated_at timestamptz not null default now()
);

-- =========================
-- RLS Policies
-- =========================
alter table public.slots enable row level security;
alter table public.bookings enable row level security;
alter table public.appointment_documents enable row level security;
alter table public.services enable row level security;
alter table public.departments enable row level security;
alter table public.profiles enable row level security;
alter table public.profile_documents enable row level security;
alter table public.profile_photos enable row level security;
alter table public.session_locks enable row level security;
-- saved forms table added below also has RLS enabled later

-- Slots read (public), inserts/updates (admin placeholder - permissive)
DROP POLICY IF EXISTS select_slots_for_all ON public.slots;
DROP POLICY IF EXISTS insert_slots_for_admin ON public.slots;
DROP POLICY IF EXISTS update_slots_for_admin ON public.slots;
CREATE POLICY select_slots_for_all ON public.slots FOR SELECT USING (true);
CREATE POLICY insert_slots_for_admin ON public.slots FOR INSERT WITH CHECK (true);
CREATE POLICY update_slots_for_admin ON public.slots FOR UPDATE USING (true) WITH CHECK (true);

-- Bookings: user-only access
DROP POLICY IF EXISTS select_own_bookings ON public.bookings;
DROP POLICY IF EXISTS update_own_booking_qr ON public.bookings;
CREATE POLICY select_own_bookings ON public.bookings FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY update_own_booking_qr ON public.bookings FOR UPDATE USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

-- Appointment docs tied to own booking
DROP POLICY IF EXISTS insert_appt_docs ON public.appointment_documents;
DROP POLICY IF EXISTS select_appt_docs ON public.appointment_documents;
CREATE POLICY insert_appt_docs ON public.appointment_documents FOR INSERT WITH CHECK (
  exists (select 1 from public.bookings b where b.booking_code = appointment_documents.booking_code and b.user_id = auth.uid())
);
CREATE POLICY select_appt_docs ON public.appointment_documents FOR SELECT USING (
  exists (select 1 from public.bookings b where b.booking_code = appointment_documents.booking_code and b.user_id = auth.uid())
);

-- Catalogs readable by anyone
DROP POLICY IF EXISTS select_services_all ON public.services;
DROP POLICY IF EXISTS select_departments_all ON public.departments;
CREATE POLICY select_services_all ON public.services FOR SELECT USING (true);
CREATE POLICY select_departments_all ON public.departments FOR SELECT USING (true);

-- Profiles: user can read/update own row
DROP POLICY IF EXISTS select_own_profile ON public.profiles;
DROP POLICY IF EXISTS upsert_own_profile ON public.profiles;
DROP POLICY IF EXISTS update_own_profile ON public.profiles;
CREATE POLICY select_own_profile ON public.profiles FOR SELECT USING (auth.uid() = id);
CREATE POLICY upsert_own_profile ON public.profiles FOR INSERT WITH CHECK (auth.uid() = id);
CREATE POLICY update_own_profile ON public.profiles FOR UPDATE USING (auth.uid() = id) WITH CHECK (auth.uid() = id);

-- Profile documents/photos: user can manage own
DROP POLICY IF EXISTS prof_docs_select_own ON public.profile_documents;
DROP POLICY IF EXISTS prof_docs_manage_own ON public.profile_documents;
CREATE POLICY prof_docs_select_own ON public.profile_documents FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY prof_docs_manage_own ON public.profile_documents FOR ALL USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS prof_photos_select_own ON public.profile_photos;
DROP POLICY IF EXISTS prof_photos_manage_own ON public.profile_photos;
CREATE POLICY prof_photos_select_own ON public.profile_photos FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY prof_photos_manage_own ON public.profile_photos FOR ALL USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

-- Session locks: user can read/write own
DROP POLICY IF EXISTS session_lock_own ON public.session_locks;
CREATE POLICY session_lock_own ON public.session_locks FOR ALL USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

-- =========================
-- Saved forms (referenced in src/lib/profile.ts)
-- =========================
create table if not exists public.saved_forms (
  user_id uuid not null references auth.users(id) on delete cascade,
  service_key text not null,
  payload jsonb not null default '{}'::jsonb,
  updated_at timestamptz not null default now(),
  constraint saved_forms_pk primary key (user_id, service_key)
);
alter table public.saved_forms enable row level security;
DROP POLICY IF EXISTS saved_forms_manage_own ON public.saved_forms;
DROP POLICY IF EXISTS saved_forms_select_own ON public.saved_forms;
CREATE POLICY saved_forms_select_own ON public.saved_forms FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY saved_forms_manage_own ON public.saved_forms FOR ALL USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

-- End of used schema
