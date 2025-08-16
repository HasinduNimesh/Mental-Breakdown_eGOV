-- eGOV booking schema (PostgreSQL, Supabase compatible)
-- Idempotent guards
create table if not exists public.services (
  id text primary key,
  title text not null,
  department text not null
);

create table if not exists public.offices (
  id text primary key,
  name text not null,
  city text not null,
  timezone text not null default 'Asia/Colombo'
);

-- Slots represent capacity per date+time for a specific service at an office
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

-- Bookings for citizens
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

-- Documents saved per profile already exist: profile_documents
-- Appointment-attached documents copied/referenced here
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

-- Helper view to see daily availability per service/office/date
create or replace view public.daily_availability as
select service_id, office_id, slot_date,
       sum(remaining) as remaining,
       sum(capacity) as capacity
from public.slots
group by service_id, office_id, slot_date;

-- Stored procedure to atomically book a slot and return the booking code
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
  -- Lock the slot row for update to prevent race conditions
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

  -- Decrement remaining
  update public.slots
  set remaining = remaining - 1
  where service_id = p_service_id
    and office_id = p_office_id
    and slot_date = p_slot_date
    and slot_time = p_slot_time;

  -- Current auth uid if available
  begin
    v_user_id := auth.uid();
  exception when others then
    v_user_id := null;
  end;

  -- Insert booking
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

-- RLS policies (basic; tighten as needed)
alter table public.slots enable row level security;
alter table public.bookings enable row level security;
alter table public.appointment_documents enable row level security;

-- Slots read for anyone (or restrict to authenticated)
drop policy if exists select_slots_for_all on public.slots;
create policy select_slots_for_all on public.slots for select using (true);

-- Allow admins (role to be configured) to manage slots; placeholder permissive policies for now
drop policy if exists insert_slots_for_admin on public.slots;
drop policy if exists update_slots_for_admin on public.slots;
create policy insert_slots_for_admin on public.slots for insert with check (true);
create policy update_slots_for_admin on public.slots for update using (true) with check (true);

-- Bookings: users can see their own, insert via RPC; admins can see all (policy can be refined)
drop policy if exists select_own_bookings on public.bookings;
drop policy if exists update_own_booking_qr on public.bookings;
create policy select_own_bookings on public.bookings for select using (auth.uid() = user_id);
create policy update_own_booking_qr on public.bookings for update using (auth.uid() = user_id) with check (auth.uid() = user_id);

-- Appointment documents: users can insert rows tied to their booking; view their own via join on booking_code
drop policy if exists insert_appt_docs on public.appointment_documents;
drop policy if exists select_appt_docs on public.appointment_documents;
create policy insert_appt_docs on public.appointment_documents for insert with check (
  exists (select 1 from public.bookings b where b.booking_code = appointment_documents.booking_code and b.user_id = auth.uid())
);
create policy select_appt_docs on public.appointment_documents for select using (
  exists (select 1 from public.bookings b where b.booking_code = appointment_documents.booking_code and b.user_id = auth.uid())
);

-- Seed basic services/offices intentionally omitted here to avoid conflicts with existing catalogs.

-- 
-- Seed slots for the next 7 days (excluding Sundays) for 'passport' service at 'col-hq' office
-- do $$
-- declare
--     d date := current_date; -- date iterator
--     i int;                  -- day offset
--     t time;                 -- slot time iterator
-- begin
--     for i in 0..6 loop
--         d := current_date + i;
--         -- Skip Sundays (PostgreSQL: Sunday is 0)
--         if extract(dow from d) <> 0 then
--             -- Iterate over predefined slot times
--             for t in select unnest(array[
--                 '09:00','09:30','10:00','10:30','11:00',
--                 '13:30','14:00','14:30','15:00'
--             ]::time[]) loop
--                 -- Insert slot with capacity 4, ignore if already exists
--                 insert into public.slots(service_id, office_id, slot_date, slot_time, capacity, remaining)
--                 values('passport', 'col-hq', d, t, 4, 4)
--                 on conflict (service_id, office_id, slot_date, slot_time) do nothing;
--             end loop;
--         end if;
--     end loop;
-- end $$;
-- End of slot seeding block
