-- Patch schema to align with Citizen App expectations
-- Safe to run repeatedly; conditional drops are guarded.
-- Focus: fix bookings <-> slots FK, add slots unique key, and helpful indexes & RLS defaults.

begin;

-- 1) Ensure composite uniqueness for slots (service_id, office_id, slot_date, slot_time)
-- Add the unique constraint if missing
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint c
    JOIN pg_class t ON t.oid = c.conrelid
    WHERE t.relname = 'slots' AND c.contype = 'u' AND c.conname = 'uq_slot'
  ) THEN
    ALTER TABLE public.slots
      ADD CONSTRAINT uq_slot UNIQUE (service_id, office_id, slot_date, slot_time);
  END IF;
END $$;

-- 2) Remove any incorrect FK constraints on bookings -> slots and add the correct composite FK
DO $$
DECLARE
  r RECORD;
BEGIN
  FOR r IN
    SELECT c.conname
    FROM pg_constraint c
    JOIN pg_class t ON t.oid = c.conrelid
    WHERE t.relname = 'bookings' AND c.contype = 'f'
  LOOP
    EXECUTE format('ALTER TABLE public.bookings DROP CONSTRAINT IF EXISTS %I', r.conname);
  END LOOP;

  -- Add the correct composite FK (will fail if columns missing)
  ALTER TABLE public.bookings
    ADD CONSTRAINT fk_bookings_slot
    FOREIGN KEY (service_id, office_id, slot_date, slot_time)
    REFERENCES public.slots(service_id, office_id, slot_date, slot_time)
    ON UPDATE CASCADE ON DELETE RESTRICT;
END $$;

-- 3) Helpful indexes used by the app when querying slots
CREATE INDEX IF NOT EXISTS slots_by_service_office_date ON public.slots(service_id, office_id, slot_date);
CREATE INDEX IF NOT EXISTS services_by_updated_at ON public.services(updated_at DESC);
CREATE INDEX IF NOT EXISTS services_by_popularity ON public.services(popularity);

-- 4) Ensure bookings.booking_code is unique (already present in many schemas)
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint c
    JOIN pg_class t ON t.oid = c.conrelid
    WHERE t.relname = 'bookings' AND c.contype = 'u' AND c.conname = 'bookings_booking_code_key'
  ) THEN
    ALTER TABLE public.bookings
      ADD CONSTRAINT bookings_booking_code_key UNIQUE (booking_code);
  END IF;
END $$;

commit;

-- How to run:
-- psql:    \i db/patch_citizen_schema.sql
-- Supabase SQL editor: paste and execute.
