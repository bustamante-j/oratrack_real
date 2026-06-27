import {
  KeyRound,
  MailPlus,
  ShieldCheck,
  UserCog,
  UsersRound,
} from "lucide-react";

import { ButtonLink } from "@/components/ui/button";
import { EmptyState } from "@/components/ui/empty-state";
import { SubmitButton } from "@/components/ui/submit-button";
import { roleLabels } from "@/lib/constants";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { appRoles, type AppRole } from "@/types/domain";

import {
  createTeacherAccountAction,
  resetTeacherPasswordAction,
  updateTeacherAccountAction,
} from "./actions";

export const metadata = {
  title: "Teacher Accounts",
};

type StaffProfile = {
  user_id: string;
  email: string | null;
  full_name: string | null;
  role: AppRole;
  status: "active" | "inactive";
  phone: string | null;
  created_at: string;
  last_login_at: string | null;
};

type TeacherProfile = {
  profile_id: string;
  employee_number: string | null;
  position_title: string | null;
  grade_specialization: string | null;
};

type SchoolYear = {
  id: string;
  name: string;
  status: "draft" | "active" | "closed";
};

type GradeLevel = {
  id: number;
  label: string;
};

type Section = {
  id: string;
  school_year_id: string;
  grade_level_id: number;
  name: string;
  adviser_id: string | null;
};

type Subject = {
  id: string;
  code: string;
  name: string;
};

type SectionSubject = {
  id: string;
  section_id: string;
  subject_id: string;
  teacher_id: string | null;
};

function staffLabel(profile: StaffProfile) {
  return profile.full_name || profile.email || "Unnamed staff";
}

function roleTone(role: AppRole) {
  if (role === "admin_principal") return "bg-navy-900 text-white";
  if (role === "adviser") return "bg-skybrand-50 text-skybrand-700";
  return "bg-slate-100 text-slate-700";
}

function statusTone(status: "active" | "inactive") {
  return status === "active"
    ? "bg-emerald-50 text-emerald-700"
    : "bg-rose-50 text-rose-700";
}

export default async function UsersPage() {
  const supabase = await createSupabaseServerClient();
  const [
    profileResult,
    teacherProfileResult,
    schoolYearResult,
    gradeLevelResult,
    sectionResult,
    subjectResult,
    sectionSubjectResult,
  ] = await Promise.all([
    supabase
      .from("profiles")
      .select(
        "user_id,email,full_name,role,status,phone,created_at,last_login_at",
      )
      .order("created_at", { ascending: false }),
    supabase
      .from("teacher_profiles")
      .select("profile_id,employee_number,position_title,grade_specialization"),
    supabase
      .from("school_years")
      .select("id,name,status")
      .order("starts_on", { ascending: false }),
    supabase
      .from("grade_levels")
      .select("id,label")
      .order("id", { ascending: true }),
    supabase
      .from("sections")
      .select("id,school_year_id,grade_level_id,name,adviser_id")
      .order("name", { ascending: true }),
    supabase.from("subjects").select("id,code,name").order("code"),
    supabase
      .from("section_subjects")
      .select("id,section_id,subject_id,teacher_id"),
  ]);

  const firstError =
    profileResult.error ??
    teacherProfileResult.error ??
    schoolYearResult.error ??
    gradeLevelResult.error ??
    sectionResult.error ??
    subjectResult.error ??
    sectionSubjectResult.error;

  if (firstError) {
    throw new Error(firstError.message);
  }

  const profiles = (profileResult.data ?? []) as StaffProfile[];
  const teacherProfiles = (teacherProfileResult.data ?? []) as TeacherProfile[];
  const schoolYears = (schoolYearResult.data ?? []) as SchoolYear[];
  const gradeLevels = (gradeLevelResult.data ?? []) as GradeLevel[];
  const sections = (sectionResult.data ?? []) as Section[];
  const subjects = (subjectResult.data ?? []) as Subject[];
  const sectionSubjects = (sectionSubjectResult.data ?? []) as SectionSubject[];

  const teacherProfileById = new Map(
    teacherProfiles.map((profile) => [profile.profile_id, profile]),
  );
  const yearById = new Map(schoolYears.map((year) => [year.id, year]));
  const gradeById = new Map(gradeLevels.map((grade) => [grade.id, grade]));
  const sectionById = new Map(sections.map((section) => [section.id, section]));
  const subjectById = new Map(subjects.map((subject) => [subject.id, subject]));
  const adviserSectionsByProfile = sections.reduce((map, section) => {
    if (!section.adviser_id) return map;

    const current = map.get(section.adviser_id) ?? [];
    current.push(section);
    map.set(section.adviser_id, current);
    return map;
  }, new Map<string, Section[]>());
  const subjectAssignmentsByProfile = sectionSubjects.reduce(
    (map, assignment) => {
      if (!assignment.teacher_id) return map;

      const current = map.get(assignment.teacher_id) ?? [];
      current.push(assignment);
      map.set(assignment.teacher_id, current);
      return map;
    },
    new Map<string, SectionSubject[]>(),
  );

  const activeCount = profiles.filter(
    (profile) => profile.status === "active",
  ).length;
  const inactiveCount = profiles.length - activeCount;
  const adviserCount = profiles.filter(
    (profile) => profile.role === "adviser",
  ).length;
  const subjectTeacherCount = profiles.filter(
    (profile) => profile.role === "subject_teacher",
  ).length;

  return (
    <div className="space-y-8">
      <div className="flex flex-col gap-4 xl:flex-row xl:items-end xl:justify-between">
        <div>
          <p className="text-xs font-bold uppercase text-skybrand-600">
            Phase 5
          </p>
          <h1 className="mt-3 font-display text-3xl font-extrabold text-navy-950">
            Teacher accounts
          </h1>
          <p className="mt-3 max-w-3xl text-sm leading-7 text-slate-600">
            Create staff sign-ins, maintain roles and active status, reset
            passwords, and review the assignments that scope teacher access.
          </p>
        </div>
        <ButtonLink href="/admin/sections" variant="secondary">
          Manage section assignments
        </ButtonLink>
      </div>

      <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
        {[
          ["Active", activeCount],
          ["Inactive", inactiveCount],
          ["Advisers", adviserCount],
          ["Subject teachers", subjectTeacherCount],
        ].map(([label, value]) => (
          <section
            className="rounded-[1.5rem] border border-slate-200 bg-white p-5 shadow-soft"
            key={label}
          >
            <p className="text-3xl font-extrabold text-navy-950">{value}</p>
            <p className="mt-1 text-xs font-bold uppercase text-slate-500">
              {label}
            </p>
          </section>
        ))}
      </div>

      <section className="rounded-[1.5rem] border border-slate-200 bg-white p-6 shadow-soft">
        <div className="flex items-start gap-3">
          <span className="grid size-12 place-items-center rounded-2xl bg-skybrand-50 text-skybrand-600">
            <MailPlus size={23} />
          </span>
          <div>
            <h2 className="font-display text-xl font-extrabold text-navy-950">
              Create staff account
            </h2>
            <p className="mt-1 text-sm text-slate-500">
              New accounts are confirmed immediately and use the temporary
              password entered here.
            </p>
          </div>
        </div>

        <form
          action={createTeacherAccountAction}
          className="mt-6 grid gap-4 lg:grid-cols-4"
        >
          <label className="lg:col-span-2">
            <span className="label">Full name</span>
            <input className="input" name="fullName" required />
          </label>
          <label className="lg:col-span-2">
            <span className="label">Email address</span>
            <input className="input" name="email" required type="email" />
          </label>
          <label>
            <span className="label">Temporary password</span>
            <input
              className="input"
              minLength={8}
              name="temporaryPassword"
              required
              type="password"
            />
          </label>
          <label>
            <span className="label">Role</span>
            <select className="input" name="role" required>
              {appRoles.map((role) => (
                <option key={role} value={role}>
                  {roleLabels[role]}
                </option>
              ))}
            </select>
          </label>
          <label>
            <span className="label">Status</span>
            <select className="input" name="status" required>
              <option value="active">Active</option>
              <option value="inactive">Inactive</option>
            </select>
          </label>
          <label>
            <span className="label">Phone</span>
            <input className="input" name="phone" />
          </label>
          <label>
            <span className="label">Employee number</span>
            <input className="input" name="employeeNumber" />
          </label>
          <label>
            <span className="label">Position title</span>
            <input className="input" name="positionTitle" />
          </label>
          <label className="lg:col-span-2">
            <span className="label">Grade specialization</span>
            <input className="input" name="gradeSpecialization" />
          </label>
          <div className="flex items-end">
            <SubmitButton>Create account</SubmitButton>
          </div>
        </form>
      </section>

      <section className="rounded-[1.5rem] border border-slate-200 bg-white p-6 shadow-soft">
        <div className="flex items-start gap-3">
          <span className="grid size-12 place-items-center rounded-2xl bg-skybrand-50 text-skybrand-600">
            <UsersRound size={24} />
          </span>
          <div>
            <h2 className="font-display text-xl font-extrabold text-navy-950">
              Staff directory
            </h2>
            <p className="mt-1 text-sm text-slate-500">
              Role and status changes are audited. Section access is managed
              from the sections workspace.
            </p>
          </div>
        </div>

        {profiles.length ? (
          <div className="mt-6 grid gap-4">
            {profiles.map((profile) => {
              const teacherProfile = teacherProfileById.get(profile.user_id);
              const adviserSections =
                adviserSectionsByProfile.get(profile.user_id) ?? [];
              const subjectAssignments =
                subjectAssignmentsByProfile.get(profile.user_id) ?? [];

              return (
                <article
                  className="rounded-[1.25rem] border border-slate-200 bg-slate-50 p-5"
                  key={profile.user_id}
                >
                  <div className="grid gap-5 xl:grid-cols-[0.95fr_1.05fr]">
                    <div>
                      <div className="flex flex-wrap items-center gap-2">
                        <span
                          className={`rounded-full px-3 py-1 text-xs font-bold ${roleTone(profile.role)}`}
                        >
                          {roleLabels[profile.role]}
                        </span>
                        <span
                          className={`rounded-full px-3 py-1 text-xs font-bold ${statusTone(profile.status)}`}
                        >
                          {profile.status}
                        </span>
                      </div>
                      <h3 className="mt-4 font-display text-xl font-extrabold text-navy-950">
                        {staffLabel(profile)}
                      </h3>
                      <p className="mt-1 text-sm text-slate-600">
                        {profile.email ?? "No email"}
                      </p>
                      <div className="mt-4 grid gap-2 text-sm text-slate-600 sm:grid-cols-2">
                        <p>
                          <span className="font-bold text-slate-700">
                            Employee:
                          </span>{" "}
                          {teacherProfile?.employee_number || "Unassigned"}
                        </p>
                        <p>
                          <span className="font-bold text-slate-700">
                            Phone:
                          </span>{" "}
                          {profile.phone || "Unassigned"}
                        </p>
                        <p>
                          <span className="font-bold text-slate-700">
                            Position:
                          </span>{" "}
                          {teacherProfile?.position_title || "Unassigned"}
                        </p>
                        <p>
                          <span className="font-bold text-slate-700">
                            Last login:
                          </span>{" "}
                          {profile.last_login_at
                            ? new Date(profile.last_login_at).toLocaleString()
                            : "Not recorded"}
                        </p>
                      </div>

                      <div className="mt-5 rounded-2xl bg-white p-4">
                        <p className="text-xs font-bold uppercase text-slate-500">
                          Current assignments
                        </p>
                        <div className="mt-3 flex flex-wrap gap-2">
                          {adviserSections.map((section) => (
                            <span
                              className="rounded-full bg-skybrand-50 px-3 py-1 text-xs font-bold text-skybrand-700"
                              key={section.id}
                            >
                              Adviser:{" "}
                              {gradeById.get(section.grade_level_id)?.label}{" "}
                              {section.name}
                            </span>
                          ))}
                          {subjectAssignments.map((assignment) => {
                            const section = sectionById.get(
                              assignment.section_id,
                            );
                            const subject = subjectById.get(
                              assignment.subject_id,
                            );

                            return (
                              <span
                                className="rounded-full bg-slate-100 px-3 py-1 text-xs font-bold text-slate-700"
                                key={assignment.id}
                              >
                                {subject?.code ?? "Subject"}:{" "}
                                {section
                                  ? `${gradeById.get(section.grade_level_id)?.label} ${section.name}`
                                  : "Section"}
                              </span>
                            );
                          })}
                          {!adviserSections.length &&
                          !subjectAssignments.length ? (
                            <span className="text-sm text-slate-500">
                              No section assignments
                            </span>
                          ) : null}
                        </div>
                        {adviserSections.length ? (
                          <p className="mt-3 text-xs text-slate-500">
                            Latest school year:{" "}
                            {yearById.get(adviserSections[0].school_year_id)
                              ?.name ?? "Unassigned"}
                          </p>
                        ) : null}
                      </div>
                    </div>

                    <div className="grid gap-4">
                      <details className="rounded-2xl border border-slate-200 bg-white p-4">
                        <summary className="flex cursor-pointer items-center gap-2 text-sm font-bold text-navy-950">
                          <UserCog size={17} />
                          Edit account
                        </summary>
                        <form
                          action={updateTeacherAccountAction}
                          className="mt-4 grid gap-4 sm:grid-cols-2"
                        >
                          <input
                            name="userId"
                            type="hidden"
                            value={profile.user_id}
                          />
                          <label className="sm:col-span-2">
                            <span className="label">Full name</span>
                            <input
                              className="input"
                              defaultValue={profile.full_name ?? ""}
                              name="fullName"
                              required
                            />
                          </label>
                          <label>
                            <span className="label">Role</span>
                            <select
                              className="input"
                              defaultValue={profile.role}
                              name="role"
                              required
                            >
                              {appRoles.map((role) => (
                                <option key={role} value={role}>
                                  {roleLabels[role]}
                                </option>
                              ))}
                            </select>
                          </label>
                          <label>
                            <span className="label">Status</span>
                            <select
                              className="input"
                              defaultValue={profile.status}
                              name="status"
                              required
                            >
                              <option value="active">Active</option>
                              <option value="inactive">Inactive</option>
                            </select>
                          </label>
                          <label>
                            <span className="label">Phone</span>
                            <input
                              className="input"
                              defaultValue={profile.phone ?? ""}
                              name="phone"
                            />
                          </label>
                          <label>
                            <span className="label">Employee number</span>
                            <input
                              className="input"
                              defaultValue={
                                teacherProfile?.employee_number ?? ""
                              }
                              name="employeeNumber"
                            />
                          </label>
                          <label>
                            <span className="label">Position title</span>
                            <input
                              className="input"
                              defaultValue={
                                teacherProfile?.position_title ?? ""
                              }
                              name="positionTitle"
                            />
                          </label>
                          <label>
                            <span className="label">Grade specialization</span>
                            <input
                              className="input"
                              defaultValue={
                                teacherProfile?.grade_specialization ?? ""
                              }
                              name="gradeSpecialization"
                            />
                          </label>
                          <div className="sm:col-span-2">
                            <SubmitButton>Save account</SubmitButton>
                          </div>
                        </form>
                      </details>

                      <details className="rounded-2xl border border-slate-200 bg-white p-4">
                        <summary className="flex cursor-pointer items-center gap-2 text-sm font-bold text-navy-950">
                          <KeyRound size={17} />
                          Reset password
                        </summary>
                        <form
                          action={resetTeacherPasswordAction}
                          className="mt-4 grid gap-4 sm:grid-cols-[1fr_auto]"
                        >
                          <input
                            name="userId"
                            type="hidden"
                            value={profile.user_id}
                          />
                          <label>
                            <span className="label">Temporary password</span>
                            <input
                              className="input"
                              minLength={8}
                              name="temporaryPassword"
                              required
                              type="password"
                            />
                          </label>
                          <div className="flex items-end">
                            <SubmitButton>Set password</SubmitButton>
                          </div>
                        </form>
                      </details>

                      <div className="rounded-2xl border border-slate-200 bg-white p-4">
                        <div className="flex items-start gap-2">
                          <ShieldCheck
                            className="mt-0.5 text-skybrand-600"
                            size={17}
                          />
                          <p className="text-sm leading-6 text-slate-600">
                            Inactive accounts are blocked by ORATRACK profile
                            checks and banned in Supabase Auth.
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>
                </article>
              );
            })}
          </div>
        ) : (
          <div className="mt-6">
            <EmptyState
              message="Create the first teacher account after the Supabase service role key is configured on the server."
              title="No staff accounts yet"
            />
          </div>
        )}
      </section>
    </div>
  );
}
