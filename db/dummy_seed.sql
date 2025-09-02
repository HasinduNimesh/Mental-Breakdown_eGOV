-- Dummy data seed for non-user and non-appointment tables
-- Safe to run on a fresh database. Avoid running repeatedly unless you want additional data.
-- This script intentionally SKIPS tables tied to users (auth.users) and appointment flows.
-- Covered tables: public.departments, public.offices, public.services
-- Skipped tables: department_admins, profiles, profile_documents, profile_photos,
--                 session_locks, saved_forms, slots, bookings, appointment_documents

begin;

-- Ensure we can generate UUIDs
create extension if not exists "pgcrypto";

-- =========================
-- Departments (100 rows)
-- =========================
insert into public.departments (id, name)
select gen_random_uuid(), format('Department %s', gs)
from generate_series(1, 100) gs;

-- =========================
-- Offices (300 rows)
-- =========================
insert into public.offices (id, name, city, timezone)
select
  format('office_%04s', gs) as id,
  format('Office %s', gs) as name,
  (array['Colombo','Kandy','Galle','Jaffna','Kurunegala','Anuradhapura','Batticaloa','Matara','Ratnapura','Trincomalee'])[(1 + floor(random()*10))::int] as city,
  'Asia/Colombo' as timezone
from generate_series(1, 300) gs;

-- =========================
-- Services (1000 rows)
-- =========================
with categories as (
  select unnest(array[
    'Registration','Licensing','Permits','Certificates','Tax','Education','Health','Transport','Land','Business',
    'Welfare','Identity','Civil','Trade','Customs','Tourism','Fisheries','Agriculture','Environment','IT'
  ]) as category
), popularity as (
  select unnest(array['high','medium','low']) as pop
)
insert into public.services (
  id, slug, title, short_description, category,
  is_online,
  processing_time_days_min, processing_time_days_max,
  fee_min, fee_max,
  popularity, default_location, updated_at, department_id
)
select
  format('svc_%05s', gs) as id,
  format('service-%05s', gs) as slug,
  format('Service %05s', gs) as title,
  format('Auto-generated description for service %05s', gs) as short_description,
  (select category from categories order by random() limit 1) as category,
  (random() < 0.7) as is_online,
  t.pmin as processing_time_days_min,
  (t.pmin + t.padd) as processing_time_days_max,
  f.base as fee_min,
  (f.base + f.delta) as fee_max,
  (select pop from popularity order by random() limit 1) as popularity,
  (array['Colombo','Kandy','Galle','Jaffna','Kurunegala','Anuradhapura','Batticaloa','Matara','Ratnapura','Trincomalee'])[(1 + floor(random()*10))::int] as default_location,
  now() - ((random()*120)::int || ' days')::interval as updated_at,
  d.id as department_id
from generate_series(1, 1000) gs
cross join lateral (
  select id from public.departments order by random() limit 1
) d
cross join lateral (
  select round((random()*10000)::numeric, 2) as base,
         round((random()*15000)::numeric, 2) as delta
) f
cross join lateral (
  select (1 + (random()*20)::int) as pmin,
         (5 + (random()*40)::int) as padd
) t;

commit;

-- How to run (from psql):
-- \i db/dummy_seed.sql
-- Or via Supabase SQL editor: paste and execute.
