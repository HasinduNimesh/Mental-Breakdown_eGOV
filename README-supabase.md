# Supabase Backend (Citizen-side) - Local Setup

## Prereqs
- Docker Desktop running
- Node 18+
- Supabase CLI: `npm i -g supabase`

## Initialize (first time)
1. `supabase init` (creates `./supabase`)
2. `supabase start` (starts local Postgres/Auth/Storage/Studio)
3. Copy env values to `.env.local`:
   - `NEXT_PUBLIC_SUPABASE_URL` and `NEXT_PUBLIC_SUPABASE_ANON_KEY` from `supabase status`

## Apply schema & seeds
- Open Studio SQL and paste the migrations SQL from `supabase/migrations/*` in order
  or run `psql` to apply.
- Apply `supabase/seed.sql` to populate minimal data.

## Next.js client
`npm i @supabase/supabase-js`
Create client in `src/lib/supabaseClient.ts` and use it across the app.

## Functions
Use `supabase functions new <name>` to scaffold edge functions:
- booking-create, booking-reschedule, booking-cancel
- doc-presign, doc-complete
- checkin, reminders-24h, reminders-2h

Run locally:
- `supabase functions serve booking-create --no-verify-jwt`

## Notes
- Writes (bookings/documents) should call RPCs or Edge Functions.
- RLS protects user data; profile is owner-only.
- Realtime can be enabled on bookings for kiosk screens later.
