"use server";

import { revalidatePath } from "next/cache";

import { logAuditEvent } from "@/lib/audit";
import {
  requireAdminProfile,
  requireAuthenticatedProfile,
} from "@/lib/auth/session";
import { createSupabaseAdminClient } from "@/lib/supabase/admin";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import {
  publicEventFormSchema,
  publicEventModerationSchema,
} from "@/lib/validation/domain";

function optionalFormValue(value: FormDataEntryValue | null) {
  if (typeof value !== "string") return undefined;

  const trimmed = value.trim();
  return trimmed.length ? trimmed : undefined;
}

function manilaDateTimeToIso(value: string) {
  const trimmed = value.trim();
  if (!trimmed) return trimmed;
  if (trimmed.endsWith("Z") || /[+-]\d{2}:\d{2}$/.test(trimmed)) {
    return new Date(trimmed).toISOString();
  }

  const normalized = trimmed.length === 16 ? `${trimmed}:00` : trimmed;
  return new Date(`${normalized}+08:00`).toISOString();
}

function revalidateEventViews() {
  revalidatePath("/");
  revalidatePath("/events");
  revalidatePath("/admin/events");
  revalidatePath("/teacher/events");
}

export async function submitPublicEventAction(formData: FormData) {
  const profile = await requireAuthenticatedProfile();
  const parsed = publicEventFormSchema.parse({
    title: formData.get("title"),
    body: optionalFormValue(formData.get("body")),
    startsAt: formData.get("startsAt"),
    endsAt: optionalFormValue(formData.get("endsAt")),
  });
  const supabase = await createSupabaseServerClient();
  const adminSupabase = createSupabaseAdminClient();
  const isAdmin = profile.role === "admin_principal";
  const { data: event, error } = await adminSupabase
    .from("public_events")
    .insert({
      title: parsed.title,
      body: parsed.body ?? null,
      starts_at: manilaDateTimeToIso(parsed.startsAt),
      ends_at: parsed.endsAt ? manilaDateTimeToIso(parsed.endsAt) : null,
      published_at: isAdmin ? new Date().toISOString() : null,
      created_by: profile.userId,
    })
    .select("id")
    .single();

  if (error) {
    throw new Error(error.message);
  }

  await logAuditEvent(supabase, {
    actorId: profile.userId,
    action: isAdmin ? "public_event_published" : "public_event_submitted",
    entityTable: "public_events",
    entityId: event.id,
    metadata: {
      title: parsed.title,
      published: isAdmin,
    },
  });

  revalidateEventViews();
}

export async function approvePublicEventAction(formData: FormData) {
  const admin = await requireAdminProfile();
  const parsed = publicEventModerationSchema.parse({
    id: formData.get("id"),
  });
  const supabase = await createSupabaseServerClient();
  const { error } = await supabase
    .from("public_events")
    .update({ published_at: new Date().toISOString() })
    .eq("id", parsed.id);

  if (error) {
    throw new Error(error.message);
  }

  await logAuditEvent(supabase, {
    actorId: admin.userId,
    action: "public_event_approved",
    entityTable: "public_events",
    entityId: parsed.id,
  });

  revalidateEventViews();
}

export async function unpublishPublicEventAction(formData: FormData) {
  const admin = await requireAdminProfile();
  const parsed = publicEventModerationSchema.parse({
    id: formData.get("id"),
  });
  const supabase = await createSupabaseServerClient();
  const { error } = await supabase
    .from("public_events")
    .update({ published_at: null })
    .eq("id", parsed.id);

  if (error) {
    throw new Error(error.message);
  }

  await logAuditEvent(supabase, {
    actorId: admin.userId,
    action: "public_event_unpublished",
    entityTable: "public_events",
    entityId: parsed.id,
  });

  revalidateEventViews();
}

export async function deletePublicEventAction(formData: FormData) {
  const admin = await requireAdminProfile();
  const parsed = publicEventModerationSchema.parse({
    id: formData.get("id"),
  });
  const supabase = await createSupabaseServerClient();
  const { error } = await supabase
    .from("public_events")
    .delete()
    .eq("id", parsed.id);

  if (error) {
    throw new Error(error.message);
  }

  await logAuditEvent(supabase, {
    actorId: admin.userId,
    action: "public_event_deleted",
    entityTable: "public_events",
    entityId: parsed.id,
  });

  revalidateEventViews();
}
