import type { ModuleDefinition } from "@/types/domain";

export const adminModules: ModuleDefinition[] = [
  {
    id: "school-years",
    title: "School years",
    href: "/admin/school-years",
    summary:
      "Create school years and keep enrollment history separated by year.",
    capabilities: [
      "Create and close school years",
      "Mark the active school year",
      "Use active year in enrollments and reports",
    ],
    emptyState:
      "No school years exist yet. Add the first school year after Supabase setup.",
    auditEvents: ["school_year_created", "school_year_updated"],
  },
  {
    id: "users",
    title: "Teacher accounts",
    href: "/admin/users",
    summary: "Create, activate, deactivate, and assign teacher roles.",
    capabilities: [
      "Create teacher auth accounts",
      "Assign Admin/Principal, Adviser, or Subject Teacher role",
      "Reset passwords without exposing credentials",
    ],
    emptyState: "No teacher accounts have been created from ORATRACK yet.",
    auditEvents: [
      "account_created",
      "role_changed",
      "password_reset_requested",
    ],
  },
  {
    id: "sections",
    title: "Sections and subjects",
    href: "/admin/sections",
    summary:
      "Manage grade levels, sections, advisers, subjects, and subject teachers.",
    capabilities: [
      "Assign advisers to sections",
      "Assign subject teachers to class subjects",
      "Scope teacher access through assignments",
    ],
    emptyState: "No sections are configured for the active school year.",
    auditEvents: ["section_created", "teacher_assignment_changed"],
  },
  {
    id: "learners",
    title: "Learner repository",
    href: "/admin/learners",
    summary: "Maintain stable learner identity and yearly enrollment records.",
    capabilities: [
      "Register and edit learners",
      "Archive inactive records",
      "Search learner histories without duplicating identity",
    ],
    emptyState:
      "No learners are registered. Production starts empty by design.",
    auditEvents: ["learner_created", "learner_updated", "learner_archived"],
  },
  {
    id: "promotion",
    title: "Promotion",
    href: "/admin/promotion",
    summary:
      "Promote learners into the next school year while preserving history.",
    capabilities: [
      "Create next-year enrollment batches",
      "Assign promoted learners to sections",
      "Track source enrollment for auditability",
    ],
    emptyState:
      "Promotion runs will appear after learners and school years exist.",
    auditEvents: ["promotion_batch_created", "learner_promoted"],
  },
  {
    id: "analytics",
    title: "Analytics dashboard",
    href: "/admin/analytics",
    summary:
      "School-wide attendance, performance, literacy, numeracy, and risk views.",
    capabilities: [
      "View school-wide metrics",
      "Compare grade-level performance",
      "Monitor risk and intervention load",
    ],
    emptyState: "Analytics will populate after operational data is encoded.",
    auditEvents: ["analytics_viewed"],
  },
  {
    id: "reports",
    title: "Automated reports",
    href: "/admin/reports",
    summary:
      "Generate attendance, performance, risk, profile, and promotion reports.",
    capabilities: [
      "Export PDF and Excel reports",
      "Record report exports",
      "Use clean temporary templates first",
    ],
    emptyState: "No report exports yet.",
    auditEvents: ["report_exported"],
  },
  {
    id: "certificates",
    title: "Certificates",
    href: "/admin/certificates",
    summary:
      "Manage recognition and completion certificate templates and batches.",
    capabilities: [
      "Generate printable PDFs",
      "Batch certificate creation",
      "Replace temporary templates later",
    ],
    emptyState: "No certificate templates are configured yet.",
    auditEvents: ["certificate_generated", "certificate_template_changed"],
  },
  {
    id: "lesson-plans",
    title: "Lesson plans",
    href: "/admin/lesson-plans",
    summary: "Review and download private lesson-plan uploads via signed URLs.",
    capabilities: [
      "Review uploaded lesson plans",
      "Download through short-lived signed URLs",
      "Store files by school year and grade level",
    ],
    emptyState: "No lesson plans have been uploaded.",
    auditEvents: ["lesson_plan_reviewed", "lesson_plan_downloaded"],
  },
  {
    id: "ai",
    title: "AI assistant",
    href: "/admin/ai",
    summary:
      "Permission-aware summaries, draft narratives, and proposed actions.",
    capabilities: [
      "Read only records the user may access",
      "Require confirmation before writes",
      "Log prompts, scopes, and generated suggestions",
    ],
    emptyState:
      "AI uses ORATRACK-trained safe draft mode; OpenAI provider activation is controlled by environment keys.",
    auditEvents: ["ai_prompt_submitted", "ai_suggestion_generated"],
  },
];

export const teacherModules: ModuleDefinition[] = [
  {
    id: "learners",
    title: "Assigned learners",
    href: "/teacher/learners",
    summary:
      "View assigned learner records, histories, and intervention context.",
    capabilities: [
      "View assigned learners only",
      "Search class records",
      "Open academic, attendance, and intervention history",
    ],
    emptyState: "No assigned learners are visible for this account yet.",
    auditEvents: ["learner_profile_viewed"],
  },
  {
    id: "attendance",
    title: "Attendance",
    href: "/teacher/attendance",
    summary: "Create attendance dates and record AM/PM status per learner.",
    capabilities: [
      "Record AM attendance",
      "Record PM attendance",
      "Apply tardy and absenteeism calculations",
    ],
    emptyState: "No attendance dates have been created for your section.",
    auditEvents: ["attendance_date_created", "attendance_record_changed"],
  },
  {
    id: "grades",
    title: "Grades",
    href: "/teacher/grades",
    summary: "Import Excel grades or manually encode subject averages.",
    capabilities: [
      "Validate Excel uploads before saving",
      "Review and correct import errors",
      "Compute GWA and class averages",
    ],
    emptyState: "No grade batches have been imported.",
    auditEvents: ["grade_imported", "grade_changed"],
  },
  {
    id: "literacy-numeracy",
    title: "Literacy and numeracy",
    href: "/teacher/literacy-numeracy",
    summary: "Encode literacy and numeracy ratings and review class summaries.",
    capabilities: [
      "Encode literacy ratings",
      "Encode numeracy ratings",
      "Identify low-performing groups",
    ],
    emptyState: "No literacy or numeracy ratings have been encoded.",
    auditEvents: ["literacy_numeracy_record_changed"],
  },
  {
    id: "interventions",
    title: "Interventions",
    href: "/teacher/interventions",
    summary: "Record intervention notes, progress, and follow-up dates.",
    capabilities: [
      "Create intervention records",
      "Update progress and follow-ups",
      "Review learner intervention history",
    ],
    emptyState: "No intervention records exist for your assigned learners.",
    auditEvents: ["intervention_created", "intervention_updated"],
  },
  {
    id: "reports",
    title: "Class reports",
    href: "/teacher/reports",
    summary:
      "Generate class attendance, performance, and learner profile reports.",
    capabilities: [
      "Export class attendance",
      "Export class performance summaries",
      "Generate learner profile reports",
    ],
    emptyState: "No teacher report exports yet.",
    auditEvents: ["report_exported"],
  },
  {
    id: "certificates",
    title: "Certificates",
    href: "/teacher/certificates",
    summary:
      "Generate recognition or completion certificates for assigned learners.",
    capabilities: [
      "Generate temporary clean templates",
      "Export printable PDF",
      "Support batch printing later",
    ],
    emptyState: "No certificates generated from this account.",
    auditEvents: ["certificate_generated"],
  },
  {
    id: "lesson-plans",
    title: "Lesson plans",
    href: "/teacher/lesson-plans",
    summary: "Upload, replace, and download private lesson-plan files.",
    capabilities: [
      "Upload restricted file types",
      "Replace own lesson plans",
      "Download through signed URLs",
    ],
    emptyState: "No lesson plans uploaded by this account.",
    auditEvents: ["lesson_plan_uploaded", "lesson_plan_downloaded"],
  },
  {
    id: "ai",
    title: "AI assistant",
    href: "/teacher/ai",
    summary:
      "Draft parent messages, intervention notes, and class insights safely.",
    capabilities: [
      "Summarize assigned learner context",
      "Draft notes and messages",
      "Require confirmation before storing output",
    ],
    emptyState:
      "AI uses ORATRACK-trained safe draft mode with permission-scoped records.",
    auditEvents: ["ai_prompt_submitted", "ai_suggestion_generated"],
  },
];

export function getAdminModule(id: string) {
  return adminModules.find((module) => module.id === id);
}

export function getTeacherModule(id: string) {
  return teacherModules.find((module) => module.id === id);
}
