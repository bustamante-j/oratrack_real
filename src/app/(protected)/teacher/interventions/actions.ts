"use server";

import { revalidatePath } from "next/cache";

import { logAuditEvent } from "@/lib/audit";
import { requireAuthenticatedProfile } from "@/lib/auth/session";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import {
  interventionCreateFormSchema,
  interventionUpdateFormSchema,
} from "@/lib/validation/domain";

function optionalFormValue(value: FormDataEntryValue | null) {
  if (typeof value !== "string") return undefined;

  const trimmed = value.trim();
  return trimmed.length ? trimmed : undefined;
}

function todayDateValue() {
  return new Date().toISOString().slice(0, 10);
}

function revalidateInterventionViews() {
  revalidatePath("/teacher/interventions");
  revalidatePath("/teacher/learners");
  revalidatePath("/teacher/literacy-numeracy");
  revalidatePath("/teacher/reports");
  revalidatePath("/admin/analytics");
  revalidatePath("/admin/reports");
  revalidatePath("/teacher/ai");
  revalidatePath("/admin/ai");
}

export async function createInterventionAction(formData: FormData) {
  const profile = await requireAuthenticatedProfile();
  const parsed = interventionCreateFormSchema.parse({
    enrollmentId: formData.get("enrollmentId"),
    category: formData.get("category"),
    status: formData.get("status") || "planned",
    startedOn: formData.get("startedOn") || todayDateValue(),
    followUpOn: optionalFormValue(formData.get("followUpOn")),
    notes: formData.get("notes"),
  });
  const supabase = await createSupabaseServerClient();
  const { data: enrollment, error: enrollmentError } = await supabase
    .from("learner_enrollments")
    .select("id,learner_id,enrollment_status")
    .eq("id", parsed.enrollmentId)
    .single();

  if (enrollmentError) {
    throw new Error(enrollmentError.message);
  }

  if (enrollment.enrollment_status !== "enrolled") {
    throw new Error("Intervention learner is not actively enrolled.");
  }

  const { data: intervention, error } = await supabase
    .from("interventions")
    .insert({
      learner_id: enrollment.learner_id,
      enrollment_id: parsed.enrollmentId,
      teacher_id: profile.userId,
      category: parsed.category,
      status: parsed.status,
      started_on: parsed.startedOn,
      follow_up_on: parsed.followUpOn ?? null,
      notes: parsed.notes,
    })
    .select("id")
    .single();

  if (error) {
    throw new Error(error.message);
  }

  const { error: updateError } = await supabase
    .from("intervention_updates")
    .insert({
      intervention_id: intervention.id,
      status: parsed.status,
      notes: parsed.notes,
      follow_up_on: parsed.followUpOn ?? null,
      created_by: profile.userId,
    });

  if (updateError) {
    throw new Error(updateError.message);
  }

  await logAuditEvent(supabase, {
    actorId: profile.userId,
    action: "intervention_created",
    entityTable: "interventions",
    entityId: intervention.id,
    metadata: {
      learnerId: enrollment.learner_id,
      enrollmentId: parsed.enrollmentId,
      category: parsed.category,
      status: parsed.status,
    },
  });

  revalidateInterventionViews();
}

export async function addInterventionUpdateAction(formData: FormData) {
  const profile = await requireAuthenticatedProfile();
  const parsed = interventionUpdateFormSchema.parse({
    interventionId: formData.get("interventionId"),
    status: formData.get("status"),
    followUpOn: optionalFormValue(formData.get("followUpOn")),
    notes: formData.get("notes"),
  });
  const supabase = await createSupabaseServerClient();
  const { data: currentIntervention, error: currentError } = await supabase
    .from("interventions")
    .select("id,teacher_id,learner_id,enrollment_id,category")
    .eq("id", parsed.interventionId)
    .single();

  if (currentError) {
    throw new Error(currentError.message);
  }

  if (
    profile.role !== "admin_principal" &&
    currentIntervention.teacher_id !== profile.userId
  ) {
    throw new Error("Only the intervention owner can update this record.");
  }

  const { error } = await supabase
    .from("interventions")
    .update({
      status: parsed.status,
      follow_up_on: parsed.followUpOn ?? null,
      notes: parsed.notes,
    })
    .eq("id", parsed.interventionId);

  if (error) {
    throw new Error(error.message);
  }

  const { error: updateError } = await supabase
    .from("intervention_updates")
    .insert({
      intervention_id: parsed.interventionId,
      status: parsed.status,
      notes: parsed.notes,
      follow_up_on: parsed.followUpOn ?? null,
      created_by: profile.userId,
    });

  if (updateError) {
    throw new Error(updateError.message);
  }

  await logAuditEvent(supabase, {
    actorId: profile.userId,
    action: "intervention_updated",
    entityTable: "interventions",
    entityId: parsed.interventionId,
    metadata: {
      learnerId: currentIntervention.learner_id,
      enrollmentId: currentIntervention.enrollment_id,
      category: currentIntervention.category,
      status: parsed.status,
    },
  });

  revalidateInterventionViews();
}
