"use server";

import { revalidatePath } from "next/cache";

import { logAuditEvent } from "@/lib/audit";
import { requireAdminProfile } from "@/lib/auth/session";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import {
  schoolYearFormSchema,
  schoolYearStatusFormSchema,
  standardGradePeriodsFormSchema,
} from "@/lib/validation/domain";

const standardGradePeriods = [
  { code: "Q1", name: "Quarter 1", sort_order: 1 },
  { code: "Q2", name: "Quarter 2", sort_order: 2 },
  { code: "Q3", name: "Quarter 3", sort_order: 3 },
  { code: "Q4", name: "Quarter 4", sort_order: 4 },
];

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

export async function createStandardGradePeriodsAction(formData: FormData) {
  const admin = await requireAdminProfile();
  const parsed = standardGradePeriodsFormSchema.parse({
    schoolYearId: formData.get("schoolYearId"),
  });
  const supabase = await createSupabaseServerClient();

  const { error } = await supabase.from("grade_periods").upsert(
    standardGradePeriods.map((period) => ({
      school_year_id: parsed.schoolYearId,
      code: period.code,
      name: period.name,
      sort_order: period.sort_order,
    })),
    { onConflict: "school_year_id,code" },
  );

  if (error) {
    throw new Error(error.message);
  }

  await logAuditEvent(supabase, {
    actorId: admin.userId,
    action: "grade_periods_seeded",
    entityTable: "grade_periods",
    metadata: {
      schoolYearId: parsed.schoolYearId,
      codes: standardGradePeriods.map((period) => period.code),
    },
  });

  revalidatePath("/admin/school-years");
  revalidatePath("/teacher/grades");
  revalidatePath("/admin/analytics");
}
