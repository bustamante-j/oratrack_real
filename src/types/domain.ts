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

export type NavItem = {
  href: string;
  label: string;
};

export type ModuleDefinition = {
  id: string;
  title: string;
  phase: string;
  href: string;
  summary: string;
  capabilities: string[];
  emptyState: string;
  auditEvents: string[];
};
