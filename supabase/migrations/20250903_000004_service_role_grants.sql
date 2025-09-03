-- Ensure the service_role (used by SUPABASE_SERVICE_ROLE_KEY) can access schema public
-- Fixes errors like: permission denied for schema public (code 42501) when calling REST with service key
begin;

grant usage on schema public to service_role;

-- Broad table privileges for service role (RLS is bypassed by service_role regardless)
grant select, insert, update, delete on all tables in schema public to service_role;

-- Sequences and functions
grant usage, select, update on all sequences in schema public to service_role;
grant execute on all functions in schema public to service_role;

-- Make future objects automatically accessible by service_role
alter default privileges in schema public grant select, insert, update, delete on tables to service_role;
alter default privileges in schema public grant usage, select, update on sequences to service_role;
alter default privileges in schema public grant execute on functions to service_role;

commit;
