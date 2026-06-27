create extension if not exists pgcrypto;

create type public.app_role as enum (
  'admin_principal',
  'adviser',
  'subject_teacher'
);

create type public.account_status as enum ('active', 'inactive');
create type public.school_year_status as enum ('draft', 'active', 'closed');
create type public.learner_status as enum ('active', 'inactive', 'archived', 'transferred');
create type public.attendance_status as enum ('present', 'absent', 'late', 'excused', 'half_day');
create type public.rating_level as enum ('beginning', 'developing', 'proficient', 'advanced');
create type public.intervention_status as enum ('planned', 'ongoing', 'completed', 'cancelled');
create type public.risk_type as enum ('attendance', 'academic', 'literacy', 'numeracy', 'manual');
create type public.risk_severity as enum ('low', 'moderate', 'high', 'critical');
create type public.certificate_type as enum ('recognition', 'completion');
create type public.lesson_plan_status as enum ('uploaded', 'replaced', 'reviewed', 'archived');

create table public.profiles (
  user_id uuid primary key references auth.users (id) on delete cascade,
  email text unique,
  full_name text,
  role public.app_role not null default 'subject_teacher',
  status public.account_status not null default 'active',
  phone text,
  avatar_path text,
  last_login_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.teacher_profiles (
  profile_id uuid primary key references public.profiles (user_id) on delete cascade,
  employee_number text unique,
  position_title text,
  grade_specialization text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.school_years (
  id uuid primary key default gen_random_uuid(),
  name text not null unique,
  starts_on date not null,
  ends_on date not null,
  status public.school_year_status not null default 'draft',
  created_by uuid references public.profiles (user_id),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint school_year_dates_valid check (starts_on < ends_on)
);

create unique index one_active_school_year
on public.school_years ((status))
where status = 'active';

create table public.grade_levels (
  id smallint generated always as identity primary key,
  grade_number smallint not null unique,
  label text not null unique,
  sort_order smallint not null unique
);

insert into public.grade_levels (grade_number, label, sort_order)
values
  (0, 'Kindergarten', 0),
  (1, 'Grade 1', 1),
  (2, 'Grade 2', 2),
  (3, 'Grade 3', 3),
  (4, 'Grade 4', 4),
  (5, 'Grade 5', 5),
  (6, 'Grade 6', 6);

create table public.sections (
  id uuid primary key default gen_random_uuid(),
  school_year_id uuid not null references public.school_years (id) on delete cascade,
  grade_level_id smallint not null references public.grade_levels (id),
  name text not null,
  adviser_id uuid references public.profiles (user_id),
  room text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (school_year_id, grade_level_id, name)
);

create table public.subjects (
  id uuid primary key default gen_random_uuid(),
  grade_level_id smallint references public.grade_levels (id),
  code text not null unique,
  name text not null,
  is_active boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.section_subjects (
  id uuid primary key default gen_random_uuid(),
  section_id uuid not null references public.sections (id) on delete cascade,
  subject_id uuid not null references public.subjects (id),
  teacher_id uuid references public.profiles (user_id),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (section_id, subject_id)
);

create table public.teacher_assignments (
  id uuid primary key default gen_random_uuid(),
  teacher_id uuid not null references public.profiles (user_id) on delete cascade,
  school_year_id uuid not null references public.school_years (id) on delete cascade,
  role public.app_role not null,
  grade_level_id smallint references public.grade_levels (id),
  section_id uuid references public.sections (id) on delete cascade,
  subject_id uuid references public.subjects (id),
  starts_on date,
  ends_on date,
  created_by uuid references public.profiles (user_id),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.learners (
  id uuid primary key default gen_random_uuid(),
  lrn text not null unique,
  first_name text not null,
  middle_name text,
  last_name text not null,
  extension_name text,
  sex text not null check (sex in ('female', 'male')),
  birth_date date not null,
  address text,
  status public.learner_status not null default 'active',
  archived_at timestamptz,
  created_by uuid references public.profiles (user_id),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.learner_guardians (
  id uuid primary key default gen_random_uuid(),
  learner_id uuid not null references public.learners (id) on delete cascade,
  full_name text not null,
  relationship text not null,
  phone text,
  email text,
  address text,
  is_primary boolean not null default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.learner_enrollments (
  id uuid primary key default gen_random_uuid(),
  learner_id uuid not null references public.learners (id) on delete cascade,
  school_year_id uuid not null references public.school_years (id) on delete cascade,
  grade_level_id smallint not null references public.grade_levels (id),
  section_id uuid references public.sections (id),
  enrollment_status text not null default 'enrolled',
  promoted_from_enrollment_id uuid references public.learner_enrollments (id),
  enrolled_on date not null default current_date,
  created_by uuid references public.profiles (user_id),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (learner_id, school_year_id)
);

create table public.attendance_dates (
  id uuid primary key default gen_random_uuid(),
  school_year_id uuid not null references public.school_years (id) on delete cascade,
  section_id uuid not null references public.sections (id) on delete cascade,
  attendance_on date not null,
  created_by uuid references public.profiles (user_id),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (section_id, attendance_on)
);

create table public.attendance_records (
  id uuid primary key default gen_random_uuid(),
  attendance_date_id uuid not null references public.attendance_dates (id) on delete cascade,
  enrollment_id uuid not null references public.learner_enrollments (id) on delete cascade,
  am_status public.attendance_status not null default 'present',
  pm_status public.attendance_status not null default 'present',
  remarks text,
  recorded_by uuid references public.profiles (user_id),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (attendance_date_id, enrollment_id)
);

create table public.grade_periods (
  id uuid primary key default gen_random_uuid(),
  school_year_id uuid references public.school_years (id) on delete cascade,
  code text not null,
  name text not null,
  sort_order smallint not null,
  starts_on date,
  ends_on date,
  unique (school_year_id, code)
);

create table public.grade_import_batches (
  id uuid primary key default gen_random_uuid(),
  school_year_id uuid not null references public.school_years (id),
  section_id uuid not null references public.sections (id),
  subject_id uuid not null references public.subjects (id),
  imported_by uuid not null references public.profiles (user_id),
  source_file_path text,
  status text not null default 'pending_review',
  row_count integer not null default 0,
  error_count integer not null default 0,
  created_at timestamptz not null default now()
);

create table public.grades (
  id uuid primary key default gen_random_uuid(),
  enrollment_id uuid not null references public.learner_enrollments (id) on delete cascade,
  subject_id uuid not null references public.subjects (id),
  grade_period_id uuid not null references public.grade_periods (id),
  numeric_grade numeric(5,2) not null check (numeric_grade between 0 and 100),
  remarks text,
  encoded_by uuid references public.profiles (user_id),
  batch_id uuid references public.grade_import_batches (id),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (enrollment_id, subject_id, grade_period_id)
);

create table public.grade_import_errors (
  id uuid primary key default gen_random_uuid(),
  batch_id uuid not null references public.grade_import_batches (id) on delete cascade,
  row_number integer not null,
  field_name text,
  message text not null,
  raw_value jsonb,
  created_at timestamptz not null default now()
);

create table public.literacy_numeracy_records (
  id uuid primary key default gen_random_uuid(),
  enrollment_id uuid not null references public.learner_enrollments (id) on delete cascade,
  school_year_id uuid not null references public.school_years (id),
  literacy_rating public.rating_level not null,
  numeracy_rating public.rating_level not null,
  remarks text,
  encoded_by uuid references public.profiles (user_id),
  encoded_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (enrollment_id, school_year_id)
);

create table public.risk_flags (
  id uuid primary key default gen_random_uuid(),
  learner_id uuid not null references public.learners (id) on delete cascade,
  enrollment_id uuid references public.learner_enrollments (id) on delete cascade,
  risk_type public.risk_type not null,
  severity public.risk_severity not null default 'moderate',
  reason text not null,
  detected_at timestamptz not null default now(),
  resolved_at timestamptz,
  created_by uuid references public.profiles (user_id)
);

create table public.interventions (
  id uuid primary key default gen_random_uuid(),
  learner_id uuid not null references public.learners (id) on delete cascade,
  enrollment_id uuid references public.learner_enrollments (id) on delete set null,
  teacher_id uuid not null references public.profiles (user_id),
  category text not null,
  status public.intervention_status not null default 'planned',
  started_on date not null default current_date,
  follow_up_on date,
  notes text not null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.intervention_updates (
  id uuid primary key default gen_random_uuid(),
  intervention_id uuid not null references public.interventions (id) on delete cascade,
  status public.intervention_status,
  notes text not null,
  follow_up_on date,
  created_by uuid not null references public.profiles (user_id),
  created_at timestamptz not null default now()
);

create table public.certificate_templates (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  certificate_type public.certificate_type not null,
  template_payload jsonb not null default '{}'::jsonb,
  is_active boolean not null default true,
  created_by uuid references public.profiles (user_id),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.generated_certificates (
  id uuid primary key default gen_random_uuid(),
  certificate_template_id uuid references public.certificate_templates (id),
  enrollment_id uuid not null references public.learner_enrollments (id),
  certificate_type public.certificate_type not null,
  file_path text,
  generated_by uuid not null references public.profiles (user_id),
  generated_at timestamptz not null default now()
);

create table public.uploaded_files (
  id uuid primary key default gen_random_uuid(),
  bucket_id text not null,
  object_path text not null,
  original_filename text not null,
  mime_type text not null,
  byte_size bigint not null check (byte_size >= 0),
  uploaded_by uuid not null references public.profiles (user_id),
  created_at timestamptz not null default now()
);

create table public.lesson_plans (
  id uuid primary key default gen_random_uuid(),
  school_year_id uuid not null references public.school_years (id),
  grade_level_id smallint references public.grade_levels (id),
  subject_id uuid references public.subjects (id),
  teacher_id uuid not null references public.profiles (user_id),
  title text not null,
  file_id uuid references public.uploaded_files (id),
  status public.lesson_plan_status not null default 'uploaded',
  reviewed_by uuid references public.profiles (user_id),
  reviewed_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.report_exports (
  id uuid primary key default gen_random_uuid(),
  report_type text not null,
  scope jsonb not null default '{}'::jsonb,
  file_path text,
  exported_by uuid not null references public.profiles (user_id),
  exported_at timestamptz not null default now()
);

create table public.ai_activity_logs (
  id uuid primary key default gen_random_uuid(),
  actor_id uuid not null references public.profiles (user_id),
  intent text not null,
  scope jsonb not null default '{}'::jsonb,
  prompt_excerpt text,
  output_excerpt text,
  proposed_action jsonb,
  user_confirmed boolean not null default false,
  created_at timestamptz not null default now()
);

create table public.public_announcements (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  body text not null,
  published_at timestamptz,
  created_by uuid references public.profiles (user_id),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.public_events (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  body text,
  starts_at timestamptz not null,
  ends_at timestamptz,
  published_at timestamptz,
  created_by uuid references public.profiles (user_id),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.audit_logs (
  id uuid primary key default gen_random_uuid(),
  actor_id uuid references public.profiles (user_id),
  action text not null,
  entity_table text not null,
  entity_id uuid,
  metadata jsonb not null default '{}'::jsonb,
  ip_address inet,
  user_agent text,
  created_at timestamptz not null default now()
);

create or replace function public.touch_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

create or replace function public.current_app_role()
returns public.app_role
language sql
stable
security definer
set search_path = public
as $$
  select role from public.profiles
  where user_id = auth.uid() and status = 'active'
$$;

create or replace function public.is_active_staff()
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (
    select 1 from public.profiles
    where user_id = auth.uid() and status = 'active'
  )
$$;

create or replace function public.is_admin()
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select public.current_app_role() = 'admin_principal'
$$;

create or replace function public.can_access_section(section_uuid uuid)
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select public.is_admin()
    or exists (
      select 1 from public.sections s
      where s.id = section_uuid and s.adviser_id = auth.uid()
    )
    or exists (
      select 1 from public.section_subjects ss
      where ss.section_id = section_uuid and ss.teacher_id = auth.uid()
    )
$$;

create or replace function public.can_access_enrollment(enrollment_uuid uuid)
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select public.is_admin()
    or exists (
      select 1
      from public.learner_enrollments le
      where le.id = enrollment_uuid
        and public.can_access_section(le.section_id)
    )
$$;

create or replace function public.can_access_learner(learner_uuid uuid)
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select public.is_admin()
    or exists (
      select 1
      from public.learner_enrollments le
      where le.learner_id = learner_uuid
        and public.can_access_enrollment(le.id)
    )
$$;

do $$
declare
  table_name text;
begin
  foreach table_name in array array[
    'profiles',
    'teacher_profiles',
    'school_years',
    'sections',
    'subjects',
    'section_subjects',
    'teacher_assignments',
    'learners',
    'learner_guardians',
    'learner_enrollments',
    'attendance_dates',
    'attendance_records',
    'grade_periods',
    'grade_import_batches',
    'grades',
    'grade_import_errors',
    'literacy_numeracy_records',
    'risk_flags',
    'interventions',
    'intervention_updates',
    'certificate_templates',
    'generated_certificates',
    'uploaded_files',
    'lesson_plans',
    'report_exports',
    'ai_activity_logs',
    'public_announcements',
    'public_events',
    'audit_logs'
  ]
  loop
    execute format('alter table public.%I enable row level security', table_name);
  end loop;
end;
$$;

create policy "profiles read own or admin"
on public.profiles for select
using (user_id = auth.uid() or public.is_admin());

create policy "profiles update own safe fields or admin"
on public.profiles for update
using (user_id = auth.uid() or public.is_admin())
with check (user_id = auth.uid() or public.is_admin());

create policy "profiles admin insert"
on public.profiles for insert
with check (public.is_admin());

create policy "profiles admin delete"
on public.profiles for delete
using (public.is_admin());

create policy "active staff read school setup"
on public.school_years for select
using (public.is_active_staff());

create policy "admin manage school setup"
on public.school_years for all
using (public.is_admin())
with check (public.is_admin());

create policy "active staff read grade levels"
on public.grade_levels for select
using (public.is_active_staff());

alter table public.grade_levels enable row level security;

create policy "active staff read sections"
on public.sections for select
using (public.is_active_staff());

create policy "admin manage sections"
on public.sections for all
using (public.is_admin())
with check (public.is_admin());

create policy "active staff read subjects"
on public.subjects for select
using (public.is_active_staff());

create policy "admin manage subjects"
on public.subjects for all
using (public.is_admin())
with check (public.is_admin());

create policy "active staff read section subjects"
on public.section_subjects for select
using (public.is_active_staff());

create policy "admin manage section subjects"
on public.section_subjects for all
using (public.is_admin())
with check (public.is_admin());

create policy "teacher profiles readable to self and admin"
on public.teacher_profiles for select
using (profile_id = auth.uid() or public.is_admin());

create policy "admin manage teacher profiles"
on public.teacher_profiles for all
using (public.is_admin())
with check (public.is_admin());

create policy "teacher assignments readable to self and admin"
on public.teacher_assignments for select
using (teacher_id = auth.uid() or public.is_admin());

create policy "admin manage teacher assignments"
on public.teacher_assignments for all
using (public.is_admin())
with check (public.is_admin());

create policy "learners visible by assignment"
on public.learners for select
using (public.can_access_learner(id));

create policy "admin manage learners"
on public.learners for all
using (public.is_admin())
with check (public.is_admin());

create policy "guardians visible by learner access"
on public.learner_guardians for select
using (public.can_access_learner(learner_id));

create policy "admin manage guardians"
on public.learner_guardians for all
using (public.is_admin())
with check (public.is_admin());

create policy "enrollments visible by assignment"
on public.learner_enrollments for select
using (public.can_access_enrollment(id));

create policy "admin manage enrollments"
on public.learner_enrollments for all
using (public.is_admin())
with check (public.is_admin());

create policy "attendance dates visible by section access"
on public.attendance_dates for select
using (public.can_access_section(section_id));

create policy "admin or adviser manage attendance dates"
on public.attendance_dates for all
using (
  public.is_admin()
  or exists (
    select 1 from public.sections s
    where s.id = section_id and s.adviser_id = auth.uid()
  )
)
with check (
  public.is_admin()
  or exists (
    select 1 from public.sections s
    where s.id = section_id and s.adviser_id = auth.uid()
  )
);

create policy "attendance records visible by enrollment access"
on public.attendance_records for select
using (public.can_access_enrollment(enrollment_id));

create policy "admin or adviser manage attendance records"
on public.attendance_records for all
using (
  public.is_admin()
  or exists (
    select 1
    from public.attendance_dates ad
    join public.sections s on s.id = ad.section_id
    where ad.id = attendance_date_id and s.adviser_id = auth.uid()
  )
)
with check (
  public.is_admin()
  or exists (
    select 1
    from public.attendance_dates ad
    join public.sections s on s.id = ad.section_id
    where ad.id = attendance_date_id and s.adviser_id = auth.uid()
  )
);

create policy "grade periods visible to active staff"
on public.grade_periods for select
using (public.is_active_staff());

create policy "admin manage grade periods"
on public.grade_periods for all
using (public.is_admin())
with check (public.is_admin());

create policy "grade batches visible to importer or admin"
on public.grade_import_batches for select
using (imported_by = auth.uid() or public.is_admin());

create policy "subject teachers create grade batches"
on public.grade_import_batches for insert
with check (
  imported_by = auth.uid()
  and (
    public.is_admin()
    or exists (
      select 1 from public.section_subjects ss
      where ss.section_id = section_id
        and ss.subject_id = subject_id
        and ss.teacher_id = auth.uid()
    )
  )
);

create policy "grades visible by enrollment access"
on public.grades for select
using (public.can_access_enrollment(enrollment_id));

create policy "admin or assigned subject teacher manage grades"
on public.grades for all
using (
  public.is_admin()
  or exists (
    select 1
    from public.learner_enrollments le
    join public.section_subjects ss on ss.section_id = le.section_id
    where le.id = enrollment_id
      and ss.subject_id = subject_id
      and ss.teacher_id = auth.uid()
  )
)
with check (
  public.is_admin()
  or exists (
    select 1
    from public.learner_enrollments le
    join public.section_subjects ss on ss.section_id = le.section_id
    where le.id = enrollment_id
      and ss.subject_id = subject_id
      and ss.teacher_id = auth.uid()
  )
);

create policy "grade errors visible to batch owner or admin"
on public.grade_import_errors for select
using (
  public.is_admin()
  or exists (
    select 1 from public.grade_import_batches b
    where b.id = batch_id and b.imported_by = auth.uid()
  )
);

create policy "literacy numeracy visible by enrollment access"
on public.literacy_numeracy_records for select
using (public.can_access_enrollment(enrollment_id));

create policy "admin or adviser manage literacy numeracy"
on public.literacy_numeracy_records for all
using (
  public.is_admin()
  or exists (
    select 1
    from public.learner_enrollments le
    join public.sections s on s.id = le.section_id
    where le.id = enrollment_id and s.adviser_id = auth.uid()
  )
)
with check (
  public.is_admin()
  or exists (
    select 1
    from public.learner_enrollments le
    join public.sections s on s.id = le.section_id
    where le.id = enrollment_id and s.adviser_id = auth.uid()
  )
);

create policy "risk flags visible by learner access"
on public.risk_flags for select
using (public.can_access_learner(learner_id));

create policy "admin manage risk flags"
on public.risk_flags for all
using (public.is_admin())
with check (public.is_admin());

create policy "interventions visible by learner access"
on public.interventions for select
using (public.can_access_learner(learner_id));

create policy "admin or assigned teacher manage interventions"
on public.interventions for all
using (public.is_admin() or teacher_id = auth.uid())
with check (public.is_admin() or teacher_id = auth.uid());

create policy "intervention updates visible through intervention"
on public.intervention_updates for select
using (
  exists (
    select 1 from public.interventions i
    where i.id = intervention_id and public.can_access_learner(i.learner_id)
  )
);

create policy "intervention updates by active staff with access"
on public.intervention_updates for insert
with check (
  created_by = auth.uid()
  and exists (
    select 1 from public.interventions i
    where i.id = intervention_id and public.can_access_learner(i.learner_id)
  )
);

create policy "certificate templates active staff read"
on public.certificate_templates for select
using (public.is_active_staff());

create policy "admin manage certificate templates"
on public.certificate_templates for all
using (public.is_admin())
with check (public.is_admin());

create policy "generated certificates visible by enrollment"
on public.generated_certificates for select
using (public.can_access_enrollment(enrollment_id));

create policy "active staff generate certificates for accessible enrollments"
on public.generated_certificates for insert
with check (
  generated_by = auth.uid()
  and public.can_access_enrollment(enrollment_id)
);

create policy "uploaded files visible to owner or admin"
on public.uploaded_files for select
using (uploaded_by = auth.uid() or public.is_admin());

create policy "active staff upload file metadata"
on public.uploaded_files for insert
with check (uploaded_by = auth.uid() and public.is_active_staff());

create policy "lesson plans visible to owner or admin"
on public.lesson_plans for select
using (teacher_id = auth.uid() or public.is_admin());

create policy "teachers manage own lesson plans"
on public.lesson_plans for all
using (teacher_id = auth.uid() or public.is_admin())
with check (teacher_id = auth.uid() or public.is_admin());

create policy "report exports visible to exporter or admin"
on public.report_exports for select
using (exported_by = auth.uid() or public.is_admin());

create policy "active staff create report exports"
on public.report_exports for insert
with check (exported_by = auth.uid() and public.is_active_staff());

create policy "ai logs visible to actor or admin"
on public.ai_activity_logs for select
using (actor_id = auth.uid() or public.is_admin());

create policy "active staff create ai logs"
on public.ai_activity_logs for insert
with check (actor_id = auth.uid() and public.is_active_staff());

create policy "published announcements are public"
on public.public_announcements for select
using (published_at is not null or public.is_active_staff());

create policy "admin manage announcements"
on public.public_announcements for all
using (public.is_admin())
with check (public.is_admin());

create policy "published events are public"
on public.public_events for select
using (published_at is not null or public.is_active_staff());

create policy "admin manage events"
on public.public_events for all
using (public.is_admin())
with check (public.is_admin());

create policy "admin read audit logs"
on public.audit_logs for select
using (public.is_admin());

create policy "active staff create audit logs"
on public.audit_logs for insert
with check (actor_id = auth.uid() and public.is_active_staff());

create trigger profiles_touch_updated_at
before update on public.profiles
for each row execute function public.touch_updated_at();

create trigger teacher_profiles_touch_updated_at
before update on public.teacher_profiles
for each row execute function public.touch_updated_at();

create trigger school_years_touch_updated_at
before update on public.school_years
for each row execute function public.touch_updated_at();

create trigger sections_touch_updated_at
before update on public.sections
for each row execute function public.touch_updated_at();

create trigger subjects_touch_updated_at
before update on public.subjects
for each row execute function public.touch_updated_at();

create trigger section_subjects_touch_updated_at
before update on public.section_subjects
for each row execute function public.touch_updated_at();

create trigger teacher_assignments_touch_updated_at
before update on public.teacher_assignments
for each row execute function public.touch_updated_at();

create trigger learners_touch_updated_at
before update on public.learners
for each row execute function public.touch_updated_at();

create trigger learner_guardians_touch_updated_at
before update on public.learner_guardians
for each row execute function public.touch_updated_at();

create trigger learner_enrollments_touch_updated_at
before update on public.learner_enrollments
for each row execute function public.touch_updated_at();

create trigger attendance_dates_touch_updated_at
before update on public.attendance_dates
for each row execute function public.touch_updated_at();

create trigger attendance_records_touch_updated_at
before update on public.attendance_records
for each row execute function public.touch_updated_at();

create trigger grades_touch_updated_at
before update on public.grades
for each row execute function public.touch_updated_at();

create trigger literacy_numeracy_records_touch_updated_at
before update on public.literacy_numeracy_records
for each row execute function public.touch_updated_at();

create trigger interventions_touch_updated_at
before update on public.interventions
for each row execute function public.touch_updated_at();

create trigger certificate_templates_touch_updated_at
before update on public.certificate_templates
for each row execute function public.touch_updated_at();

create trigger lesson_plans_touch_updated_at
before update on public.lesson_plans
for each row execute function public.touch_updated_at();

create trigger public_announcements_touch_updated_at
before update on public.public_announcements
for each row execute function public.touch_updated_at();

create trigger public_events_touch_updated_at
before update on public.public_events
for each row execute function public.touch_updated_at();

insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values
  (
    'lesson-plans',
    'lesson-plans',
    false,
    10485760,
    array[
      'application/pdf',
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
      'application/msword'
    ]
  ),
  (
    'generated-reports',
    'generated-reports',
    false,
    10485760,
    array[
      'application/pdf',
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
    ]
  ),
  (
    'certificates',
    'certificates',
    false,
    10485760,
    array['application/pdf']
  )
on conflict (id) do nothing;

create policy "private storage owner or admin read"
on storage.objects for select
using (
  bucket_id in ('lesson-plans', 'generated-reports', 'certificates')
  and (owner = auth.uid() or public.is_admin())
);

create policy "private storage active staff write"
on storage.objects for insert
with check (
  bucket_id in ('lesson-plans', 'generated-reports', 'certificates')
  and owner = auth.uid()
  and public.is_active_staff()
);
