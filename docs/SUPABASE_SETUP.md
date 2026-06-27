# Supabase Setup

## User Intervention Required

Create a Supabase project and provide these values locally in `.env.local`:

- `NEXT_PUBLIC_SUPABASE_URL`
- `NEXT_PUBLIC_SUPABASE_ANON_KEY`
- `SUPABASE_SERVICE_ROLE_KEY`

The service role key is for server-side account administration only. Never expose
it in browser code or screenshots.

## Apply Migration

After installing/configuring the Supabase CLI:

```bash
supabase link --project-ref <project-ref>
supabase db push
```

Then generate live TypeScript database types:

```bash
supabase gen types typescript --linked > src/types/database.generated.ts
```

The current `src/types/database.ts` is a starter type file for local development.
Replace or merge it after the live schema is available.

## First Admin Account

The first Admin/Principal account needs a bootstrap step because RLS expects an
admin profile to create other profiles. Recommended options:

- Use Supabase SQL editor to insert the first `profiles` row after creating the
  auth user.
- Or add a one-time local bootstrap script that uses `SUPABASE_SERVICE_ROLE_KEY`.

Do this only locally or in a controlled deployment environment.

## Storage Buckets

The migration creates private buckets:

- `lesson-plans`
- `generated-reports`
- `certificates`

Files should be accessed with signed URLs, not public URLs.
