-- Access fixes to resolve 42501 and ensure proper privileges alongside RLS
-- Schema usage
grant usage on schema public to anon;
grant usage on schema public to authenticated;

-- Public read models (catalog-like)
grant select on table public.departments to anon, authenticated;
grant select on table public.services to anon, authenticated;
grant select on table public.service_requirements to anon, authenticated;
grant select on table public.service_faqs to anon, authenticated;

-- Booking read models
grant select on table public.offices to anon, authenticated;
grant select on table public.slots to anon, authenticated;
-- View usage (if present)
do $$ begin
  if exists (select 1 from pg_views where schemaname = 'public' and viewname = 'daily_availability') then
    execute 'grant select on table public.daily_availability to anon, authenticated';
  end if;
end $$;

-- Authenticated user-owned tables (RLS enforced)
grant select, insert, update, delete on table public.profiles to authenticated;
grant select, insert, update, delete on table public.profile_photos to authenticated;
grant select, insert, update, delete on table public.saved_forms to authenticated;
grant select, insert, update, delete on table public.session_locks to authenticated;

-- Ensure future objects also have usage/select by default (optional best-effort)
alter default privileges in schema public grant select on tables to anon, authenticated;
alter default privileges in schema public grant usage on sequences to anon, authenticated;
