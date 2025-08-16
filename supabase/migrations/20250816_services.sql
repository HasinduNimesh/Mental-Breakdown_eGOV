-- Services schema for eGOV portal
create table if not exists departments (
  id uuid primary key default gen_random_uuid(),
  name text not null unique
);

create table if not exists services (
  id uuid primary key default gen_random_uuid(),
  slug text not null unique,
  title text not null,
  short_description text,
  category text not null,
  department_id uuid references departments(id) on delete set null,
  is_online boolean not null default true,
  processing_time_days_min int,
  processing_time_days_max int,
  fee_min numeric,
  fee_max numeric,
  popularity text check (popularity in ('high','medium','low')) default 'medium',
  default_location text,
  updated_at timestamptz not null default now()
);

create table if not exists service_requirements (
  id uuid primary key default gen_random_uuid(),
  service_id uuid not null references services(id) on delete cascade,
  label text not null,
  example text
);

create table if not exists service_faqs (
  id uuid primary key default gen_random_uuid(),
  service_id uuid not null references services(id) on delete cascade,
  question text not null,
  answer text not null
);

-- RLS
alter table departments enable row level security;
alter table services enable row level security;
alter table service_requirements enable row level security;
alter table service_faqs enable row level security;

-- Public read policies (DROP+CREATE to be idempotent; IF NOT EXISTS is not supported on CREATE POLICY)
drop policy if exists "read_public_departments" on public.departments;
create policy "read_public_departments" on public.departments for select using (true);

drop policy if exists "read_public_services" on public.services;
create policy "read_public_services" on public.services for select using (true);

drop policy if exists "read_public_service_requirements" on public.service_requirements;
create policy "read_public_service_requirements" on public.service_requirements for select using (true);

drop policy if exists "read_public_service_faqs" on public.service_faqs;
create policy "read_public_service_faqs" on public.service_faqs for select using (true);

-- Seed minimal data
insert into departments (name) values
  ('Department of Immigration & Emigration') on conflict do nothing;
insert into departments (name) values
  ('Department of Motor Traffic') on conflict do nothing;
insert into departments (name) values
  ('Registrar General Department') on conflict do nothing;

-- Seed services using inline subqueries for department IDs (avoids CTE scope issues)
insert into services (slug, title, short_description, category, department_id, is_online, processing_time_days_min, processing_time_days_max, fee_min, fee_max, popularity, default_location)
select 'passport-application','Passport Application','Apply for new passport or renew existing passport','immigration',
  (select id from departments where name = 'Department of Immigration & Emigration'),
  true, 7, 14, 3500, 9000, 'high','Colombo'
on conflict do nothing;

insert into services (slug, title, short_description, category, department_id, is_online, processing_time_days_min, processing_time_days_max, fee_min, fee_max, popularity, default_location)
select 'driving-license','Driving License Services','Apply for, renew, or duplicate driving license','transport',
  (select id from departments where name = 'Department of Motor Traffic'),
  true, 1, 3, 500, 2500, 'high','Werahera'
on conflict do nothing;

insert into services (slug, title, short_description, category, department_id, is_online, processing_time_days_min, processing_time_days_max, fee_min, fee_max, popularity, default_location)
select 'birth-certificate','Birth Certificate','Get certified copies of birth certificates','documents',
  (select id from departments where name = 'Registrar General Department'),
  true, 2, 5, 100, 500, 'high','Nationwide'
on conflict do nothing;
