# ORATRACK Phase Map

## Phase 0 - Fresh Project Foundation

Done in this scaffold:

- Next.js, TypeScript, Tailwind, ESLint, Prettier
- App Router route groups for public, auth, admin, and teacher areas
- Shared public and protected layouts
- Environment template

## Phase 1 - Database Architecture

Done as initial architecture:

- `supabase/migrations/001_initial_schema.sql`
- Normalized learner identity and yearly enrollments
- Attendance, grades, literacy/numeracy, risk, interventions, certificates,
  lesson plans, reports, AI logs, announcements, and audit logs

Needs Supabase intervention:

- Create Supabase project
- Apply migration
- Generate database types from Supabase once live

## Phase 2 - Auth, Roles, and Security Base

Done as scaffold:

- Supabase server/browser client helpers
- Login and reset-password routes
- Next.js 16 `proxy.ts` for protected route checks
- Server-side session and role helpers
- RLS policy foundation in migration

Needs Supabase intervention:

- Configure auth email settings
- Decide invite emails vs temporary passwords
- Create first Admin/Principal account

## Phase 3 - Public Landing Page

Done:

- Home, About, Announcements, Events, Programs, Contact
- DepEd/FB link slots
- Empty public content states

Needs content intervention:

- Official school copy, contact details, and Facebook URL

## Phases 4-16 - School Modules

Scaffolded as real routes with empty states:

- Admin school setup
- User management
- Learner repository
- Promotion/class assignment
- Attendance monitoring
- Grades and Excel import
- Literacy/numeracy
- Risk/interventions
- AI assistant
- Certificates/templates
- Lesson plan repository
- Analytics dashboard
- Automated reports

Next implementation pass after Supabase setup:

- Replace module empty states with data queries
- Add server actions per module
- Insert audit logs for every sensitive mutation
- Add Excel import preview and validation persistence
- Add PDF/Excel exports with approved templates

## Phases 17-19 - Hardening, QA, Deployment

Prepared:

- Security review checklist in `docs/SECURITY.md`
- Vercel/Supabase-ready env structure

Not yet possible without live project:

- RLS smoke tests
- Storage signed URL verification
- Auth email flow test
- Production deployment smoke test
