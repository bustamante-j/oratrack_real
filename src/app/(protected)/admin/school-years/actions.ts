"use server";

import { revalidatePath } from "next/cache";

import { logAuditEvent } from "@/lib/audit";
import { requireAdminProfile } from "@/lib/auth/session";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import {
  schoolYearFormSchema,
  schoolYearStatusFormSchema,
} from "@/lib/validation/domain";

export async function createSchoolYearAction(formData: FormData) {
  const admin = await requireAdminProfile();
  const parsed = schoolYearFormSchema.parse({
    name: formData.get("name"),
    startsOn: formData.get("startsOn"),
    endsOn: formData.get("endsOn"),
  });
  const supabase = await createSupabaseServerClient();

  const { data, error } = await supabase
    .from("school_years")
    .insert({
      name: parsed.name,
      starts_on: parsed.startsOn,
      ends_on: parsed.endsOn,
      status: "draft",
      created_by: admin.userId,
    })
    .select("id")
    .single();

  if (error) {
    throw new Error(error.message);
  }

  await logAuditEvent(supabase, {
    actorId: admin.userId,
    action: "school_year_created",
    entityTable: "school_years",
    entityId: data.id,
    metadata: { name: parsed.name },
  });

  revalidatePath("/admin/school-years");
}

export async function updateSchoolYearStatusAction(formData: FormData) {
  const admin = await requireAdminProfile();
  const parsed = schoolYearStatusFormSchema.parse({
    id: formData.get("id"),
    status: formData.get("status"),
  });
  const supabase = await createSupabaseServerClient();

  if (parsed.status === "active") {
    const { error: closeError } = await supabase
      .from("school_years")
      .update({ status: "closed" })
      .eq("status", "active")
      .neq("id", parsed.id);

    if (closeError) {
      throw new Error(closeError.message);
    }
  }

  const { error } = await supabase
    .from("school_years")
    .update({ status: parsed.status })
    .eq("id", parsed.id);

  if (error) {
    throw new Error(error.message);
  }

  await logAuditEvent(supabase, {
    actorId: admin.userId,
    action: "school_year_status_changed",
    entityTable: "school_years",
    entityId: parsed.id,
    metadata: { status: parsed.status },
  });

  revalidatePath("/admin/school-years");
  revalidatePath("/admin/sections");
}
