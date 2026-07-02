"use server";

import { getAiPermissionNotice, buildSafeDraft } from "@/lib/ai/policy";
import { requireAuthenticatedProfile } from "@/lib/auth/session";
import { hasAiProviderKey } from "@/lib/env";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { aiAssistantFormSchema } from "@/lib/validation/domain";
import type { Json } from "@/types/database";

export type AiAssistantState = {
  draft?: string;
  notice?: string;
  mode?: string;
  prompt?: string;
  message?: string;
  errors?: Record<string, string[] | undefined>;
};

function optionalFormValue(value: FormDataEntryValue | null) {
  if (typeof value !== "string") return undefined;

  const trimmed = value.trim();
  return trimmed.length ? trimmed : undefined;
}

function excerpt(value: string, limit = 500) {
  return value.length > limit ? `${value.slice(0, limit)}...` : value;
}

async function buildPermissionContext(
  supabase: Awaited<ReturnType<typeof createSupabaseServerClient>>,
  scope: {
    learnerId?: string;
    sectionId?: string;
    schoolYearId?: string;
  },
) {
  const lines: string[] = [];
  const [
    learnerResult,
    enrollmentResult,
    attendanceResult,
    gradeResult,
    literacyResult,
    interventionResult,
  ] = await Promise.all([
    supabase
      .from("learners")
      .select("id,lrn,first_name,middle_name,last_name,extension_name,status"),
    supabase
      .from("learner_enrollments")
      .select(
        "id,learner_id,school_year_id,grade_level_id,section_id,enrollment_status",
      ),
    supabase.from("attendance_records").select("id,enrollment_id"),
    supabase
      .from("grades")
      .select("id,enrollment_id,numeric_grade,subject_id,grade_period_id"),
    supabase
      .from("literacy_numeracy_records")
      .select("id,enrollment_id,literacy_rating,numeracy_rating"),
    supabase
      .from("interventions")
      .select("id,learner_id,enrollment_id,status,category"),
  ]);

  const firstError =
    learnerResult.error ??
    enrollmentResult.error ??
    attendanceResult.error ??
    gradeResult.error ??
    literacyResult.error ??
    interventionResult.error;

  if (firstError) {
    throw new Error(firstError.message);
  }

  const learners = learnerResult.data ?? [];
  const enrollments = enrollmentResult.data ?? [];
  const attendanceRecords = attendanceResult.data ?? [];
  const grades = gradeResult.data ?? [];
  const literacyRecords = literacyResult.data ?? [];
  const interventions = interventionResult.data ?? [];
  const scopedEnrollments = enrollments.filter((enrollment) => {
    const matchesLearner = scope.learnerId
      ? enrollment.learner_id === scope.learnerId
      : true;
    const matchesSection = scope.sectionId
      ? enrollment.section_id === scope.sectionId
      : true;
    const matchesYear = scope.schoolYearId
      ? enrollment.school_year_id === scope.schoolYearId
      : true;

    return matchesLearner && matchesSection && matchesYear;
  });
  const scopedEnrollmentIds = new Set(
    scopedEnrollments.map((enrollment) => enrollment.id),
  );
  const scopedLearnerIds = new Set(
    scopedEnrollments.map((enrollment) => enrollment.learner_id),
  );
  const scopedGrades = grades.filter((grade) =>
    scopedEnrollmentIds.has(grade.enrollment_id),
  );
  const gradeAverage = scopedGrades.length
    ? scopedGrades.reduce(
        (sum, grade) => sum + Number(grade.numeric_grade),
        0,
      ) / scopedGrades.length
    : null;

  lines.push(
    `Visible learners in scope: ${scopedLearnerIds.size || learners.length}`,
  );
  lines.push(`Enrollments in scope: ${scopedEnrollments.length}`);
  lines.push(
    `Attendance records in scope: ${
      scopedEnrollmentIds.size
        ? attendanceRecords.filter((record) =>
            scopedEnrollmentIds.has(record.enrollment_id),
          ).length
        : attendanceRecords.length
    }`,
  );
  lines.push(
    `Grade records in scope: ${scopedGrades.length}${
      gradeAverage === null ? "" : `, average ${gradeAverage.toFixed(2)}`
    }`,
  );
  lines.push(
    `Literacy/numeracy records in scope: ${
      scopedEnrollmentIds.size
        ? literacyRecords.filter((record) =>
            scopedEnrollmentIds.has(record.enrollment_id),
          ).length
        : literacyRecords.length
    }`,
  );
  lines.push(
    `Interventions in scope: ${
      scopedLearnerIds.size
        ? interventions.filter((intervention) =>
            scopedLearnerIds.has(intervention.learner_id),
          ).length
        : interventions.length
    }`,
  );

  if (scope.learnerId) {
    const learner = learners.find((item) => item.id === scope.learnerId);
    if (learner) {
      lines.push(
        `Selected learner: ${[
          learner.first_name,
          learner.middle_name,
          learner.last_name,
          learner.extension_name,
        ]
          .filter(Boolean)
          .join(" ")} (${learner.lrn})`,
      );
    }
  }

  return lines.join("\n");
}

export async function submitAiPromptAction(
  _state: AiAssistantState,
  formData: FormData,
): Promise<AiAssistantState> {
  const profile = await requireAuthenticatedProfile();
  const parsed = aiAssistantFormSchema.safeParse({
    intent: formData.get("intent"),
    scopeKind: formData.get("scopeKind"),
    scope: {
      learnerId: optionalFormValue(formData.get("learnerId")),
      sectionId: optionalFormValue(formData.get("sectionId")),
      schoolYearId: optionalFormValue(formData.get("schoolYearId")),
    },
    prompt: formData.get("prompt"),
  });

  if (!parsed.success) {
    return { errors: parsed.error.flatten().fieldErrors };
  }

  const supabase = await createSupabaseServerClient();
  const context = await buildPermissionContext(supabase, parsed.data.scope);
  const draft = [
    buildSafeDraft(parsed.data.intent, parsed.data.prompt),
    "",
    "Permission-scoped context snapshot:",
    context,
  ].join("\n");
  const mode = hasAiProviderKey() ? "safe-provider-ready" : "safe-stub";
  const notice = getAiPermissionNotice(profile.role);

  await supabase.from("ai_activity_logs").insert({
    actor_id: profile.userId,
    intent: parsed.data.intent,
    scope: parsed.data.scope as Json,
    prompt_excerpt: excerpt(parsed.data.prompt),
    output_excerpt: excerpt(draft),
    proposed_action: {
      mode,
      writePolicy: "confirmation_required",
      scopeKind: parsed.data.scopeKind,
    },
  });

  return {
    draft,
    notice,
    mode,
    prompt: parsed.data.prompt,
  };
}
