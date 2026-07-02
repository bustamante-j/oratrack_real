import "server-only";

import { cache } from "react";
import { redirect } from "next/navigation";

import { canOpenRoleArea, getRoleLandingPath } from "@/lib/auth/permissions";
import { isSupabaseConfigured } from "@/lib/env";
import { getAvatarUrl } from "@/lib/profile/avatar";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import type { AppRole } from "@/types/domain";

type ProfileRecord = {
  user_id: string;
  email: string | null;
  full_name: string | null;
  role: AppRole;
  status: "active" | "inactive";
  avatar_path: string | null;
};

export type AuthProfile = {
  userId: string;
  email: string;
  fullName: string;
  role: AppRole;
  status: "active" | "inactive";
  avatarPath: string | null;
  avatarUrl: string | null;
};

export type SessionState =
  | { kind: "unconfigured" }
  | { kind: "anonymous" }
  | { kind: "authenticated"; profile: AuthProfile };

export const getSessionProfile = cache(async (): Promise<SessionState> => {
  if (!isSupabaseConfigured()) {
    return { kind: "unconfigured" };
  }

  const supabase = await createSupabaseServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return { kind: "anonymous" };
  }

  const { data } = await supabase
    .from("profiles")
    .select("user_id,email,full_name,role,status,avatar_path")
    .eq("user_id", user.id)
    .single();
  const profile = data as unknown as ProfileRecord | null;

  if (!profile || profile.status !== "active") {
    return { kind: "anonymous" };
  }

  return {
    kind: "authenticated",
    profile: {
      userId: profile.user_id,
      email: profile.email ?? user.email ?? "",
      fullName: profile.full_name ?? user.email ?? "Staff user",
      role: profile.role,
      status: profile.status,
      avatarPath: profile.avatar_path,
      avatarUrl: getAvatarUrl(profile.avatar_path),
    },
  };
});

export async function requireRole(pathname: string) {
  const session = await getSessionProfile();

  if (session.kind === "unconfigured") return session;
  if (session.kind === "anonymous") redirect("/login");

  if (!canOpenRoleArea(session.profile.role, pathname)) {
    redirect(getRoleLandingPath(session.profile.role));
  }

  return session;
}

export async function requireAdminProfile() {
  const session = await getSessionProfile();

  if (session.kind === "unconfigured") {
    throw new Error("Supabase is not configured.");
  }

  if (session.kind === "anonymous") {
    redirect("/login");
  }

  if (session.profile.role !== "admin_principal") {
    redirect(getRoleLandingPath(session.profile.role));
  }

  return session.profile;
}

export async function requireAuthenticatedProfile() {
  const session = await getSessionProfile();

  if (session.kind === "unconfigured") {
    throw new Error("Supabase is not configured.");
  }

  if (session.kind === "anonymous") {
    redirect("/login");
  }

  return session.profile;
}
