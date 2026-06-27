"use server";

import { revalidatePath } from "next/cache";

import { logAuditEvent } from "@/lib/audit";
import { requireAdminProfile } from "@/lib/auth/session";
import { createSupabaseAdminClient } from "@/lib/supabase/admin";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import {
  teacherAccountCreateSchema,
  teacherAccountUpdateSchema,
  teacherPasswordResetSchema,
} from "@/lib/validation/domain";

const DISABLED_BAN_DURATION = "876000h";

function optionalFormValue(value: FormDataEntryValue | null) {
  if (typeof value !== "string") return undefined;

  const trimmed = value.trim();
  return trimmed.length ? trimmed : undefined;
}

function banDurationFor(status: "active" | "inactive") {
  return status === "active" ? "none" : DISABLED_BAN_DURATION;
}

async function revalidateUserManagement() {
  revalidatePath("/admin/users");
  revalidatePath("/admin/sections");
  revalidatePath("/admin/profile");
  revalidatePath("/teacher/profile");
}

export async function createTeacherAccountAction(formData: FormData) {
  const admin = await requireAdminProfile();
  const parsed = teacherAccountCreateSchema.parse({
    email: formData.get("email"),
    fullName: formData.get("fullName"),
    role: formData.get("role"),
    status: formData.get("status"),
    temporaryPassword: formData.get("temporaryPassword"),
    phone: optionalFormValue(formData.get("phone")),
    employeeNumber: optionalFormValue(formData.get("employeeNumber")),
    positionTitle: optionalFormValue(formData.get("positionTitle")),
    gradeSpecialization: optionalFormValue(formData.get("gradeSpecialization")),
  });
  const adminSupabase = createSupabaseAdminClient();
  const auditSupabase = await createSupabaseServerClient();

  const { data: createdUser, error: createError } =
    await adminSupabase.auth.admin.createUser({
      email: parsed.email,
      password: parsed.temporaryPassword,
      email_confirm: true,
      ban_duration: banDurationFor(parsed.status),
      user_metadata: {
        full_name: parsed.fullName,
        role: parsed.role,
        status: parsed.status,
      },
    });

  if (createError || !createdUser.user) {
    throw new Error(createError?.message ?? "Teacher account was not created.");
  }

  const userId = createdUser.user.id;
  const { error: profileError } = await adminSupabase.from("profiles").upsert({
    user_id: userId,
    email: parsed.email,
    full_name: parsed.fullName,
    role: parsed.role,
    status: parsed.status,
    phone: parsed.phone ?? null,
  });

  if (profileError) {
    await adminSupabase.auth.admin.deleteUser(userId);
    throw new Error(profileError.message);
  }

  const { error: teacherProfileError } = await adminSupabase
    .from("teacher_profiles")
    .upsert({
      profile_id: userId,
      employee_number: parsed.employeeNumber ?? null,
      position_title: parsed.positionTitle ?? null,
      grade_specialization: parsed.gradeSpecialization ?? null,
    });

  if (teacherProfileError) {
    await adminSupabase.auth.admin.deleteUser(userId);
    throw new Error(teacherProfileError.message);
  }

  await logAuditEvent(auditSupabase, {
    actorId: admin.userId,
    action: "account_created",
    entityTable: "profiles",
    entityId: userId,
    metadata: {
      email: parsed.email,
      role: parsed.role,
      status: parsed.status,
    },
  });

  await revalidateUserManagement();
}

export async function updateTeacherAccountAction(formData: FormData) {
  const admin = await requireAdminProfile();
  const parsed = teacherAccountUpdateSchema.parse({
    userId: formData.get("userId"),
    fullName: formData.get("fullName"),
    role: formData.get("role"),
    status: formData.get("status"),
    phone: optionalFormValue(formData.get("phone")),
    employeeNumber: optionalFormValue(formData.get("employeeNumber")),
    positionTitle: optionalFormValue(formData.get("positionTitle")),
    gradeSpecialization: optionalFormValue(formData.get("gradeSpecialization")),
  });

  if (
    parsed.userId === admin.userId &&
    (parsed.role !== "admin_principal" || parsed.status !== "active")
  ) {
    throw new Error("You cannot remove your own active admin access.");
  }

  const adminSupabase = createSupabaseAdminClient();
  const auditSupabase = await createSupabaseServerClient();
  const { data: currentProfile, error: currentProfileError } =
    await adminSupabase
      .from("profiles")
      .select("role,status,email")
      .eq("user_id", parsed.userId)
      .single();

  if (currentProfileError) {
    throw new Error(currentProfileError.message);
  }

  const { error: profileError } = await adminSupabase
    .from("profiles")
    .update({
      full_name: parsed.fullName,
      role: parsed.role,
      status: parsed.status,
      phone: parsed.phone ?? null,
    })
    .eq("user_id", parsed.userId);

  if (profileError) {
    throw new Error(profileError.message);
  }

  const { error: teacherProfileError } = await adminSupabase
    .from("teacher_profiles")
    .upsert({
      profile_id: parsed.userId,
      employee_number: parsed.employeeNumber ?? null,
      position_title: parsed.positionTitle ?? null,
      grade_specialization: parsed.gradeSpecialization ?? null,
    });

  if (teacherProfileError) {
    throw new Error(teacherProfileError.message);
  }

  const { error: authError } = await adminSupabase.auth.admin.updateUserById(
    parsed.userId,
    {
      ban_duration: banDurationFor(parsed.status),
      user_metadata: {
        full_name: parsed.fullName,
        role: parsed.role,
        status: parsed.status,
      },
    },
  );

  if (authError) {
    throw new Error(authError.message);
  }

  await logAuditEvent(auditSupabase, {
    actorId: admin.userId,
    action: "account_updated",
    entityTable: "profiles",
    entityId: parsed.userId,
    metadata: {
      previousRole: currentProfile.role,
      role: parsed.role,
      previousStatus: currentProfile.status,
      status: parsed.status,
    },
  });

  if (currentProfile.role !== parsed.role) {
    await logAuditEvent(auditSupabase, {
      actorId: admin.userId,
      action: "role_changed",
      entityTable: "profiles",
      entityId: parsed.userId,
      metadata: {
        previousRole: currentProfile.role,
        role: parsed.role,
      },
    });
  }

  if (currentProfile.status !== parsed.status) {
    await logAuditEvent(auditSupabase, {
      actorId: admin.userId,
      action: "account_status_changed",
      entityTable: "profiles",
      entityId: parsed.userId,
      metadata: {
        previousStatus: currentProfile.status,
        status: parsed.status,
      },
    });
  }

  await revalidateUserManagement();
}

export async function resetTeacherPasswordAction(formData: FormData) {
  const admin = await requireAdminProfile();
  const parsed = teacherPasswordResetSchema.parse({
    userId: formData.get("userId"),
    temporaryPassword: formData.get("temporaryPassword"),
  });
  const adminSupabase = createSupabaseAdminClient();
  const auditSupabase = await createSupabaseServerClient();

  const { error } = await adminSupabase.auth.admin.updateUserById(
    parsed.userId,
    { password: parsed.temporaryPassword },
  );

  if (error) {
    throw new Error(error.message);
  }

  await logAuditEvent(auditSupabase, {
    actorId: admin.userId,
    action: "password_reset_requested",
    entityTable: "profiles",
    entityId: parsed.userId,
    metadata: { method: "temporary_password" },
  });

  await revalidateUserManagement();
}
