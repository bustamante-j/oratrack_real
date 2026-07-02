# Security Baseline

## Implemented Early

- Supabase Auth integration points
- Server-side session and role checks
- Next.js 16 `proxy.ts` for route-level protection
- RLS helper functions and starter table policies
- Private Supabase Storage buckets
- Audit log table and per-module audit event map
- Zod validation for auth, learner, attendance, grade import, intervention,
  certificate, and AI draft inputs
- No fake learner data seeded

## Sensitive Data

Treat these as sensitive:

- Learner records and guardians
- Attendance records and risk flags
- Grades and import errors
- Literacy/numeracy ratings
- Intervention notes
- Generated reports and certificates
- AI prompts and outputs tied to records

## AI Rules

Current default:

- Read-only by default
- Permission-scoped through the logged-in user
- No direct writes
- Proposed writes require user confirmation
- AI activity should be logged
- Uses an ORATRACK-specific training layer for roles, workflows, record types,
  writing style, and safety rules
- Stores runtime metadata such as draft mode, model target, scope kind, and
  training version in AI activity logs

Current model/provider notes:

- Provider target: OpenAI
- Default model target: `gpt-5.5`
- Model override variable: `OPENAI_MODEL`
- Provider key variable: `OPENAI_API_KEY`
- Current behavior remains safe draft mode; the assistant must not be described
  as an autonomous writer or fine-tuned private model

## Review Before Production

- Confirm every server action checks authorization before mutation
- Confirm RLS policy behavior with Admin, Adviser, and Subject Teacher test users
- Confirm file upload type/size restrictions
- Confirm signed URL expiration rules
- Confirm backup and restore plan
- Confirm privacy notice and data retention wording
- Confirm official report/certificate templates
