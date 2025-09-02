-- Seed time slots for services across offices
-- Generates slots for each service in 2 random offices, for the next 14 days
-- Times per day: 09:00, 10:00, 11:00, 13:00, 14:00, 15:00
-- Capacity is 5-20; remaining = capacity
-- Safe to run multiple times (uses ON CONFLICT DO NOTHING)

begin;

-- Choose the daily times to schedule
with times as (
  select unnest(array['09:00','10:00','11:00','13:00','14:00','15:00']::time[]) as slot_time
),
services as (
  select id from public.services
),
service_offices as (
  -- pick 2 random offices per service
  select s.id as service_id,
         (select o.id from public.offices o order by random() limit 1) as office_id1,
         (select o.id from public.offices o order by random() limit 1) as office_id2
  from services s
),
dates as (
  -- next 14 days including today
  select (current_date + gs) as slot_date
  from generate_series(0, 13) as gs
)
insert into public.slots (service_id, office_id, slot_date, slot_time, capacity, remaining)
select so.service_id,
       o.office_id,
       d.slot_date::date,
       t.slot_time,
       cap.capacity,
       cap.capacity
from service_offices so
cross join lateral (
  select unnest(array[so.office_id1, so.office_id2]) as office_id
) o
cross join dates d
cross join times t
cross join lateral (
  select (5 + floor(random()*16))::int as capacity
) cap
on conflict (service_id, office_id, slot_date, slot_time) do nothing;

commit;

-- How to run:
-- psql:    \i db/seed_slots.sql
-- Supabase: paste into SQL editor and execute.
