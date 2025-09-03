-- Ensure booking flow works end-to-end with the database
-- - Adds/repairs composite FK from bookings -> slots
-- - Adds is_reminder_sent column used by the app
-- - Creates atomic booking RPC (book_appointment)
-- - Seeds core services and offices used by the UI, if missing
-- - Seeds slots for the next 14 days with capacity, if missing
-- - Creates daily_availability view (used by UI)
-- - Ensures RLS policies/grants needed by the app

begin;

-- 1) Seed core catalogs referenced by the UI (safe, no deps)
insert into public.offices (id, name, city, timezone)
values
  ('col-hq', 'Head Office', 'Colombo', 'Asia/Colombo'),
  ('mat-reg', 'Regional Office', 'Matara', 'Asia/Colombo'),
  ('kan-reg', 'Regional Office', 'Kandy', 'Asia/Colombo')
on conflict (id) do nothing;

-- Services can exist with a null department_id; department wiring can be done later by admins
insert into public.services (id, slug, title, short_description, category, is_online)
values
  ('passport', 'passport-application', 'Passport Application', 'Apply or renew your passport', 'identity', true),
  ('license', 'driving-license', 'Driving License Services', 'New, renewals, or updates', 'transport', true),
  ('birth-cert', 'birth-certificate', 'Birth Certificate', 'Request a certified copy', 'civil', true),
  ('police-clearance', 'police-clearance', 'Police Clearance Certificate', 'Clearance for travel or work', 'security', true)
on conflict (id) do nothing;

-- 2) Ensure slots schema supports uniqueness so we can safely upsert
do $$
begin
  if not exists (
    select 1 from pg_constraint c
    join pg_class t on t.oid = c.conrelid
    where t.relname = 'slots' and c.conname = 'uq_slot'
  ) then
    alter table public.slots
      add constraint uq_slot unique (service_id, office_id, slot_date, slot_time);
  end if;
exception when undefined_table then
  -- If slots table doesn't exist yet, create a minimal version
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
end $$;

-- 3) Ensure bookings table has the reminder flag and composite FK to slots
do $$
begin
  perform 1 from information_schema.columns
  where table_schema = 'public' and table_name = 'bookings' and column_name = 'is_reminder_sent';
  if not found then
    alter table public.bookings add column is_reminder_sent boolean not null default false;
  end if;
exception when undefined_table then
  -- Create a minimal bookings table if missing (auth references may be added in other migrations)
  create table if not exists public.bookings (
    id bigserial primary key,
    booking_code text unique not null,
    user_id uuid,
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
    is_reminder_sent boolean not null default false
  );
end $$;

-- Add composite FK to slots if missing
do $$
begin
  if not exists (
    select 1 from pg_constraint c
    join pg_class t on t.oid = c.conrelid
    where t.relname = 'bookings' and c.conname = 'fk_slot'
  ) then
    alter table public.bookings
      add constraint fk_slot foreign key (service_id, office_id, slot_date, slot_time)
        references public.slots(service_id, office_id, slot_date, slot_time);
  end if;
end $$;

-- 4) Atomic booking RPC used by the app (client calls supabase.rpc('book_appointment', ...))
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
declare
  v_remaining integer;
  v_user_id uuid;
begin
  -- Lock the target slot row for update so capacity can be decremented safely
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
end;
$$;

-- 5) Seed slots for the next 14 days (times: 09:00, 10:00, 11:00, 13:00, 14:00, 15:00)
with times as (
  select unnest(array['09:00','10:00','11:00','13:00','14:00','15:00']::time[]) as slot_time
),
dates as (
  select (current_date + gs) as slot_date from generate_series(0, 13) as gs
),
svc as (
  select id from public.services where id in ('passport','license','birth-cert','police-clearance')
),
off as (
  select id from public.offices where id in ('col-hq','mat-reg','kan-reg')
)
insert into public.slots (service_id, office_id, slot_date, slot_time, capacity, remaining)
select s.id, o.id, d.slot_date::date, t.slot_time,
       10 as capacity,
       10 as remaining
from svc s
cross join off o
cross join dates d
cross join times t
on conflict (service_id, office_id, slot_date, slot_time) do nothing;

-- 6) Availability view used by the UI
create or replace view public.daily_availability as
select service_id, office_id, slot_date,
       sum(remaining) as remaining,
       sum(capacity) as capacity
from public.slots
group by service_id, office_id, slot_date;

-- 7) Appointment documents table (when not already present) and policies/grants
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

-- Enable RLS where needed and (re)create critical policies
alter table public.bookings enable row level security;
alter table public.appointment_documents enable row level security;

-- Allow public read on catalogs/capacity used by the booking UI
alter table public.slots enable row level security;
alter table public.offices enable row level security;
alter table public.services enable row level security;

drop policy if exists select_slots_for_all on public.slots;
create policy select_slots_for_all on public.slots for select using (true);

drop policy if exists select_offices_all on public.offices;
create policy select_offices_all on public.offices for select using (true);

drop policy if exists select_services_all on public.services;
create policy select_services_all on public.services for select using (true);

drop policy if exists select_own_bookings on public.bookings;
create policy select_own_bookings on public.bookings for select using (auth.uid() = user_id);

drop policy if exists users_can_update_own_bookings on public.bookings;
create policy users_can_update_own_bookings on public.bookings for update to authenticated using ((select auth.uid()) = user_id);

drop policy if exists insert_appt_docs on public.appointment_documents;
create policy insert_appt_docs on public.appointment_documents for insert with check (
  exists (select 1 from public.bookings b where b.booking_code = appointment_documents.booking_code and b.user_id = auth.uid())
);

drop policy if exists select_appt_docs on public.appointment_documents;
create policy select_appt_docs on public.appointment_documents for select using (
  exists (select 1 from public.bookings b where b.booking_code = appointment_documents.booking_code and b.user_id = auth.uid())
);

-- Grants to avoid sequence/table privilege errors (RLS still applies)
grant select, insert, update, delete on table public.appointment_documents to authenticated;
grant usage, select on sequence public.appointment_documents_id_seq to authenticated;

-- Profile documents grants (for reading when attaching to appointment)
grant select on table public.profile_documents to authenticated;
grant usage, select on sequence public.profile_documents_id_seq to authenticated;

commit;
