"use server";

import { revalidatePath } from "next/cache";

import { logAuditEvent } from "@/lib/audit";
import { requireAuthenticatedProfile } from "@/lib/auth/session";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { changePasswordSchema, type FormState } from "@/lib/validation/auth";
import { staffProfileUpdateSchema } from "@/lib/validation/domain";

const avatarTypes = new Map([
  ["image/jpeg", "jpg"],
  ["image/png", "png"],
  ["image/webp", "webp"],
]);
const maxAvatarBytes = 2 * 1024 * 1024;

export async function updateOwnProfileAction(
  _state: FormState,
  formData: FormData,
): Promise<FormState> {
  const parsed = staffProfileUpdateSchema.safeParse({
    fullName: formData.get("fullName"),
    phone: formData.get("phone"),
  });

  if (!parsed.success) {
    return { errors: parsed.error.flatten().fieldErrors };
  }

  const profile = await requireAuthenticatedProfile();
  const supabase = await createSupabaseServerClient();
  const { error } = await supabase
    .from("profiles")
    .update({
      full_name: parsed.data.fullName,
      phone: parsed.data.phone?.trim() || null,
    })
    .eq("user_id", profile.userId);

  if (error) {
    return { message: "Profile could not be saved." };
  }

  await logAuditEvent(supabase, {
    actorId: profile.userId,
    action: "own_profile_updated",
    entityTable: "profiles",
    entityId: profile.userId,
    metadata: { fields: ["full_name", "phone"] },
  });

  revalidatePath("/admin/profile");
  revalidatePath("/teacher/profile");

  return { message: "Profile saved." };
}

export async function uploadOwnAvatarAction(
  _state: FormState,
  formData: FormData,
): Promise<FormState> {
  const file = formData.get("avatar");

  if (!(file instanceof File) || file.size === 0) {
    return { message: "Choose a profile image." };
  }

  const extension = avatarTypes.get(file.type);

  if (!extension) {
    return { message: "Use a JPG, PNG, or WebP image." };
  }

  if (file.size > maxAvatarBytes) {
    return { message: "Profile image must be 2MB or smaller." };
  }

  const profile = await requireAuthenticatedProfile();
  const supabase = await createSupabaseServerClient();
  const { data: currentProfile } = await supabase
    .from("profiles")
    .select("avatar_path")
    .eq("user_id", profile.userId)
    .maybeSingle();
  const objectPath = `${profile.userId}/avatar.${extension}`;
  const { error: uploadError } = await supabase.storage
    .from("avatars")
    .upload(objectPath, file, {
      cacheControl: "3600",
      contentType: file.type,
      upsert: true,
    });

  if (uploadError) {
    return { message: "Profile image could not be uploaded." };
  }

  const { error: updateError } = await supabase
    .from("profiles")
    .update({ avatar_path: objectPath })
    .eq("user_id", profile.userId);

  if (updateError) {
    return { message: "Profile image could not be saved." };
  }

  const previousPath = currentProfile?.avatar_path;

  if (previousPath && previousPath !== objectPath) {
    await supabase.storage.from("avatars").remove([previousPath]);
  }

  await logAuditEvent(supabase, {
    actorId: profile.userId,
    action: "own_avatar_updated",
    entityTable: "profiles",
    entityId: profile.userId,
    metadata: { contentType: file.type },
  });

  revalidatePath("/admin/profile");
  revalidatePath("/teacher/profile");
  revalidatePath("/admin");
  revalidatePath("/teacher");

  return { message: "Profile image saved." };
}

export async function changeOwnPasswordAction(
  _state: FormState,
  formData: FormData,
): Promise<FormState> {
  const parsed = changePasswordSchema.safeParse({
    currentPassword: formData.get("currentPassword"),
    newPassword: formData.get("newPassword"),
    confirmPassword: formData.get("confirmPassword"),
  });

  if (!parsed.success) {
    return { errors: parsed.error.flatten().fieldErrors };
  }

  const profile = await requireAuthenticatedProfile();

  if (!profile.email) {
    return { message: "This account does not have an email address." };
  }

  const supabase = await createSupabaseServerClient();
  const { error: verifyError } = await supabase.auth.signInWithPassword({
    email: profile.email,
    password: parsed.data.currentPassword,
  });

  if (verifyError) {
    return { message: "Current password is incorrect." };
  }

  const { error: updateError } = await supabase.auth.updateUser({
    password: parsed.data.newPassword,
  });

  if (updateError) {
    return { message: "Password could not be changed." };
  }

  await logAuditEvent(supabase, {
    actorId: profile.userId,
    action: "own_password_changed",
    entityTable: "profiles",
    entityId: profile.userId,
    metadata: {},
  });

  return { message: "Password changed." };
}
