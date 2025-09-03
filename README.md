# eGOV Monorepo – Runbook and Config

This repository is a monorepo containing multiple Next.js apps and shared packages:

- Citizen Portal (root app, Next.js)
- Admin Portal (`apps/admin`)
- Analytics Dashboard (`apps/analytics_dashboard`)
- Shared packages (`packages/*`)
- Database SQL (`db/`) for Supabase Postgres (RLS-enabled)

This guide shows how to run locally (Windows-friendly), how to configure environment variables, and how to use Docker Compose.

## Prerequisites

- Node.js 20+
- npm 10+
- Supabase project (hosted) or Supabase CLI for local stack
- Git

Optional (handy):
- Supabase CLI (for dumps/migrations): `npx @supabase/cli@latest --version`

## Project structure

- Root Next.js app (citizen portal) in `src/` + `pages/`
- Admin app in `apps/admin`
- Analytics app in `apps/analytics_dashboard`
- SQL in `db/used_schema.sql` (authoritative) and `db/schema.sql` (legacy/basic)

## Environment variables

Copy `.env.local.example` to `.env.local` at repo root and fill:

- NEXT_PUBLIC_SUPABASE_URL=…
- NEXT_PUBLIC_SUPABASE_ANON_KEY=…
- Optional:
  - NEXT_PUBLIC_DEFAULT_TIMEZONE=Asia/Colombo
  - NEXT_PUBLIC_DEFAULT_LOCALE=en
  - NEXT_PUBLIC_SUPPORTED_LOCALES=en,si,ta
  - NEXT_PUBLIC_PROFILE_DOCS_BUCKET=user-docs
  - NEXT_PUBLIC_APPOINTMENT_DOCS_BUCKET=appointment-docs

Keep service-role keys server-only (don’t put in public envs).

## Database setup (Supabase)

Recommended: use hosted Supabase (free plan OK).

- Create a new project in Supabase
- Open SQL editor and run `db/used_schema.sql` (idempotent; includes RLS, views, policies)
- If you see “uuid = text” errors on legacy installs, clean data or rerun the guarded script
- Seed `department_admins` as needed to grant department-scoped admin access

Local stack (optional): use Supabase CLI

- `npx @supabase/cli@latest login`
- `npx @supabase/cli@latest start` (runs dockerized local stack)
- Apply SQL in the local SQL editor or via `psql`

## Run locally without Docker

- Install deps at repo root:
  - PowerShell:
    ```powershell
    npm install
    ```
- Start all apps in parallel:
  - PowerShell:
    ```powershell
    npm run repo:dev
    ```
- Apps will be available at:
  - Citizen portal: http://localhost:3000
  - Admin portal: http://localhost:3002
  - Analytics dashboard: http://localhost:3003

Run a single app:
- Admin only:
  ```powershell
  cd apps/admin
  npm run dev
  ```
- Analytics only:
  ```powershell
  npm run dev:analytics
  ```

## Docker Compose (dev)

Use Docker to run the monorepo dev servers inside a container, mapping your ports. This setup uses your hosted/local Supabase via the `.env.local` env file.

- Ensure `.env.local` exists at the repo root.
- Start with Docker Compose:
  ```powershell
  docker compose up --build
  ```
- Access:
  - Citizen: http://localhost:3000
  - Admin: http://localhost:3002
  - Analytics: http://localhost:3003

Notes:
- This compose runs dev mode with HMR using `turbo run dev`.
- It does not start a Supabase database. Use a hosted Supabase or `supabase start` locally.

## Database dump (free plan)

Use Supabase CLI (works on free plan):
- PowerShell:
  ```powershell
  npx @supabase/cli@latest login
  npx @supabase/cli@latest link --project-ref YOUR_PROJECT_REF
  npx @supabase/cli@latest db dump -f .\your-project-dump.sql
  ```
Zip and share:
```powershell
Compress-Archive -Path .\your-project-dump.sql -DestinationPath .\your-project-dump.zip
```
Upload to Drive/Supabase Storage and share a link.

## Troubleshooting

- Ports busy: stop local node processes using 3000/3002/3003 or change ports in app scripts.
- Supabase env missing: the apps will run, but data calls return empty structures (Analytics falls back gracefully).
- SQL errors: run `db/used_schema.sql` in order; fix any legacy non-UUID IDs as noted in comments.

Admin API 500 on /api/bookings:
- Ensure `apps/admin/.env.local` contains SUPABASE_SERVICE_ROLE_KEY along with NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY.
- If your schema doesn’t have relationships from bookings -> services/offices, the API auto-falls back to a flat select. Apply `db/used_schema.sql` to get the expected shape.

---

Happy hacking! PRs welcome.
