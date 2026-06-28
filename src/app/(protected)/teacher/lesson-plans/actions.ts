"use server";

import { revalidatePath } from "next/cache";

import { logAuditEvent } from "@/lib/audit";
import { requireAuthenticatedProfile } from "@/lib/auth/session";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import {
  lessonPlanReplaceFormSchema,
  lessonPlanUploadFormSchema,
} from "@/lib/validation/domain";

const lessonPlanBucket = "lesson-plans";
const allowedMimeTypes = new Set([
  "application/pdf",
  "application/msword",
  "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
]);
const maxFileSize = 10 * 1024 * 1024;

function optionalFormValue(value: FormDataEntryValue | null) {
  if (typeof value !== "string") return undefined;

  const trimmed = value.trim();
  return trimmed.length ? trimmed : undefined;
}

function safeFilename(value: string) {
  const clean = value
    .toLowerCase()
    .replace(/[^a-z0-9.]+/g, "-")
    .replace(/(^-|-$)/g, "")
    .slice(0, 120);

  return clean || "lesson-plan";
}

function revalidateLessonPlanViews() {
  revalidatePath("/teacher/lesson-plans");
  revalidatePath("/admin/lesson-plans");
  revalidatePath("/admin/analytics");
}

export async function uploadLessonPlanAction(formData: FormData) {
  const profile = await requireAuthenticatedProfile();
  const parsed = lessonPlanUploadFormSchema.parse({
    schoolYearId: formData.get("schoolYearId"),
    gradeLevelId: optionalFormValue(formData.get("gradeLevelId")),
    subjectId: optionalFormValue(formData.get("subjectId")),
    title: formData.get("title"),
  });
  const file = formData.get("lessonFile");

  if (!(file instanceof File) || file.size === 0) {
    throw new Error("Upload a PDF or Word lesson-plan file.");
  }

  if (file.size > maxFileSize) {
    throw new Error("Lesson-plan files must be 10MB or smaller.");
  }

  if (!allowedMimeTypes.has(file.type)) {
    throw new Error("Only PDF, DOC, and DOCX lesson-plan files are allowed.");
  }

  const supabase = await createSupabaseServerClient();
  const objectPath = `${profile.userId}/${Date.now()}-${safeFilename(file.name)}`;
  const { error: uploadError } = await supabase.storage
    .from(lessonPlanBucket)
    .upload(objectPath, file, {
      contentType: file.type,
      upsert: false,
    });

  if (uploadError) {
    throw new Error(uploadError.message);
  }

  const { data: uploadedFile, error: fileError } = await supabase
    .from("uploaded_files")
    .insert({
      bucket_id: lessonPlanBucket,
      object_path: objectPath,
      original_filename: file.name,
      mime_type: file.type,
      byte_size: file.size,
      uploaded_by: profile.userId,
    })
    .select("id")
    .single();

  if (fileError) {
    throw new Error(fileError.message);
  }

  const { data: lessonPlan, error: planError } = await supabase
    .from("lesson_plans")
    .insert({
      school_year_id: parsed.schoolYearId,
      grade_level_id: parsed.gradeLevelId ?? null,
      subject_id: parsed.subjectId ?? null,
      teacher_id: profile.userId,
      title: parsed.title,
      file_id: uploadedFile.id,
      status: "uploaded",
    })
    .select("id")
    .single();

  if (planError) {
    throw new Error(planError.message);
  }

  await logAuditEvent(supabase, {
    actorId: profile.userId,
    action: "lesson_plan_uploaded",
    entityTable: "lesson_plans",
    entityId: lessonPlan.id,
    metadata: {
      schoolYearId: parsed.schoolYearId,
      gradeLevelId: parsed.gradeLevelId ?? null,
      subjectId: parsed.subjectId ?? null,
      fileId: uploadedFile.id,
      originalFilename: file.name,
      byteSize: file.size,
    },
  });

  revalidateLessonPlanViews();
}

export async function replaceLessonPlanFileAction(formData: FormData) {
  const profile = await requireAuthenticatedProfile();
  const parsed = lessonPlanReplaceFormSchema.parse({
    lessonPlanId: formData.get("lessonPlanId"),
  });
  const file = formData.get("replacementFile");

  if (!(file instanceof File) || file.size === 0) {
    throw new Error("Upload a replacement PDF or Word lesson-plan file.");
  }

  if (file.size > maxFileSize) {
    throw new Error("Lesson-plan files must be 10MB or smaller.");
  }

  if (!allowedMimeTypes.has(file.type)) {
    throw new Error("Only PDF, DOC, and DOCX lesson-plan files are allowed.");
  }

  const supabase = await createSupabaseServerClient();
  const { data: currentPlan, error: currentError } = await supabase
    .from("lesson_plans")
    .select("id,teacher_id,title")
    .eq("id", parsed.lessonPlanId)
    .single();

  if (currentError) {
    throw new Error(currentError.message);
  }

  if (currentPlan.teacher_id !== profile.userId) {
    throw new Error("Only the lesson-plan owner can replace this file.");
  }

  const objectPath = `${profile.userId}/${Date.now()}-${safeFilename(file.name)}`;
  const { error: uploadError } = await supabase.storage
    .from(lessonPlanBucket)
    .upload(objectPath, file, {
      contentType: file.type,
      upsert: false,
    });

  if (uploadError) {
    throw new Error(uploadError.message);
  }

  const { data: uploadedFile, error: fileError } = await supabase
    .from("uploaded_files")
    .insert({
      bucket_id: lessonPlanBucket,
      object_path: objectPath,
      original_filename: file.name,
      mime_type: file.type,
      byte_size: file.size,
      uploaded_by: profile.userId,
    })
    .select("id")
    .single();

  if (fileError) {
    throw new Error(fileError.message);
  }

  const { error: updateError } = await supabase
    .from("lesson_plans")
    .update({
      file_id: uploadedFile.id,
      status: "replaced",
      reviewed_by: null,
      reviewed_at: null,
    })
    .eq("id", currentPlan.id);

  if (updateError) {
    throw new Error(updateError.message);
  }

  await logAuditEvent(supabase, {
    actorId: profile.userId,
    action: "lesson_plan_uploaded",
    entityTable: "lesson_plans",
    entityId: currentPlan.id,
    metadata: {
      replacement: true,
      fileId: uploadedFile.id,
      title: currentPlan.title,
      originalFilename: file.name,
      byteSize: file.size,
    },
  });

  revalidateLessonPlanViews();
}
