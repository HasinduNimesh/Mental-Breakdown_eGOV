-- Minimal seed data for local testing
insert into public.departments (name) values ('Department of Motor Traffic') on conflict do nothing;
insert into public.departments (name) values ('Department of Immigration & Emigration') on conflict do nothing;

insert into public.offices (name, address, tz) values ('Colombo Main Office','Colombo 01','Asia/Colombo') on conflict do nothing;

-- Map names to ids
with d as (
  select id from public.departments where name='Department of Immigration & Emigration'
), o as (
  select id from public.offices where name='Colombo Main Office'
)
insert into public.services (department_id, name, description, duration_minutes, is_online)
select d.id, 'Passport Application', 'Apply or renew passport', 15, true from d
on conflict do nothing;

-- Create a couple of slots for today/tomorrow
with s as (
  select id from public.services where name='Passport Application'
), o as (
  select id from public.offices where name='Colombo Main Office'
)
insert into public.slots (office_id, service_id, starts_at, ends_at, capacity, remaining)
select o.id, s.id, now() + interval '1 day', now() + interval '1 day' + interval '15 min', 5, 5 from s, o
union all
select o.id, s.id, now() + interval '2 days', now() + interval '2 days' + interval '15 min', 5, 5 from s, o;
