"use server";

import { revalidatePath } from "next/cache";

import { logAuditEvent } from "@/lib/audit";
import { requireAdminProfile } from "@/lib/auth/session";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import {
  sectionFormSchema,
  sectionSubjectFormSchema,
  subjectFormSchema,
} from "@/lib/validation/domain";

function optionalFormValue(value: FormDataEntryValue | null) {
  if (typeof value !== "string") return undefined;

  const trimmed = value.trim();
  return trimmed.length ? trimmed : undefined;
}

export async function createSubjectAction(formData: FormData) {
  const admin = await requireAdminProfile();
  const parsed = subjectFormSchema.parse({
    code: formData.get("code"),
    name: formData.get("name"),
    gradeLevelId: optionalFormValue(formData.get("gradeLevelId")),
  });
  const supabase = await createSupabaseServerClient();

  const { data, error } = await supabase
    .from("subjects")
    .insert({
      code: parsed.code.toUpperCase(),
      name: parsed.name,
      grade_level_id: parsed.gradeLevelId ?? null,
      is_active: true,
    })
    .select("id")
    .single();

  if (error) {
    throw new Error(error.message);
  }

  await logAuditEvent(supabase, {
    actorId: admin.userId,
    action: "subject_created",
    entityTable: "subjects",
    entityId: data.id,
    metadata: {
      code: parsed.code.toUpperCase(),
      gradeLevelId: parsed.gradeLevelId ?? null,
    },
  });

  revalidatePath("/admin/sections");
}

export async function createSectionAction(formData: FormData) {
  const admin = await requireAdminProfile();
  const parsed = sectionFormSchema.parse({
    schoolYearId: formData.get("schoolYearId"),
    gradeLevelId: formData.get("gradeLevelId"),
    name: formData.get("name"),
    adviserId: optionalFormValue(formData.get("adviserId")),
    room: optionalFormValue(formData.get("room")),
  });
  const supabase = await createSupabaseServerClient();

  const { data, error } = await supabase
    .from("sections")
    .insert({
      school_year_id: parsed.schoolYearId,
      grade_level_id: parsed.gradeLevelId,
      name: parsed.name,
      adviser_id: parsed.adviserId ?? null,
      room: parsed.room ?? null,
    })
    .select("id")
    .single();

  if (error) {
    throw new Error(error.message);
  }

  await logAuditEvent(supabase, {
    actorId: admin.userId,
    action: "section_created",
    entityTable: "sections",
    entityId: data.id,
    metadata: {
      schoolYearId: parsed.schoolYearId,
      gradeLevelId: parsed.gradeLevelId,
      adviserId: parsed.adviserId ?? null,
    },
  });

  revalidatePath("/admin/sections");
}

export async function assignSectionSubjectAction(formData: FormData) {
  const admin = await requireAdminProfile();
  const parsed = sectionSubjectFormSchema.parse({
    sectionId: formData.get("sectionId"),
    subjectId: formData.get("subjectId"),
    teacherId: optionalFormValue(formData.get("teacherId")),
  });
  const supabase = await createSupabaseServerClient();

  const { data, error } = await supabase
    .from("section_subjects")
    .upsert(
      {
        section_id: parsed.sectionId,
        subject_id: parsed.subjectId,
        teacher_id: parsed.teacherId ?? null,
      },
      { onConflict: "section_id,subject_id" },
    )
    .select("id")
    .single();

  if (error) {
    throw new Error(error.message);
  }

  await logAuditEvent(supabase, {
    actorId: admin.userId,
    action: "section_subject_assigned",
    entityTable: "section_subjects",
    entityId: data.id,
    metadata: {
      sectionId: parsed.sectionId,
      subjectId: parsed.subjectId,
      teacherId: parsed.teacherId ?? null,
    },
  });

  revalidatePath("/admin/sections");
}
