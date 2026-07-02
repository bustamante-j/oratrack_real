# ORATRACK Presentation Overview

ORATRACK is a school portal for Balili Elementary School. It connects the public website, school calendar, learner records, attendance, grades, interventions, certificates, reports, and an AI assistant in one system.

## Public Website

- Shows school information, announcements, approved events, programs, and contact details.
- Home page metrics come from the database, not hardcoded placeholder text.
- Events submitted by staff appear publicly only after admin approval.

## Admin Dashboard

- Manages learners, enrolled learners, teachers, sections, school years, subjects, events, certificates, reports, and analytics.
- Can approve or reject calendar event submissions.
- Can review individual learner attendance, academic performance, literacy or numeracy status, awards, and intervention history.

## Teacher and Adviser Dashboard

- Teachers can view assigned learners and class sections.
- Advisers can encode attendance, literacy, numeracy, and learner support records.
- Subject teachers can encode grades by subject or use the all-subject grade sheet with automatic averages.
- Staff can submit calendar events for admin approval.

## Learner Records

- Each learner has a profile with basic details, guardians, enrollment, attendance, grades, literacy or numeracy records, interventions, and awards.
- Tables can be searched and viewed in compact layouts to keep the dashboard clean.

## Certificates

- Staff can choose a certificate type, upload or use a template, select learners, and generate downloadable certificates.
- Generated certificates are stored as records so the school can track issued awards.

## AI Assistant

- The floating ORA button opens a quick assistant drawer.
- The full AI assistant page helps draft summaries, support notes, and school-related text.
- AI outputs are review-first; users should check and confirm content before using it.

## Security

- Supabase authentication controls sign-in.
- Role-based access separates admin, adviser, and subject teacher actions.
- Database row-level security helps limit records to authorized users.
- Sensitive server keys stay in environment variables and should not be shared publicly.
