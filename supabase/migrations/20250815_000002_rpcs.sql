-- Helper: random booking code
create or replace function public._rand_code(n int default 8)
returns text language sql as $$
  select substr(translate(encode(gen_random_bytes(64), 'base64'), '/+=', '___'), 1, n);
$$;

-- CREATE BOOKING (atomically reserve a seat)
create or replace function public.create_booking(p_service_id bigint, p_office_id bigint, p_slot_id bigint)
returns public.bookings
language plpgsql
security definer
set search_path = public
as $$
declare
  v_user uuid := auth.uid();
  v_slot record;
  v_booking public.bookings;
begin
  if v_user is null then
    raise exception 'UNAUTHENTICATED';
  end if;

  -- Prevent duplicates (active booking for same service in next 7 days)
  if exists (
    select 1 from public.bookings
    where citizen_id = v_user
      and service_id = p_service_id
      and status in ('booked','checked_in','rescheduled')
  ) then
    raise exception 'DUPLICATE_ACTIVE_BOOKING';
  end if;

  -- Lock slot row and check remaining
  select * into v_slot from public.slots
  where id = p_slot_id
  for update;
  if not found then
    raise exception 'SLOT_NOT_FOUND';
  end if;
  if v_slot.remaining <= 0 then
    raise exception 'SLOT_UNAVAILABLE';
  end if;

  -- Create booking + decrement remaining
  insert into public.bookings (citizen_id, service_id, office_id, slot_id, code)
  values (v_user, p_service_id, p_office_id, p_slot_id, _rand_code(10))
  returning * into v_booking;

  update public.slots set remaining = remaining - 1 where id = p_slot_id;

  return v_booking;
end $$;

-- RESCHEDULE (move booking to another slot)
create or replace function public.reschedule_booking(p_booking_id bigint, p_new_slot_id bigint)
returns public.bookings
language plpgsql security definer set search_path = public as $$
declare
  v_user uuid := auth.uid();
  v_b public.bookings;
  v_new record;
begin
  if v_user is null then raise exception 'UNAUTHENTICATED'; end if;

  select * into v_b from public.bookings where id = p_booking_id for update;
  if not found or v_b.citizen_id <> v_user then raise exception 'NOT_OWNER'; end if;
  if v_b.status <> 'booked' then raise exception 'NOT_RESCHEDULABLE'; end if;

  select * into v_new from public.slots where id = p_new_slot_id for update;
  if not found or v_new.remaining <= 0 then raise exception 'SLOT_UNAVAILABLE'; end if;

  -- increment old slot, decrement new
  update public.slots set remaining = remaining + 1 where id = v_b.slot_id;
  update public.slots set remaining = remaining - 1 where id = p_new_slot_id;

  update public.bookings
    set slot_id = p_new_slot_id, status = 'rescheduled', updated_at = now()
  where id = p_booking_id
  returning * into v_b;

  return v_b;
end $$;

-- CANCEL
create or replace function public.cancel_booking(p_booking_id bigint, p_reason text default null)
returns public.bookings
language plpgsql security definer set search_path = public as $$
declare
  v_user uuid := auth.uid();
  v_b public.bookings;
begin
  if v_user is null then raise exception 'UNAUTHENTICATED'; end if;

  select * into v_b from public.bookings where id = p_booking_id for update;
  if not found or v_b.citizen_id <> v_user then raise exception 'NOT_OWNER'; end if;
  if v_b.status not in ('booked','rescheduled') then raise exception 'NOT_CANCELABLE'; end if;

  -- release slot
  update public.slots set remaining = remaining + 1 where id = v_b.slot_id;

  update public.bookings
    set status = 'cancelled', updated_at = now()
  where id = p_booking_id
  returning * into v_b;

  insert into public.notification_log (booking_id, event, channel, status, provider_id)
  values (p_booking_id, 'booking.cancelled', 'email', 'queued', null);

  return v_b;
end $$;
