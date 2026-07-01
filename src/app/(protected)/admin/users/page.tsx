import {
  KeyRound,
  MailPlus,
  ShieldCheck,
  UserCog,
  UsersRound,
} from "lucide-react";

import { ActionDisclosure } from "@/components/ui/action-disclosure";
import { ButtonLink } from "@/components/ui/button";
import { EmptyState } from "@/components/ui/empty-state";
import { MetricStrip } from "@/components/ui/metric-strip";
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
  if (role === "admin_principal") return "bg-slate-100 text-navy-950";
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
    <div className="space-y-6">
      <div>
        <p className="text-xs font-bold uppercase text-skybrand-600">Phase 5</p>
        <h1 className="mt-3 font-display text-3xl font-extrabold text-navy-950">
          Teacher accounts
        </h1>
        <details className="mt-3 max-w-3xl text-sm leading-7 text-slate-600">
          <summary className="cursor-pointer text-sm font-bold text-navy-950">
            Page details
          </summary>
          Create staff sign-ins, maintain roles and active status, reset
          passwords, and review the assignments that scope teacher access.
        </details>
      </div>

      <MetricStrip
        items={[
          { label: "Active", value: activeCount },
          { label: "Inactive", value: inactiveCount },
          { label: "Advisers", value: adviserCount },
          { label: "Subject teachers", value: subjectTeacherCount },
        ]}
      />

      <ActionDisclosure
        icon={<MailPlus size={17} />}
        meta="Name, email, role"
        title="Create staff account"
      >
        <form
          action={createTeacherAccountAction}
          className="grid gap-4 lg:grid-cols-4"
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
      </ActionDisclosure>

      <section className="rounded-lg border border-slate-200 bg-white p-4 shadow-soft">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <span className="grid size-10 place-items-center rounded-lg bg-skybrand-50 text-skybrand-600">
              <UsersRound size={20} />
            </span>
            <div>
              <h2 className="font-display text-lg font-extrabold text-navy-950">
                Staff directory
              </h2>
              <p className="text-xs font-bold uppercase text-slate-500">
                {profiles.length} accounts
              </p>
            </div>
          </div>
          <ButtonLink href="/admin/sections" variant="secondary">
            Assignments
          </ButtonLink>
        </div>

        {profiles.length ? (
          <div className="mt-4 overflow-hidden rounded-lg border border-slate-200">
            <div className="hidden grid-cols-[minmax(0,1.2fr)_10rem_8rem_9rem_6rem] bg-slate-50 px-4 py-3 text-xs font-bold uppercase text-slate-500 md:grid">
              <span>Staff</span>
              <span>Role</span>
              <span>Status</span>
              <span>Load</span>
              <span className="text-right">Action</span>
            </div>
            {profiles.map((profile) => {
              const teacherProfile = teacherProfileById.get(profile.user_id);
              const adviserSections =
                adviserSectionsByProfile.get(profile.user_id) ?? [];
              const subjectAssignments =
                subjectAssignmentsByProfile.get(profile.user_id) ?? [];
              const assignmentCount =
                adviserSections.length + subjectAssignments.length;

              return (
                <details
                  className="group border-t border-slate-100 first:border-t-0"
                  key={profile.user_id}
                >
                  <summary className="grid cursor-pointer list-none gap-3 px-4 py-4 transition hover:bg-slate-50 md:grid-cols-[minmax(0,1.2fr)_10rem_8rem_9rem_6rem] md:items-center [&::-webkit-details-marker]:hidden">
                    <span className="min-w-0">
                      <span className="block truncate font-semibold text-navy-950">
                        {staffLabel(profile)}
                      </span>
                      <span className="block truncate text-sm text-slate-500">
                        {profile.email ?? "No email"}
                      </span>
                    </span>
                    <span
                      className={`w-fit rounded-full px-3 py-1 text-xs font-bold ${roleTone(profile.role)}`}
                    >
                      {roleLabels[profile.role]}
                    </span>
                    <span
                      className={`w-fit rounded-full px-3 py-1 text-xs font-bold ${statusTone(profile.status)}`}
                    >
                      {profile.status}
                    </span>
                    <span className="text-sm font-semibold text-slate-600">
                      {assignmentCount}{" "}
                      {assignmentCount === 1 ? "assignment" : "assignments"}
                    </span>
                    <span className="inline-flex min-h-9 items-center justify-center rounded-lg border border-slate-200 px-3 py-2 text-xs font-bold text-slate-600 transition group-open:border-skybrand-300 group-open:bg-skybrand-50 group-open:text-navy-950 md:justify-self-end">
                      Details
                    </span>
                  </summary>

                  <div className="border-t border-slate-100 px-4 pb-5 pt-4">
                    <div className="grid gap-5 xl:grid-cols-[0.85fr_1.15fr]">
                      <dl className="grid gap-3 text-sm sm:grid-cols-2">
                        {[
                          [
                            "Employee",
                            teacherProfile?.employee_number || "Unassigned",
                          ],
                          ["Phone", profile.phone || "Unassigned"],
                          [
                            "Position",
                            teacherProfile?.position_title || "Unassigned",
                          ],
                          [
                            "Specialization",
                            teacherProfile?.grade_specialization ||
                              "Unassigned",
                          ],
                          [
                            "Last login",
                            profile.last_login_at
                              ? new Date(profile.last_login_at).toLocaleString()
                              : "Not recorded",
                          ],
                          [
                            "Latest year",
                            adviserSections.length
                              ? yearById.get(adviserSections[0].school_year_id)
                                  ?.name || "Unassigned"
                              : "Unassigned",
                          ],
                        ].map(([label, value]) => (
                          <div key={label}>
                            <dt className="text-xs font-bold uppercase text-slate-500">
                              {label}
                            </dt>
                            <dd className="mt-1 text-slate-700">{value}</dd>
                          </div>
                        ))}
                      </dl>

                      <div>
                        <p className="text-xs font-bold uppercase text-slate-500">
                          Assignments
                        </p>
                        <div className="mt-3 flex flex-wrap gap-2">
                          {adviserSections.map((section) => (
                            <span
                              className="rounded-full bg-skybrand-50 px-3 py-1 text-xs font-bold text-skybrand-700"
                              key={section.id}
                            >
                              Adviser:{" "}
                              {yearById.get(section.school_year_id)?.name ??
                                "Year"}{" "}
                              - {gradeById.get(section.grade_level_id)?.label}{" "}
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
                          {!assignmentCount ? (
                            <span className="text-sm text-slate-500">
                              No section assignments
                            </span>
                          ) : null}
                        </div>
                      </div>
                    </div>

                    <div className="mt-5 grid gap-4 xl:grid-cols-2">
                      <details className="border-t border-slate-100 pt-4">
                        <summary className="inline-flex cursor-pointer items-center gap-2 text-sm font-bold text-navy-950">
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

                      <div className="grid gap-4 border-t border-slate-100 pt-4">
                        <details>
                          <summary className="inline-flex cursor-pointer items-center gap-2 text-sm font-bold text-navy-950">
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

                        <details>
                          <summary className="inline-flex cursor-pointer items-center gap-2 text-sm font-bold text-navy-950">
                            <ShieldCheck size={17} />
                            Security note
                          </summary>
                          <p className="mt-3 text-sm leading-6 text-slate-600">
                            Inactive accounts are blocked by ORATRACK profile
                            checks and banned in Supabase Auth.
                          </p>
                        </details>
                      </div>
                    </div>
                  </div>
                </details>
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
