"use server";

import { revalidatePath } from "next/cache";

import { logAuditEvent } from "@/lib/audit";
import {
  requireAdminProfile,
  requireAuthenticatedProfile,
} from "@/lib/auth/session";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import {
  certificateGenerateFormSchema,
  certificateTemplateFormSchema,
} from "@/lib/validation/domain";
import type { Json } from "@/types/database";

function optionalFormValue(value: FormDataEntryValue | null) {
  if (typeof value !== "string") return undefined;

  const trimmed = value.trim();
  return trimmed.length ? trimmed : undefined;
}

function safeStorageName(value: string) {
  const fallback = "template";
  const cleaned = value
    .toLowerCase()
    .replace(/[^a-z0-9.]+/g, "-")
    .replace(/(^-|-$)/g, "")
    .slice(0, 80);

  return cleaned || fallback;
}

async function uploadTemplateImage(
  supabase: Awaited<ReturnType<typeof createSupabaseServerClient>>,
  file: FormDataEntryValue | null,
  userId: string,
) {
  if (!(file instanceof File) || file.size === 0) return null;

  const allowedTypes = new Set(["image/jpeg", "image/png", "image/webp"]);

  if (!allowedTypes.has(file.type)) {
    throw new Error("Template image must be a JPG, PNG, or WebP file.");
  }

  if (file.size > 5 * 1024 * 1024) {
    throw new Error("Template image must be 5MB or smaller.");
  }

  const objectPath = `templates/${userId}/${crypto.randomUUID()}-${safeStorageName(
    file.name,
  )}`;
  const { error } = await supabase.storage
    .from("certificates")
    .upload(objectPath, file, {
      contentType: file.type,
      upsert: false,
    });

  if (error) {
    throw new Error(error.message);
  }

  return {
    imagePath: objectPath,
    imageMimeType: file.type,
    imageOriginalName: file.name,
  };
}

function revalidateCertificateViews() {
  revalidatePath("/admin/certificates");
  revalidatePath("/teacher/certificates");
  revalidatePath("/admin/analytics");
  revalidatePath("/admin/reports");
  revalidatePath("/teacher/reports");
}

export async function createCertificateTemplateAction(formData: FormData) {
  const admin = await requireAdminProfile();
  const parsed = certificateTemplateFormSchema.parse({
    name: formData.get("name"),
    certificateType: formData.get("certificateType"),
  });
  const supabase = await createSupabaseServerClient();
  const templateImage = await uploadTemplateImage(
    supabase,
    formData.get("templateImage"),
    admin.userId,
  );
  const { data, error } = await supabase
    .from("certificate_templates")
    .insert({
      name: parsed.name,
      certificate_type: parsed.certificateType,
      template_payload: {
        title:
          parsed.certificateType === "completion"
            ? "Certificate of Completion"
            : "Certificate of Recognition",
        layout: "clean-landscape",
        accentColor: "#0b2447",
        ...templateImage,
      } satisfies Json,
      is_active: true,
      created_by: admin.userId,
    })
    .select("id")
    .single();

  if (error) {
    throw new Error(error.message);
  }

  await logAuditEvent(supabase, {
    actorId: admin.userId,
    action: "certificate_template_changed",
    entityTable: "certificate_templates",
    entityId: data.id,
    metadata: {
      name: parsed.name,
      certificateType: parsed.certificateType,
      hasImage: Boolean(templateImage),
    },
  });

  revalidateCertificateViews();
}

export async function generateCertificateAction(formData: FormData) {
  const profile = await requireAuthenticatedProfile();
  const parsed = certificateGenerateFormSchema.parse({
    enrollmentId: formData.get("enrollmentId"),
    certificateType: formData.get("certificateType"),
    templateId: optionalFormValue(formData.get("templateId")),
  });
  const supabase = await createSupabaseServerClient();

  if (parsed.templateId) {
    const { data: template, error: templateError } = await supabase
      .from("certificate_templates")
      .select("id,certificate_type,is_active")
      .eq("id", parsed.templateId)
      .single();

    if (templateError) {
      throw new Error(templateError.message);
    }

    if (!template.is_active) {
      throw new Error("Selected certificate template is inactive.");
    }

    if (template.certificate_type !== parsed.certificateType) {
      throw new Error(
        "Selected template type does not match certificate type.",
      );
    }
  }

  const { data: certificate, error } = await supabase
    .from("generated_certificates")
    .insert({
      certificate_template_id: parsed.templateId ?? null,
      enrollment_id: parsed.enrollmentId,
      certificate_type: parsed.certificateType,
      file_path: null,
      generated_by: profile.userId,
    })
    .select("id")
    .single();

  if (error) {
    throw new Error(error.message);
  }

  await logAuditEvent(supabase, {
    actorId: profile.userId,
    action: "certificate_generated",
    entityTable: "generated_certificates",
    entityId: certificate.id,
    metadata: {
      enrollmentId: parsed.enrollmentId,
      certificateType: parsed.certificateType,
      templateId: parsed.templateId ?? null,
    },
  });

  revalidateCertificateViews();
}
