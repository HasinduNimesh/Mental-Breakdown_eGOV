-- Ensure policies that reference department_admins can be evaluated by authenticated users
-- Without this grant, queries/updates on other tables whose RLS policies JOIN department_admins
-- can error with: "permission denied for table department_admins"
grant select on table public.department_admins to authenticated;

-- Optional: if you have admin UIs for anonymous browsing that also touch policies
-- uncomment if needed
-- grant select on table public.department_admins to anon;
