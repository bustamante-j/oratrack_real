"use server";

import { revalidatePath } from "next/cache";

import { logAuditEvent } from "@/lib/audit";
import { requireAuthenticatedProfile } from "@/lib/auth/session";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import {
  attendanceDateFormSchema,
  attendanceSheetFormSchema,
} from "@/lib/validation/domain";

type SupabaseServerClient = Awaited<
  ReturnType<typeof createSupabaseServerClient>
>;

function optionalFormValue(value: FormDataEntryValue | null) {
  if (typeof value !== "string") return undefined;

  const trimmed = value.trim();
  return trimmed.length ? trimmed : undefined;
}

function revalidateAttendanceViews() {
  revalidatePath("/teacher/attendance");
  revalidatePath("/teacher/learners");
  revalidatePath("/teacher/reports");
  revalidatePath("/admin/analytics");
  revalidatePath("/admin/reports");
  revalidatePath("/teacher/ai");
  revalidatePath("/admin/ai");
}

async function assertCanManageAttendanceSection(
  supabase: SupabaseServerClient,
  sectionId: string,
  userId: string,
  role: string,
) {
  const { data: section, error } = await supabase
    .from("sections")
    .select("id,school_year_id,adviser_id")
    .eq("id", sectionId)
    .single();

  if (error) {
    throw new Error(error.message);
  }

  if (role !== "admin_principal" && section.adviser_id !== userId) {
    throw new Error("Only the section adviser can encode attendance.");
  }

  return section;
}

export async function createAttendanceDateAction(formData: FormData) {
  const profile = await requireAuthenticatedProfile();
  const parsed = attendanceDateFormSchema.parse({
    schoolYearId: formData.get("schoolYearId"),
    sectionId: formData.get("sectionId"),
    attendanceOn: formData.get("attendanceOn"),
  });
  const supabase = await createSupabaseServerClient();
  const section = await assertCanManageAttendanceSection(
    supabase,
    parsed.sectionId,
    profile.userId,
    profile.role,
  );

  if (section.school_year_id !== parsed.schoolYearId) {
    throw new Error("Section does not match the selected school year.");
  }

  const { data, error } = await supabase
    .from("attendance_dates")
    .upsert(
      {
        school_year_id: parsed.schoolYearId,
        section_id: parsed.sectionId,
        attendance_on: parsed.attendanceOn,
        created_by: profile.userId,
      },
      { onConflict: "section_id,attendance_on" },
    )
    .select("id")
    .single();

  if (error) {
    throw new Error(error.message);
  }

  await logAuditEvent(supabase, {
    actorId: profile.userId,
    action: "attendance_date_created",
    entityTable: "attendance_dates",
    entityId: data.id,
    metadata: {
      schoolYearId: parsed.schoolYearId,
      sectionId: parsed.sectionId,
      attendanceOn: parsed.attendanceOn,
    },
  });

  revalidateAttendanceViews();
}

export async function saveAttendanceSheetAction(formData: FormData) {
  const profile = await requireAuthenticatedProfile();
  const attendanceDateId = formData.get("attendanceDateId");
  const sectionId = formData.get("sectionId");
  const enrollmentIds = formData
    .getAll("enrollmentId")
    .filter((value): value is string => typeof value === "string");

  const parsed = attendanceSheetFormSchema.parse({
    attendanceDateId,
    sectionId,
    records: enrollmentIds.map((enrollmentId) => ({
      enrollmentId,
      attendanceDateId,
      amStatus: formData.get(`amStatus-${enrollmentId}`),
      pmStatus: formData.get(`pmStatus-${enrollmentId}`),
      remarks: optionalFormValue(formData.get(`remarks-${enrollmentId}`)),
    })),
  });
  const supabase = await createSupabaseServerClient();
  const { data: attendanceDate, error: attendanceDateError } = await supabase
    .from("attendance_dates")
    .select("id,section_id,school_year_id,attendance_on")
    .eq("id", parsed.attendanceDateId)
    .single();

  if (attendanceDateError) {
    throw new Error(attendanceDateError.message);
  }

  if (attendanceDate.section_id !== parsed.sectionId) {
    throw new Error("Attendance date does not match the selected section.");
  }

  await assertCanManageAttendanceSection(
    supabase,
    parsed.sectionId,
    profile.userId,
    profile.role,
  );

  const { data: enrollments, error: enrollmentError } = await supabase
    .from("learner_enrollments")
    .select("id,section_id,enrollment_status")
    .in(
      "id",
      parsed.records.map((record) => record.enrollmentId),
    );

  if (enrollmentError) {
    throw new Error(enrollmentError.message);
  }

  const enrollmentsById = new Map(
    (enrollments ?? []).map((enrollment) => [enrollment.id, enrollment]),
  );

  for (const record of parsed.records) {
    const enrollment = enrollmentsById.get(record.enrollmentId);

    if (
      !enrollment ||
      enrollment.section_id !== parsed.sectionId ||
      enrollment.enrollment_status !== "enrolled"
    ) {
      throw new Error("Attendance includes a learner outside this section.");
    }
  }

  const { data: savedRecords, error } = await supabase
    .from("attendance_records")
    .upsert(
      parsed.records.map((record) => ({
        attendance_date_id: parsed.attendanceDateId,
        enrollment_id: record.enrollmentId,
        am_status: record.amStatus,
        pm_status: record.pmStatus,
        remarks: record.remarks ?? null,
        recorded_by: profile.userId,
      })),
      { onConflict: "attendance_date_id,enrollment_id" },
    )
    .select("id");

  if (error) {
    throw new Error(error.message);
  }

  await logAuditEvent(supabase, {
    actorId: profile.userId,
    action: "attendance_record_changed",
    entityTable: "attendance_records",
    metadata: {
      attendanceDateId: parsed.attendanceDateId,
      sectionId: parsed.sectionId,
      attendanceOn: attendanceDate.attendance_on,
      recordCount: savedRecords?.length ?? 0,
    },
  });

  revalidateAttendanceViews();
}
