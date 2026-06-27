"use server";

import { revalidatePath } from "next/cache";

import { logAuditEvent } from "@/lib/audit";
import { requireAdminProfile } from "@/lib/auth/session";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { promotionBatchFormSchema } from "@/lib/validation/domain";

function optionalFormValue(value: FormDataEntryValue | null) {
  if (typeof value !== "string") return undefined;

  const trimmed = value.trim();
  return trimmed.length ? trimmed : undefined;
}

function revalidatePromotionViews() {
  revalidatePath("/admin/promotion");
  revalidatePath("/admin/learners");
  revalidatePath("/teacher/learners");
  revalidatePath("/admin/analytics");
  revalidatePath("/admin/reports");
  revalidatePath("/teacher/reports");
  revalidatePath("/teacher/ai");
  revalidatePath("/admin/ai");
}

export async function promoteLearnerBatchAction(formData: FormData) {
  const admin = await requireAdminProfile();
  const parsed = promotionBatchFormSchema.parse({
    sourceSchoolYearId: formData.get("sourceSchoolYearId"),
    targetSchoolYearId: formData.get("targetSchoolYearId"),
    sourceGradeLevelId: optionalFormValue(formData.get("sourceGradeLevelId")),
    sourceSectionId: optionalFormValue(formData.get("sourceSectionId")),
    targetGradeLevelId: formData.get("targetGradeLevelId"),
    targetSectionId: optionalFormValue(formData.get("targetSectionId")),
    enrolledOn: optionalFormValue(formData.get("enrolledOn")),
  });
  const supabase = await createSupabaseServerClient();

  if (parsed.sourceSectionId) {
    const { data: sourceSection, error: sourceSectionError } = await supabase
      .from("sections")
      .select("school_year_id,grade_level_id")
      .eq("id", parsed.sourceSectionId)
      .single();

    if (sourceSectionError) {
      throw new Error(sourceSectionError.message);
    }

    if (sourceSection.school_year_id !== parsed.sourceSchoolYearId) {
      throw new Error("Source section does not match the source school year.");
    }

    if (
      parsed.sourceGradeLevelId &&
      sourceSection.grade_level_id !== parsed.sourceGradeLevelId
    ) {
      throw new Error("Source section does not match the source grade.");
    }
  }

  if (parsed.targetSectionId) {
    const { data: targetSection, error: targetSectionError } = await supabase
      .from("sections")
      .select("school_year_id,grade_level_id")
      .eq("id", parsed.targetSectionId)
      .single();

    if (targetSectionError) {
      throw new Error(targetSectionError.message);
    }

    if (
      targetSection.school_year_id !== parsed.targetSchoolYearId ||
      targetSection.grade_level_id !== parsed.targetGradeLevelId
    ) {
      throw new Error("Target section does not match the target year/grade.");
    }
  }

  let sourceQuery = supabase
    .from("learner_enrollments")
    .select("id,learner_id,school_year_id,grade_level_id,section_id")
    .eq("school_year_id", parsed.sourceSchoolYearId)
    .eq("enrollment_status", "enrolled");

  if (parsed.sourceGradeLevelId) {
    sourceQuery = sourceQuery.eq("grade_level_id", parsed.sourceGradeLevelId);
  }

  if (parsed.sourceSectionId) {
    sourceQuery = sourceQuery.eq("section_id", parsed.sourceSectionId);
  }

  const { data: sourceEnrollments, error: sourceError } = await sourceQuery;

  if (sourceError) {
    throw new Error(sourceError.message);
  }

  if (!sourceEnrollments?.length) {
    throw new Error("No enrolled learners matched the selected source cohort.");
  }

  const learnerIds = Array.from(
    new Set(sourceEnrollments.map((enrollment) => enrollment.learner_id)),
  );
  const { data: activeLearners, error: learnerError } = await supabase
    .from("learners")
    .select("id")
    .eq("status", "active")
    .in("id", learnerIds);

  if (learnerError) {
    throw new Error(learnerError.message);
  }

  const activeLearnerIds = new Set(
    (activeLearners ?? []).map((learner) => learner.id),
  );
  const promotableEnrollments = sourceEnrollments.filter((enrollment) =>
    activeLearnerIds.has(enrollment.learner_id),
  );

  if (!promotableEnrollments.length) {
    throw new Error("No active enrolled learners matched the selected cohort.");
  }

  const enrolledOn = parsed.enrolledOn ?? new Date().toISOString().slice(0, 10);
  const promotionRows = promotableEnrollments.map((enrollment) => ({
    learner_id: enrollment.learner_id,
    school_year_id: parsed.targetSchoolYearId,
    grade_level_id: parsed.targetGradeLevelId,
    section_id: parsed.targetSectionId ?? null,
    enrollment_status: "enrolled",
    promoted_from_enrollment_id: enrollment.id,
    enrolled_on: enrolledOn,
    created_by: admin.userId,
  }));

  const { data: promotedEnrollments, error: promotionError } = await supabase
    .from("learner_enrollments")
    .upsert(promotionRows, { onConflict: "learner_id,school_year_id" })
    .select("id,learner_id,promoted_from_enrollment_id");

  if (promotionError) {
    throw new Error(promotionError.message);
  }

  await logAuditEvent(supabase, {
    actorId: admin.userId,
    action: "promotion_batch_created",
    entityTable: "learner_enrollments",
    metadata: {
      sourceSchoolYearId: parsed.sourceSchoolYearId,
      targetSchoolYearId: parsed.targetSchoolYearId,
      sourceGradeLevelId: parsed.sourceGradeLevelId ?? null,
      sourceSectionId: parsed.sourceSectionId ?? null,
      targetGradeLevelId: parsed.targetGradeLevelId,
      targetSectionId: parsed.targetSectionId ?? null,
      promotedCount: promotedEnrollments?.length ?? 0,
    },
  });

  if (promotedEnrollments?.length) {
    await supabase.from("audit_logs").insert(
      promotedEnrollments.map((enrollment) => ({
        actor_id: admin.userId,
        action: "learner_promoted",
        entity_table: "learner_enrollments",
        entity_id: enrollment.id,
        metadata: {
          learnerId: enrollment.learner_id,
          sourceEnrollmentId: enrollment.promoted_from_enrollment_id,
          targetSchoolYearId: parsed.targetSchoolYearId,
          targetGradeLevelId: parsed.targetGradeLevelId,
          targetSectionId: parsed.targetSectionId ?? null,
        },
      })),
    );
  }

  revalidatePromotionViews();
}
