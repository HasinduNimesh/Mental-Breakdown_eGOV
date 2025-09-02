-- Grant sequence privileges required for inserts into bigserial tables under RLS
-- Fixes: permission denied for sequence profile_photos_id_seq

-- Ensure existing sequences are accessible to the authenticated role
do $$ begin
  if exists (
    select 1 from pg_class c
    join pg_namespace n on n.oid = c.relnamespace
    where c.relkind = 'S' and n.nspname = 'public' and c.relname = 'profile_photos_id_seq'
  ) then
    execute 'grant usage, select on sequence public.profile_photos_id_seq to authenticated';
  end if;
end $$;

do $$ begin
  if exists (
    select 1 from pg_class c
    join pg_namespace n on n.oid = c.relnamespace
    where c.relkind = 'S' and n.nspname = 'public' and c.relname = 'saved_forms_id_seq'
  ) then
    execute 'grant usage, select on sequence public.saved_forms_id_seq to authenticated';
  end if;
end $$;

-- Keep defaults for future sequences too (no-op if already set)
alter default privileges in schema public grant usage on sequences to authenticated;