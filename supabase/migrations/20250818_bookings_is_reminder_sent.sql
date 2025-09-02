-- Add is_reminder_sent column to bookings and grant privileges
-- Note: If this column already exists in your environment, apply this manually or adjust as needed.
alter table public.bookings
  add column is_reminder_sent boolean not null default false;

-- Ensure authenticated can select/update their own rows (RLS will restrict rows)
grant select, update on table public.bookings to authenticated;

-- Optional: allow insert via RPC/edge function roles; direct inserts remain controlled by RLS
grant insert on table public.bookings to authenticated;
