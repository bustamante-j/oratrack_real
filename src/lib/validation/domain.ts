import { z } from "zod";

import { appRoles, attendanceStatuses } from "@/types/domain";

export const appRoleSchema = z.enum(appRoles);
export const attendanceStatusSchema = z.enum(attendanceStatuses);

export const teacherAccountSchema = z.object({
  email: z.email().trim(),
  fullName: z.string().min(2).max(160).trim(),
  role: appRoleSchema,
  employeeNumber: z.string().max(40).trim().optional(),
  isActive: z.boolean().default(true),
});

export const learnerSchema = z.object({
  lrn: z.string().min(1).max(20).trim(),
  firstName: z.string().min(1).max(80).trim(),
  middleName: z.string().max(80).trim().optional(),
  lastName: z.string().min(1).max(80).trim(),
  extensionName: z.string().max(20).trim().optional(),
  sex: z.enum(["female", "male"]),
  birthDate: z.iso.date(),
  address: z.string().max(500).trim().optional(),
});

export const attendanceRecordSchema = z.object({
  enrollmentId: z.uuid(),
  attendanceDateId: z.uuid(),
  amStatus: attendanceStatusSchema,
  pmStatus: attendanceStatusSchema,
  remarks: z.string().max(500).trim().optional(),
});

export const gradeImportRowSchema = z.object({
  lrn: z.string().min(1).max(20).trim(),
  subjectCode: z.string().min(1).max(30).trim(),
  periodCode: z.string().min(1).max(30).trim(),
  grade: z.coerce.number().min(0).max(100),
  remarks: z.string().max(500).trim().optional(),
});

export const literacyNumeracyRecordSchema = z.object({
  enrollmentId: z.uuid(),
  schoolYearId: z.uuid(),
  literacyRating: z.enum(["beginning", "developing", "proficient", "advanced"]),
  numeracyRating: z.enum(["beginning", "developing", "proficient", "advanced"]),
  remarks: z.string().max(500).trim().optional(),
});

export const interventionSchema = z.object({
  learnerId: z.uuid(),
  category: z.string().min(1).max(80).trim(),
  startedOn: z.iso.date(),
  status: z.enum(["planned", "ongoing", "completed", "cancelled"]),
  notes: z.string().min(1).max(4000).trim(),
  followUpOn: z.iso.date().optional(),
});

export const certificateRequestSchema = z.object({
  learnerEnrollmentIds: z.array(z.uuid()).min(1),
  certificateType: z.enum(["recognition", "completion"]),
  templateId: z.uuid().optional(),
});

export const aiDraftRequestSchema = z.object({
  intent: z.enum([
    "learner_summary",
    "attendance_risk",
    "academic_performance",
    "intervention_note",
    "parent_message",
    "report_narrative",
    "class_insight",
  ]),
  scope: z.object({
    learnerId: z.uuid().optional(),
    sectionId: z.uuid().optional(),
    schoolYearId: z.uuid().optional(),
  }),
  prompt: z.string().min(1).max(2000).trim(),
});
