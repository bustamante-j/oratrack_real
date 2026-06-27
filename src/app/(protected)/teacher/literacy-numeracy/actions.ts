"use server";

import { revalidatePath } from "next/cache";

import { logAuditEvent } from "@/lib/audit";
import { requireAuthenticatedProfile } from "@/lib/auth/session";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { literacyNumeracySheetFormSchema } from "@/lib/validation/domain";

type SupabaseServerClient = Awaited<
  ReturnType<typeof createSupabaseServerClient>
>;

function optionalFormValue(value: FormDataEntryValue | null) {
  if (typeof value !== "string") return undefined;

  const trimmed = value.trim();
  return trimmed.length ? trimmed : undefined;
}

function revalidateLiteracyNumeracyViews() {
  revalidatePath("/teacher/literacy-numeracy");
  revalidatePath("/teacher/learners");
  revalidatePath("/teacher/interventions");
  revalidatePath("/teacher/reports");
  revalidatePath("/admin/analytics");
  revalidatePath("/admin/reports");
  revalidatePath("/teacher/ai");
  revalidatePath("/admin/ai");
}

async function assertCanManageSection(
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
    throw new Error("Only the section adviser can encode literacy/numeracy.");
  }

  return section;
}

export async function saveLiteracyNumeracySheetAction(formData: FormData) {
  const profile = await requireAuthenticatedProfile();
  const sectionId = formData.get("sectionId");
  const schoolYearId = formData.get("schoolYearId");
  const enrollmentIds = formData
    .getAll("enrollmentId")
    .filter((value): value is string => typeof value === "string");
  const parsed = literacyNumeracySheetFormSchema.parse({
    sectionId,
    schoolYearId,
    records: enrollmentIds.map((enrollmentId) => ({
      enrollmentId,
      schoolYearId,
      literacyRating: formData.get(`literacyRating-${enrollmentId}`),
      numeracyRating: formData.get(`numeracyRating-${enrollmentId}`),
      remarks: optionalFormValue(formData.get(`remarks-${enrollmentId}`)),
    })),
  });
  const supabase = await createSupabaseServerClient();
  const section = await assertCanManageSection(
    supabase,
    parsed.sectionId,
    profile.userId,
    profile.role,
  );

  if (section.school_year_id !== parsed.schoolYearId) {
    throw new Error("Section does not match the selected school year.");
  }

  const { data: enrollments, error: enrollmentError } = await supabase
    .from("learner_enrollments")
    .select("id,school_year_id,section_id,enrollment_status")
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
      enrollment.school_year_id !== parsed.schoolYearId ||
      enrollment.enrollment_status !== "enrolled"
    ) {
      throw new Error("Records include a learner outside this section.");
    }
  }

  const { data: savedRecords, error } = await supabase
    .from("literacy_numeracy_records")
    .upsert(
      parsed.records.map((record) => ({
        enrollment_id: record.enrollmentId,
        school_year_id: parsed.schoolYearId,
        literacy_rating: record.literacyRating,
        numeracy_rating: record.numeracyRating,
        remarks: record.remarks ?? null,
        encoded_by: profile.userId,
      })),
      { onConflict: "enrollment_id,school_year_id" },
    )
    .select("id");

  if (error) {
    throw new Error(error.message);
  }

  await logAuditEvent(supabase, {
    actorId: profile.userId,
    action: "literacy_numeracy_record_changed",
    entityTable: "literacy_numeracy_records",
    metadata: {
      sectionId: parsed.sectionId,
      schoolYearId: parsed.schoolYearId,
      recordCount: savedRecords?.length ?? 0,
    },
  });

  revalidateLiteracyNumeracyViews();
}
