"use server";

import { revalidatePath } from "next/cache";

import { logAuditEvent } from "@/lib/audit";
import { requireAdminProfile } from "@/lib/auth/session";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import {
  learnerCreateFormSchema,
  learnerEnrollmentFormSchema,
  learnerGuardianFormSchema,
  learnerStatusFormSchema,
  learnerUpdateFormSchema,
} from "@/lib/validation/domain";

function optionalFormValue(value: FormDataEntryValue | null) {
  if (typeof value !== "string") return undefined;

  const trimmed = value.trim();
  return trimmed.length ? trimmed : undefined;
}

function nullableText(value: string | undefined) {
  return value?.trim() || null;
}

function revalidateLearnerViews() {
  revalidatePath("/admin/learners");
  revalidatePath("/teacher/learners");
  revalidatePath("/admin/analytics");
  revalidatePath("/teacher/ai");
  revalidatePath("/admin/ai");
}

export async function createLearnerAction(formData: FormData) {
  const admin = await requireAdminProfile();
  const parsed = learnerCreateFormSchema.parse({
    lrn: formData.get("lrn"),
    firstName: formData.get("firstName"),
    middleName: optionalFormValue(formData.get("middleName")),
    lastName: formData.get("lastName"),
    extensionName: optionalFormValue(formData.get("extensionName")),
    sex: formData.get("sex"),
    birthDate: formData.get("birthDate"),
    address: optionalFormValue(formData.get("address")),
    guardianFullName: optionalFormValue(formData.get("guardianFullName")),
    guardianRelationship: optionalFormValue(
      formData.get("guardianRelationship"),
    ),
    guardianPhone: optionalFormValue(formData.get("guardianPhone")),
    guardianEmail: optionalFormValue(formData.get("guardianEmail")),
    guardianAddress: optionalFormValue(formData.get("guardianAddress")),
  });
  const supabase = await createSupabaseServerClient();

  const { data: learner, error } = await supabase
    .from("learners")
    .insert({
      lrn: parsed.lrn,
      first_name: parsed.firstName,
      middle_name: nullableText(parsed.middleName),
      last_name: parsed.lastName,
      extension_name: nullableText(parsed.extensionName),
      sex: parsed.sex,
      birth_date: parsed.birthDate,
      address: nullableText(parsed.address),
      status: "active",
      created_by: admin.userId,
    })
    .select("id")
    .single();

  if (error) {
    throw new Error(error.message);
  }

  if (parsed.guardianFullName) {
    const { error: guardianError } = await supabase
      .from("learner_guardians")
      .insert({
        learner_id: learner.id,
        full_name: parsed.guardianFullName,
        relationship: parsed.guardianRelationship ?? "Guardian",
        phone: nullableText(parsed.guardianPhone),
        email: nullableText(parsed.guardianEmail),
        address: nullableText(parsed.guardianAddress),
        is_primary: true,
      });

    if (guardianError) {
      await supabase.from("learners").delete().eq("id", learner.id);
      throw new Error(guardianError.message);
    }
  }

  await logAuditEvent(supabase, {
    actorId: admin.userId,
    action: "learner_created",
    entityTable: "learners",
    entityId: learner.id,
    metadata: { lrn: parsed.lrn },
  });

  revalidateLearnerViews();
}

export async function updateLearnerAction(formData: FormData) {
  const admin = await requireAdminProfile();
  const parsed = learnerUpdateFormSchema.parse({
    id: formData.get("id"),
    lrn: formData.get("lrn"),
    firstName: formData.get("firstName"),
    middleName: optionalFormValue(formData.get("middleName")),
    lastName: formData.get("lastName"),
    extensionName: optionalFormValue(formData.get("extensionName")),
    sex: formData.get("sex"),
    birthDate: formData.get("birthDate"),
    address: optionalFormValue(formData.get("address")),
  });
  const supabase = await createSupabaseServerClient();

  const { error } = await supabase
    .from("learners")
    .update({
      lrn: parsed.lrn,
      first_name: parsed.firstName,
      middle_name: nullableText(parsed.middleName),
      last_name: parsed.lastName,
      extension_name: nullableText(parsed.extensionName),
      sex: parsed.sex,
      birth_date: parsed.birthDate,
      address: nullableText(parsed.address),
    })
    .eq("id", parsed.id);

  if (error) {
    throw new Error(error.message);
  }

  await logAuditEvent(supabase, {
    actorId: admin.userId,
    action: "learner_updated",
    entityTable: "learners",
    entityId: parsed.id,
    metadata: { lrn: parsed.lrn },
  });

  revalidateLearnerViews();
}

export async function setLearnerStatusAction(formData: FormData) {
  const admin = await requireAdminProfile();
  const parsed = learnerStatusFormSchema.parse({
    id: formData.get("id"),
    status: formData.get("status"),
  });
  const supabase = await createSupabaseServerClient();
  const { error } = await supabase
    .from("learners")
    .update({
      status: parsed.status,
      archived_at:
        parsed.status === "archived" ? new Date().toISOString() : null,
    })
    .eq("id", parsed.id);

  if (error) {
    throw new Error(error.message);
  }

  await logAuditEvent(supabase, {
    actorId: admin.userId,
    action:
      parsed.status === "archived" ? "learner_archived" : "learner_updated",
    entityTable: "learners",
    entityId: parsed.id,
    metadata: { status: parsed.status },
  });

  revalidateLearnerViews();
}

export async function upsertLearnerEnrollmentAction(formData: FormData) {
  const admin = await requireAdminProfile();
  const parsed = learnerEnrollmentFormSchema.parse({
    learnerId: formData.get("learnerId"),
    schoolYearId: formData.get("schoolYearId"),
    gradeLevelId: formData.get("gradeLevelId"),
    sectionId: optionalFormValue(formData.get("sectionId")),
    enrollmentStatus: formData.get("enrollmentStatus") || "enrolled",
    enrolledOn: optionalFormValue(formData.get("enrolledOn")),
  });
  const supabase = await createSupabaseServerClient();

  if (parsed.sectionId) {
    const { data: section, error: sectionError } = await supabase
      .from("sections")
      .select("school_year_id,grade_level_id")
      .eq("id", parsed.sectionId)
      .single();

    if (sectionError) {
      throw new Error(sectionError.message);
    }

    if (
      section.school_year_id !== parsed.schoolYearId ||
      section.grade_level_id !== parsed.gradeLevelId
    ) {
      throw new Error("Section does not match the selected school year/grade.");
    }
  }

  const { data: existingEnrollment, error: existingEnrollmentError } =
    await supabase
      .from("learner_enrollments")
      .select("id")
      .eq("learner_id", parsed.learnerId)
      .eq("school_year_id", parsed.schoolYearId)
      .maybeSingle();

  if (existingEnrollmentError) {
    throw new Error(existingEnrollmentError.message);
  }

  const enrollmentPayload = {
    learner_id: parsed.learnerId,
    school_year_id: parsed.schoolYearId,
    grade_level_id: parsed.gradeLevelId,
    section_id: parsed.sectionId ?? null,
    enrollment_status: parsed.enrollmentStatus,
    enrolled_on: parsed.enrolledOn ?? new Date().toISOString().slice(0, 10),
  };

  const mutation = existingEnrollment
    ? supabase
        .from("learner_enrollments")
        .update(enrollmentPayload)
        .eq("id", existingEnrollment.id)
        .select("id")
        .single()
    : supabase
        .from("learner_enrollments")
        .insert({
          ...enrollmentPayload,
          created_by: admin.userId,
        })
        .select("id")
        .single();

  const { data: enrollment, error } = await mutation;

  if (error) {
    throw new Error(error.message);
  }

  await logAuditEvent(supabase, {
    actorId: admin.userId,
    action: existingEnrollment
      ? "learner_enrollment_updated"
      : "learner_enrolled",
    entityTable: "learner_enrollments",
    entityId: enrollment.id,
    metadata: {
      learnerId: parsed.learnerId,
      schoolYearId: parsed.schoolYearId,
      gradeLevelId: parsed.gradeLevelId,
      sectionId: parsed.sectionId ?? null,
    },
  });

  revalidateLearnerViews();
}

export async function upsertPrimaryGuardianAction(formData: FormData) {
  const admin = await requireAdminProfile();
  const parsed = learnerGuardianFormSchema.parse({
    learnerId: formData.get("learnerId"),
    fullName: formData.get("fullName"),
    relationship: formData.get("relationship"),
    phone: optionalFormValue(formData.get("phone")),
    email: optionalFormValue(formData.get("email")),
    address: optionalFormValue(formData.get("address")),
  });
  const supabase = await createSupabaseServerClient();
  const { data: existingGuardian, error: existingGuardianError } =
    await supabase
      .from("learner_guardians")
      .select("id")
      .eq("learner_id", parsed.learnerId)
      .eq("is_primary", true)
      .maybeSingle();

  if (existingGuardianError) {
    throw new Error(existingGuardianError.message);
  }

  const guardianPayload = {
    learner_id: parsed.learnerId,
    full_name: parsed.fullName,
    relationship: parsed.relationship,
    phone: nullableText(parsed.phone),
    email: nullableText(parsed.email),
    address: nullableText(parsed.address),
    is_primary: true,
  };

  const mutation = existingGuardian
    ? supabase
        .from("learner_guardians")
        .update(guardianPayload)
        .eq("id", existingGuardian.id)
        .select("id")
        .single()
    : supabase
        .from("learner_guardians")
        .insert(guardianPayload)
        .select("id")
        .single();

  const { data: guardian, error } = await mutation;

  if (error) {
    throw new Error(error.message);
  }

  await logAuditEvent(supabase, {
    actorId: admin.userId,
    action: "learner_guardian_updated",
    entityTable: "learner_guardians",
    entityId: guardian.id,
    metadata: { learnerId: parsed.learnerId },
  });

  revalidateLearnerViews();
}
