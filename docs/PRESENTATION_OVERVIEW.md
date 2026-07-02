# ORATRACK Presentation Overview

ORATRACK is a school portal for Balili Elementary School. It connects the public website, school calendar, learner records, attendance, grades, interventions, certificates, reports, and an AI assistant in one system.

## Short Introduction

ORATRACK was built to help a school manage learner information in a cleaner and more organized way. Instead of keeping announcements, attendance, grades, learner support notes, certificates, and reports in separate files or manual records, the system brings them into one portal with role-based access.

In the presentation, emphasize that ORATRACK is not only a public school website. It is also an internal school management system for admins, advisers, and subject teachers.

## Technology Stack

- Framework: Next.js with React and TypeScript.
- Styling: Tailwind CSS with custom ORATRACK dashboard styling.
- Database and backend: Supabase PostgreSQL.
- Authentication: Supabase Auth.
- Data security: Supabase Row Level Security and role-based permissions.
- File storage: Supabase Storage for avatars, certificates, templates, and uploaded files.
- Deployment target: Vercel.
- Charts and analytics: Recharts.
- Excel support: ExcelJS for learner and grade import templates.
- PDF generation: PDFKit for generated reports and certificates.
- AI feature: OpenAI-powered assistant through protected server-side API routes.

## Public Website

- Shows school information, announcements, approved events, programs, and contact details.
- Home page metrics come from the database, not hardcoded placeholder text.
- Events submitted by staff appear publicly only after admin approval.

## Admin Dashboard

- Manages learners, enrolled learners, teachers, sections, school years, subjects, events, certificates, reports, and analytics.
- Can approve or reject calendar event submissions.
- Can review individual learner attendance, academic performance, literacy or numeracy status, awards, and intervention history.
- Has analytics views to help the school quickly understand attendance, learner progress, grade distribution, and support needs.
- Can upload and manage certificate templates and public-facing school content.

## Teacher and Adviser Dashboard

- Teachers can view assigned learners and class sections.
- Advisers can encode attendance, literacy, numeracy, and learner support records.
- Subject teachers can encode grades by subject or use the all-subject grade sheet with automatic averages.
- Staff can submit calendar events for admin approval.
- Dashboards are intentionally compact: users first see clean summary information, then expand sections when they need more detail.

## Learner Records

- Each learner has a profile with basic details, guardians, enrollment, attendance, grades, literacy or numeracy records, interventions, and awards.
- Tables can be searched and viewed in compact layouts to keep the dashboard clean.
- Individual learner profiles are useful during parent conferences because attendance, grades, interventions, and awards can be checked in one place.

## Certificates

- Staff can choose a certificate type, upload or use a template, select learners, and generate downloadable certificates.
- Generated certificates are stored as records so the school can track issued awards.

## AI Assistant

- The floating ORA button opens a quick assistant drawer.
- The full AI assistant page helps draft summaries, support notes, and school-related text.
- AI outputs are review-first; users should check and confirm content before using it.
- The AI assistant is meant to reduce writing time, not replace teacher judgment.
- The AI has an ORATRACK-specific training layer covering the school portal, user roles, learner records, attendance, grades, literacy/numeracy, interventions, certificates, events, reports, and safety rules.
- Provider target: OpenAI. Default model target: `gpt-5.5`, configurable with `OPENAI_MODEL`.
- Current implementation uses safe draft mode and does not automatically write to the database.
- More detail is available in `docs/AI_ASSISTANT.md`.

## Security

- Supabase authentication controls sign-in.
- Role-based access separates admin, adviser, and subject teacher actions.
- Database row-level security helps limit records to authorized users.
- Sensitive server keys stay in environment variables and should not be shared publicly.
- Public visitors can only view public pages and approved public records.
- Internal records such as learner details, grades, attendance, interventions, and certificates require an authenticated staff account.

## Suggested Demo Flow

1. Start at the home page and explain that announcements, events, and metrics come from the database.
2. Open the events page and mention that staff-submitted events need admin approval before becoming public.
3. Sign in as admin and show learner management, enrolled learners, analytics, certificates, events, and reports.
4. Open one learner profile and point out attendance, grades, literacy or numeracy, interventions, and awards.
5. Sign in as adviser or teacher and show that their dashboard is limited to assigned work.
6. Show attendance or literacy/numeracy encoding for advisers.
7. Show the all-subject grade sheet and automatic average calculation.
8. Open certificates and explain template upload plus generated downloadable certificates.
9. Open the ORA AI assistant and explain that it helps draft summaries while keeping human review required.

## Main Strengths To Mention

- Centralizes school records in one portal.
- Keeps the public website connected to real approved school data.
- Supports different roles: admin, adviser, and subject teacher.
- Makes learner review easier through individual learner profiles.
- Reduces repetitive work through imports, reports, certificate generation, and AI-assisted drafting.
- Uses authentication, role checks, and database security rules to protect sensitive records.

## Current Limitations To Be Honest About

- It still needs real school users to test the workflows with actual day-to-day use.
- The AI assistant should be treated as a drafting helper and must always be reviewed by staff.
- The system depends on correct Supabase environment variables and applied migrations.
- Before production use, the school should replace sample data with official records and review privacy requirements.
