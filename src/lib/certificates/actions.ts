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
