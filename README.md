# ORATRACK Real

Production-style rebuild of ORATRACK for Balili Elementary School.

This project is intentionally separate from the old prototype. It starts with
empty production data and prepares the app for Supabase Auth, PostgreSQL, RLS,
private storage, reports, Excel imports, and permission-aware AI assistance.

## Stack

- Next.js App Router, TypeScript, React, Tailwind CSS
- Supabase Auth, PostgreSQL, Storage, Row Level Security
- Zod validation
- PDFKit for initial PDF reports
- ExcelJS for import/export templates

## Local Setup

```bash
npm install
npm run dev
```

Copy `.env.example` to `.env.local` after the Supabase project exists:

```bash
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_ANON_KEY=
SUPABASE_SERVICE_ROLE_KEY=
NEXT_PUBLIC_SITE_URL=http://localhost:3000
OPENAI_API_KEY=
```

Do not expose `SUPABASE_SERVICE_ROLE_KEY` to the browser.

## Current State

- Public school website routes are scaffolded.
- Auth routes, role shells, and protected Admin/Teacher areas are scaffolded.
- Initial Supabase migration is in `supabase/migrations`.
- Production data is empty by design.
- AI endpoint is safe/stubbed until provider behavior is approved.
- Temporary report and Excel template endpoints are included.

## Intervention Points

You will need to provide or approve:

- Supabase project URL, anon key, service role key for local server use only
- Auth settings, invite/reset behavior, and optional admin MFA
- Attendance statuses, grading periods, subject list, rating scales, promotion rules
- Official certificate, report, and Excel templates
- Final AI write-confirmation policy and provider configuration
