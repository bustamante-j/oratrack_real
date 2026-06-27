import { z } from "zod";

import { appRoles, attendanceStatuses } from "@/types/domain";

export const appRoleSchema = z.enum(appRoles);
export const attendanceStatusSchema = z.enum(attendanceStatuses);
export const accountStatusSchema = z.enum(["active", "inactive"]);
export const learnerStatusSchema = z.enum([
  "active",
  "inactive",
  "archived",
  "transferred",
]);

export const teacherAccountSchema = z.object({
  email: z.email().trim(),
  fullName: z.string().min(2).max(160).trim(),
  role: appRoleSchema,
  employeeNumber: z.string().max(40).trim().optional(),
  isActive: z.boolean().default(true),
});

export const teacherAccountCreateSchema = z.object({
  email: z.email().trim(),
  fullName: z.string().min(2).max(160).trim(),
  role: appRoleSchema,
  status: accountStatusSchema.default("active"),
  temporaryPassword: z.string().min(8).max(128),
  phone: z.string().max(40).trim().optional(),
  employeeNumber: z.string().max(40).trim().optional(),
  positionTitle: z.string().max(120).trim().optional(),
  gradeSpecialization: z.string().max(120).trim().optional(),
});

export const teacherAccountUpdateSchema = z.object({
  userId: z.uuid(),
  fullName: z.string().min(2).max(160).trim(),
  role: appRoleSchema,
  status: accountStatusSchema,
  phone: z.string().max(40).trim().optional(),
  employeeNumber: z.string().max(40).trim().optional(),
  positionTitle: z.string().max(120).trim().optional(),
  gradeSpecialization: z.string().max(120).trim().optional(),
});

export const teacherPasswordResetSchema = z.object({
  userId: z.uuid(),
  temporaryPassword: z.string().min(8).max(128),
});

export const staffProfileUpdateSchema = z.object({
  fullName: z.string().min(2).max(160).trim(),
  phone: z.string().max(40).trim().optional(),
});

export const schoolYearFormSchema = z
  .object({
    name: z.string().min(3).max(40).trim(),
    startsOn: z.iso.date(),
    endsOn: z.iso.date(),
  })
  .refine((value) => value.startsOn < value.endsOn, {
    message: "School year start date must be before the end date.",
    path: ["endsOn"],
  });

export const schoolYearStatusFormSchema = z.object({
  id: z.uuid(),
  status: z.enum(["draft", "active", "closed"]),
});

export const subjectFormSchema = z.object({
  code: z.string().min(2).max(30).trim(),
  name: z.string().min(2).max(120).trim(),
  gradeLevelId: z.coerce.number().int().positive().optional(),
});

export const sectionFormSchema = z.object({
  schoolYearId: z.uuid(),
  gradeLevelId: z.coerce.number().int().positive(),
  name: z.string().min(1).max(80).trim(),
  adviserId: z.uuid().optional(),
  room: z.string().max(80).trim().optional(),
});

export const sectionSubjectFormSchema = z.object({
  sectionId: z.uuid(),
  subjectId: z.uuid(),
  teacherId: z.uuid().optional(),
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

export const learnerCreateFormSchema = learnerSchema.extend({
  guardianFullName: z.string().max(160).trim().optional(),
  guardianRelationship: z.string().max(80).trim().optional(),
  guardianPhone: z.string().max(40).trim().optional(),
  guardianEmail: z.email().trim().optional(),
  guardianAddress: z.string().max(500).trim().optional(),
});

export const learnerUpdateFormSchema = learnerSchema.extend({
  id: z.uuid(),
});

export const learnerStatusFormSchema = z.object({
  id: z.uuid(),
  status: learnerStatusSchema,
});

export const learnerEnrollmentFormSchema = z.object({
  learnerId: z.uuid(),
  schoolYearId: z.uuid(),
  gradeLevelId: z.coerce.number().int().positive(),
  sectionId: z.uuid().optional(),
  enrollmentStatus: z.string().min(1).max(40).trim().default("enrolled"),
  enrolledOn: z.iso.date().optional(),
});

export const learnerGuardianFormSchema = z.object({
  learnerId: z.uuid(),
  fullName: z.string().min(2).max(160).trim(),
  relationship: z.string().min(1).max(80).trim(),
  phone: z.string().max(40).trim().optional(),
  email: z.email().trim().optional(),
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
