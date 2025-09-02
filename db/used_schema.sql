-- Authentication note:
-- Password-based sign-up/sign-in is implemented via Supabase Auth. Passwords are NEVER stored
-- in application tables. They are salted and hashed by Supabase in the auth schema. Do not add
-- any plaintext password columns to public tables.

-- =========================
-- Core reference tables
-- =========================
create table if not exists public.departments (
  id uuid primary key,
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
  department_id uuid references public.departments(id)
);
create index if not exists services_by_popularity on public.services(popularity);
create index if not exists services_by_updated_at on public.services(updated_at desc);
create index if not exists services_by_department on public.services(department_id);

-- =========================
-- Admin membership (users assigned to departments)
-- =========================
create table if not exists public.department_admins (
  user_id uuid not null references auth.users(id) on delete cascade,
  department_id uuid not null references public.departments(id) on delete cascade,
  role text not null default 'admin' check (role in ('admin','editor','viewer')),
  is_active boolean not null default true,
  created_at timestamptz not null default now(),
  constraint department_admins_pk primary key (user_id, department_id)
);
create index if not exists dept_admins_by_user on public.department_admins(user_id);
create index if not exists dept_admins_by_dept on public.department_admins(department_id);

-- Normalize legacy installs where department_admins.user_id was created as text
DO $$
DECLARE v_type text;
BEGIN
  SELECT data_type INTO v_type
  FROM information_schema.columns
  WHERE table_schema = 'public' AND table_name = 'department_admins' AND column_name = 'user_id';

  IF v_type IS NOT NULL AND v_type <> 'uuid' THEN
    BEGIN
      ALTER TABLE public.department_admins ALTER COLUMN user_id TYPE uuid USING user_id::uuid;
    EXCEPTION WHEN others THEN
      RAISE NOTICE 'department_admins.user_id remains %, invalid data prevents cast; policies use direct uuid comparisons', v_type;
    END;
  END IF;
END $$;

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
  selected_department_id uuid references public.departments(id),
  updated_at timestamptz not null default now()
);

-- Normalize existing installs where session_locks.selected_department_id was created as text
DO $$
DECLARE v_type text;
BEGIN
  SELECT data_type INTO v_type
  FROM information_schema.columns
  WHERE table_schema = 'public' AND table_name = 'session_locks' AND column_name = 'selected_department_id';

  IF v_type IS NOT NULL AND v_type <> 'uuid' THEN
    BEGIN
      ALTER TABLE public.session_locks ALTER COLUMN selected_department_id TYPE uuid USING selected_department_id::uuid;
    EXCEPTION WHEN others THEN
      -- If invalid data prevents cast, keep as-is; views/policies will cast explicitly
      RAISE NOTICE 'session_locks.selected_department_id remains %, invalid data prevents cast; view uses explicit casts', v_type;
    END;
  END IF;
END $$;

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
alter table public.department_admins enable row level security;
-- saved forms table added below also has RLS enabled later

DROP POLICY IF EXISTS select_slots_for_all ON public.slots;
DROP POLICY IF EXISTS insert_slots_for_admin ON public.slots;
DROP POLICY IF EXISTS update_slots_for_admin ON public.slots;
CREATE POLICY select_slots_for_all ON public.slots FOR SELECT USING (true);
ALTER TABLE public.offices ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS select_offices_all ON public.offices;
CREATE POLICY select_offices_all ON public.offices FOR SELECT USING (true);

ALTER TABLE public.profiles
  DROP CONSTRAINT IF EXISTS profiles_valid_email_chk;
-- Allow admins of the owning department to manage capacity for their department's services
CREATE POLICY insert_slots_for_admin ON public.slots FOR INSERT TO authenticated
  WITH CHECK (exists (
    select 1 from public.services s
  join public.department_admins da on da.department_id = s.department_id and da.user_id = auth.uid() and da.is_active
    where s.id = slots.service_id
  ));
CREATE POLICY update_slots_for_admin ON public.slots FOR UPDATE TO authenticated
  USING (exists (
    select 1 from public.services s
  join public.department_admins da on da.department_id = s.department_id and da.user_id = auth.uid() and da.is_active
    where s.id = slots.service_id
  ))
  WITH CHECK (exists (
    select 1 from public.services s
  join public.department_admins da on da.department_id = s.department_id and da.user_id = auth.uid() and da.is_active
    where s.id = slots.service_id
  ));

-- Bookings: user-only access
DROP POLICY IF EXISTS select_own_bookings ON public.bookings;
DROP POLICY IF EXISTS update_own_booking_qr ON public.bookings;
DROP POLICY IF EXISTS users_can_update_own_bookings ON public.bookings;
DROP POLICY IF EXISTS admin_select_department_bookings ON public.bookings;
DROP POLICY IF EXISTS admin_update_department_bookings ON public.bookings;
CREATE POLICY select_own_bookings ON public.bookings FOR SELECT USING (auth.uid() = user_id);
-- Enable update access for users based on their user ID (Supabase template equivalent)
CREATE POLICY users_can_update_own_bookings ON public.bookings
  FOR UPDATE
  TO authenticated
  USING ((select auth.uid()) = user_id);
-- Department admins can read and update bookings that belong to their department's services
CREATE POLICY admin_select_department_bookings ON public.bookings
  FOR SELECT TO authenticated
  USING (exists (
    select 1 from public.services s
  join public.department_admins da on da.department_id = s.department_id and da.user_id = auth.uid() and da.is_active
    where s.id = bookings.service_id
  ));
CREATE POLICY admin_update_department_bookings ON public.bookings
  FOR UPDATE TO authenticated
  USING (exists (
    select 1 from public.services s
  join public.department_admins da on da.department_id = s.department_id and da.user_id = auth.uid() and da.is_active
    where s.id = bookings.service_id
  ))
  WITH CHECK (exists (
    select 1 from public.services s
  join public.department_admins da on da.department_id = s.department_id and da.user_id = auth.uid() and da.is_active
    where s.id = bookings.service_id
  ));

-- Services: anyone can read, only department admins can update
DROP POLICY IF EXISTS select_services_all ON public.services;
DROP POLICY IF EXISTS update_services_admin ON public.services;
CREATE POLICY select_services_all ON public.services FOR SELECT USING (true);
CREATE POLICY update_services_admin ON public.services FOR UPDATE TO authenticated
  USING (exists (select 1 from public.department_admins da where da.department_id = services.department_id and da.user_id = auth.uid() and da.is_active))
  WITH CHECK (exists (select 1 from public.department_admins da where da.department_id = services.department_id and da.user_id = auth.uid() and da.is_active));

-- Appointment docs tied to own booking
DROP POLICY IF EXISTS insert_appt_docs ON public.appointment_documents;
DROP POLICY IF EXISTS select_appt_docs ON public.appointment_documents;
DROP POLICY IF EXISTS admin_select_appt_docs_by_department ON public.appointment_documents;
CREATE POLICY insert_appt_docs ON public.appointment_documents FOR INSERT WITH CHECK (
  exists (select 1 from public.bookings b where b.booking_code = appointment_documents.booking_code and b.user_id = auth.uid())
);
CREATE POLICY select_appt_docs ON public.appointment_documents FOR SELECT USING (
  exists (select 1 from public.bookings b where b.booking_code = appointment_documents.booking_code and b.user_id = auth.uid())
);
-- Department admins can see appointment documents for bookings under their department's services
CREATE POLICY admin_select_appt_docs_by_department ON public.appointment_documents
  FOR SELECT TO authenticated
  USING (exists (
    select 1 from public.bookings b
    join public.services s on s.id = b.service_id
  join public.department_admins da on da.department_id = s.department_id and da.user_id = auth.uid() and da.is_active
    where b.booking_code = appointment_documents.booking_code
  ));

-- Catalogs readable by anyone
DROP POLICY IF EXISTS select_services_all ON public.services;
DROP POLICY IF EXISTS select_departments_all ON public.departments;
CREATE POLICY select_services_all ON public.services FOR SELECT USING (true);
CREATE POLICY select_departments_all ON public.departments FOR SELECT USING (true);

-- Department admins table policies (admins can see their own memberships)
DROP POLICY IF EXISTS dept_admins_select_own ON public.department_admins;
CREATE POLICY dept_admins_select_own ON public.department_admins FOR SELECT
  TO authenticated USING (user_id = auth.uid());

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

-- Helper view for the admin UI to list the departments an admin belongs to
create or replace view public.my_departments as
select d.id as department_id, d.name
from public.department_admins da
join public.departments d on d.id = da.department_id
where da.user_id = auth.uid() and da.is_active;

-- Helper view for the admin UI: current selected department context
create or replace view public.admin_current_context as
select sl.selected_department_id as department_id, d.name as department_name
from public.session_locks sl
left join public.departments d on d.id = sl.selected_department_id
where sl.user_id = auth.uid();

-- RPC to set the current admin's selected department (used by admin UI after sign-in)
create or replace function public.set_selected_department(
  p_department_id uuid,
  p_device_id text default 'web'
) returns void
language sql
security definer
as $$
  insert into public.session_locks (user_id, device_id, selected_department_id, updated_at)
  values (auth.uid(), coalesce(p_device_id, 'web'), p_department_id, now())
  on conflict (user_id) do update
    set selected_department_id = excluded.selected_department_id,
        device_id = excluded.device_id,
        updated_at = now();
$$;

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
-- Normalize existing installs where saved_forms.user_id was created as text
DO $$
DECLARE v_type text;
BEGIN
  SELECT data_type INTO v_type
  FROM information_schema.columns
  WHERE table_schema = 'public' AND table_name = 'saved_forms' AND column_name = 'user_id';

  IF v_type IS NOT NULL AND v_type <> 'uuid' THEN
    -- Cast any existing non-uuid user_id values to uuid
    ALTER TABLE public.saved_forms ALTER COLUMN user_id TYPE uuid USING user_id::uuid;
  END IF;
END $$;
alter table public.saved_forms enable row level security;
DROP POLICY IF EXISTS saved_forms_manage_own ON public.saved_forms;
DROP POLICY IF EXISTS saved_forms_select_own ON public.saved_forms;
CREATE POLICY saved_forms_select_own ON public.saved_forms FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY saved_forms_manage_own ON public.saved_forms FOR ALL USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

-- End of used schema
-- Ensure authenticated role has required privileges on profile_documents (alongside RLS)
-- Safe to run multiple times.

-- Explicit table grants (RLS still enforces row access)
grant select, insert, update, delete on table public.profile_documents to authenticated;

-- Sequence grant to avoid 42501 on inserts
grant usage, select on sequence public.profile_documents_id_seq to authenticated;

-- Appointment documents (prevent future permission errors when attaching docs to bookings)
grant select, insert, update, delete on table public.appointment_documents to authenticated;
grant usage, select on sequence public.appointment_documents_id_seq to authenticated;
