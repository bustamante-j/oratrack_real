"use server";

import { revalidatePath } from "next/cache";

import { logAuditEvent } from "@/lib/audit";
import { requireAdminProfile } from "@/lib/auth/session";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { lessonPlanReviewFormSchema } from "@/lib/validation/domain";

function revalidateLessonPlanViews() {
  revalidatePath("/teacher/lesson-plans");
  revalidatePath("/admin/lesson-plans");
  revalidatePath("/admin/analytics");
}

export async function reviewLessonPlanAction(formData: FormData) {
  const admin = await requireAdminProfile();
  const parsed = lessonPlanReviewFormSchema.parse({
    lessonPlanId: formData.get("lessonPlanId"),
    status: formData.get("status"),
  });
  const supabase = await createSupabaseServerClient();
  const reviewedAt =
    parsed.status === "reviewed" || parsed.status === "archived"
      ? new Date().toISOString()
      : null;
  const { error } = await supabase
    .from("lesson_plans")
    .update({
      status: parsed.status,
      reviewed_by: reviewedAt ? admin.userId : null,
      reviewed_at: reviewedAt,
    })
    .eq("id", parsed.lessonPlanId);

  if (error) {
    throw new Error(error.message);
  }

  await logAuditEvent(supabase, {
    actorId: admin.userId,
    action: "lesson_plan_reviewed",
    entityTable: "lesson_plans",
    entityId: parsed.lessonPlanId,
    metadata: {
      status: parsed.status,
    },
  });

  revalidateLessonPlanViews();
}
