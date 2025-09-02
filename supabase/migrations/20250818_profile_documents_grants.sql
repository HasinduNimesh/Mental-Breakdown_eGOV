-- Ensure authenticated role has required privileges on profile_documents (alongside RLS)
-- Safe to run multiple times.

-- Explicit table grants (RLS still enforces row access)
grant select, insert, update, delete on table public.profile_documents to authenticated;

-- Sequence grant to avoid 42501 on inserts
grant usage, select on sequence public.profile_documents_id_seq to authenticated;

-- Appointment documents (prevent future permission errors when attaching docs to bookings)
grant select, insert, update, delete on table public.appointment_documents to authenticated;
grant usage, select on sequence public.appointment_documents_id_seq to authenticated;
