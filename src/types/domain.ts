export const appRoles = [
  "admin_principal",
  "adviser",
  "subject_teacher",
] as const;

export type AppRole = (typeof appRoles)[number];

export const attendanceStatuses = [
  "present",
  "absent",
  "late",
  "excused",
  "half_day",
] as const;

export type AttendanceStatus = (typeof attendanceStatuses)[number];

export const ratingLevels = [
  "beginning",
  "developing",
  "proficient",
  "advanced",
] as const;

export type RatingLevel = (typeof ratingLevels)[number];

export const interventionStatuses = [
  "planned",
  "ongoing",
  "completed",
  "cancelled",
] as const;

export type InterventionStatus = (typeof interventionStatuses)[number];

export const certificateTypes = ["recognition", "completion"] as const;

export type CertificateType = (typeof certificateTypes)[number];

export const lessonPlanStatuses = [
  "uploaded",
  "replaced",
  "reviewed",
  "archived",
] as const;

export type LessonPlanStatus = (typeof lessonPlanStatuses)[number];

export type NavItem = {
  href: string;
  label: string;
  group?: string;
  icon?: string;
};

export type PortalNotification = {
  id: string;
  title: string;
  detail: string;
  href: string;
  tone?: "sky" | "amber" | "green" | "rose" | "slate";
};

export type ModuleDefinition = {
  id: string;
  title: string;
  href: string;
  summary: string;
  capabilities: string[];
  emptyState: string;
  auditEvents: string[];
};
