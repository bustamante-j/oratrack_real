import { BadgeCheck, BriefcaseBusiness, Mail, ShieldCheck } from "lucide-react";

import { ProfileForms } from "@/components/profile/profile-forms";
import { EmptyState } from "@/components/ui/empty-state";
import { requireRole } from "@/lib/auth/session";
import { roleLabels } from "@/lib/constants";
import { getAvatarUrl } from "@/lib/profile/avatar";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import type { AppRole } from "@/types/domain";

type ProfileRecord = {
  user_id: string;
  email: string | null;
  full_name: string | null;
  role: AppRole;
  status: "active" | "inactive";
  phone: string | null;
  avatar_path: string | null;
};

type TeacherProfileRecord = {
  profile_id: string;
  employee_number: string | null;
  position_title: string | null;
  grade_specialization: string | null;
};

export async function ProfileSettings({
  title,
  rolePath,
}: {
  title: string;
  rolePath: "/admin" | "/teacher";
}) {
  const session = await requireRole(rolePath);

  if (session.kind === "unconfigured") {
    return (
      <EmptyState
        message="Connect Supabase before editing profile details."
        title="Profile unavailable"
      />
    );
  }

  const supabase = await createSupabaseServerClient();
  const [profileResult, teacherProfileResult] = await Promise.all([
    supabase
      .from("profiles")
      .select("user_id,email,full_name,role,status,phone,avatar_path")
      .eq("user_id", session.profile.userId)
      .single(),
    supabase
      .from("teacher_profiles")
      .select("profile_id,employee_number,position_title,grade_specialization")
      .eq("profile_id", session.profile.userId)
      .maybeSingle(),
  ]);

  if (profileResult.error) {
    throw new Error(profileResult.error.message);
  }

  if (teacherProfileResult.error) {
    throw new Error(teacherProfileResult.error.message);
  }

  const profile = profileResult.data as ProfileRecord;
  const teacherProfile =
    teacherProfileResult.data as TeacherProfileRecord | null;

  return (
    <div className="space-y-4">
      <div>
        <h1 className="font-display text-2xl font-extrabold text-navy-950">
          {title}
        </h1>
      </div>

      <section className="rounded-lg border border-slate-200 bg-white p-4 shadow-soft">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
          <div>
            <div className="flex flex-wrap items-center gap-2">
              <span className="rounded-full bg-navy-900 px-3 py-1 text-xs font-bold text-white">
                {roleLabels[profile.role]}
              </span>
              <span className="rounded-full bg-emerald-50 px-3 py-1 text-xs font-bold text-emerald-700">
                {profile.status}
              </span>
            </div>
            <h2 className="mt-3 font-display text-xl font-extrabold text-navy-950">
              {profile.full_name || profile.email || "Staff account"}
            </h2>
            <p className="mt-1 text-sm text-slate-600">
              {profile.email ?? "No email address"}
            </p>
          </div>

          <div className="grid gap-2 text-sm text-slate-600 sm:grid-cols-2 lg:min-w-[28rem]">
            <div className="rounded-lg bg-slate-50 p-3">
              <Mail className="text-skybrand-600" size={18} />
              <p className="mt-2 text-xs font-bold uppercase text-slate-500">
                Phone
              </p>
              <p className="mt-1 font-semibold text-navy-950">
                {profile.phone || "Unassigned"}
              </p>
            </div>
            <div className="rounded-lg bg-slate-50 p-3">
              <BadgeCheck className="text-skybrand-600" size={18} />
              <p className="mt-2 text-xs font-bold uppercase text-slate-500">
                Employee number
              </p>
              <p className="mt-1 font-semibold text-navy-950">
                {teacherProfile?.employee_number || "Unassigned"}
              </p>
            </div>
            <div className="rounded-lg bg-slate-50 p-3">
              <BriefcaseBusiness className="text-skybrand-600" size={18} />
              <p className="mt-2 text-xs font-bold uppercase text-slate-500">
                Position
              </p>
              <p className="mt-1 font-semibold text-navy-950">
                {teacherProfile?.position_title || "Unassigned"}
              </p>
            </div>
            <div className="rounded-lg bg-slate-50 p-3">
              <ShieldCheck className="text-skybrand-600" size={18} />
              <p className="mt-2 text-xs font-bold uppercase text-slate-500">
                Specialization
              </p>
              <p className="mt-1 font-semibold text-navy-950">
                {teacherProfile?.grade_specialization || "Unassigned"}
              </p>
            </div>
          </div>
        </div>
      </section>

      <ProfileForms
        profile={{
          avatarUrl: getAvatarUrl(profile.avatar_path),
          fullName: profile.full_name ?? "",
          phone: profile.phone ?? "",
        }}
      />
    </div>
  );
}
