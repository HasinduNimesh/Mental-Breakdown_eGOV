# GovOff — Government Officer Console

A Next.js app for officers to view, manage, and confirm appointments, review pre-submitted documents, and notify citizens for corrections.

## Features
- Dashboard of today/upcoming appointments
- Booking detail with document list and status updates
- Mark documents as Needs fix and notify citizen (via main API)

## Run
- Env (reuse root .env.local where NEXT_PUBLIC_SUPABASE_URL/ANON are set)
- Dev: npm run dev -w apps/govoff

## Notes
- Uses public Supabase client; officer auth/roles should be enforced via RLS (not included here).
- Document view links are placeholders; replace with signed URL generation.