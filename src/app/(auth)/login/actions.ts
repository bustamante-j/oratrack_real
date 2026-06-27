"use server";

import { redirect } from "next/navigation";

import { getRoleLandingPath } from "@/lib/auth/permissions";
import { isSupabaseConfigured } from "@/lib/env";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { loginSchema, type FormState } from "@/lib/validation/auth";
import type { AppRole } from "@/types/domain";

type LoginProfile = {
  role: AppRole;
  status: "active" | "inactive";
};

export async function loginAction(
  _state: FormState,
  formData: FormData,
): Promise<FormState> {
  const parsed = loginSchema.safeParse({
    email: formData.get("email"),
    password: formData.get("password"),
  });

  if (!parsed.success) {
    return { errors: parsed.error.flatten().fieldErrors };
  }

  if (!isSupabaseConfigured()) {
    return {
      message:
        "Supabase is not configured yet. Add NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY first.",
    };
  }

  const supabase = await createSupabaseServerClient();
  const { error } = await supabase.auth.signInWithPassword(parsed.data);

  if (error) {
    return { message: "Invalid email or password." };
  }

  const {
    data: { user },
  } = await supabase.auth.getUser();

  const { data } = await supabase
    .from("profiles")
    .select("role,status")
    .eq("user_id", user?.id ?? "")
    .single();
  const profile = data as unknown as LoginProfile | null;

  if (!profile || profile.status !== "active") {
    await supabase.auth.signOut();
    return { message: "This account is not active." };
  }

  redirect(getRoleLandingPath(profile.role));
}
