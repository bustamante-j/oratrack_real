import {
  BookOpen,
  CheckCircle2,
  GraduationCap,
  Layers3,
  UserRoundCheck,
} from "lucide-react";

import { ActionDisclosure } from "@/components/ui/action-disclosure";
import { EmptyState } from "@/components/ui/empty-state";
import { MetricStrip } from "@/components/ui/metric-strip";
import { SubmitButton } from "@/components/ui/submit-button";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import type { AppRole } from "@/types/domain";

import {
  assignSectionSubjectAction,
  createSectionAction,
  createSubjectAction,
} from "./actions";

export const metadata = {
  title: "Sections and Subjects",
};

type SchoolYear = {
  id: string;
  name: string;
  status: "draft" | "active" | "closed";
};

type GradeLevel = {
  id: number;
  grade_number: number;
  label: string;
  sort_order: number;
};

type Subject = {
  id: string;
  code: string;
  name: string;
  grade_level_id: number | null;
  is_active: boolean;
};

type Section = {
  id: string;
  school_year_id: string;
  grade_level_id: number;
  name: string;
  adviser_id: string | null;
  room: string | null;
};

type SectionSubject = {
  id: string;
  section_id: string;
  subject_id: string;
  teacher_id: string | null;
};

type StaffProfile = {
  user_id: string;
  email: string | null;
  full_name: string | null;
  role: AppRole;
  status: "active" | "inactive";
};

function staffLabel(profile: StaffProfile) {
  return profile.full_name || profile.email || "Unnamed staff";
}

function roleLabel(role: AppRole) {
  if (role === "admin_principal") return "Admin";
  if (role === "adviser") return "Adviser";
  return "Subject teacher";
}

export default async function SectionsPage() {
  const supabase = await createSupabaseServerClient();
  const [
    schoolYearResult,
    gradeLevelResult,
    subjectResult,
    sectionResult,
    sectionSubjectResult,
    staffResult,
  ] = await Promise.all([
    supabase
      .from("school_years")
      .select("id,name,status")
      .order("starts_on", { ascending: false }),
    supabase
      .from("grade_levels")
      .select("id,grade_number,label,sort_order")
      .order("sort_order", { ascending: true }),
    supabase
      .from("subjects")
      .select("id,code,name,grade_level_id,is_active")
      .order("code", { ascending: true }),
    supabase
      .from("sections")
      .select("id,school_year_id,grade_level_id,name,adviser_id,room")
      .order("name", { ascending: true }),
    supabase
      .from("section_subjects")
      .select("id,section_id,subject_id,teacher_id"),
    supabase
      .from("profiles")
      .select("user_id,email,full_name,role,status")
      .eq("status", "active")
      .order("full_name", { ascending: true }),
  ]);

  const firstError =
    schoolYearResult.error ??
    gradeLevelResult.error ??
    subjectResult.error ??
    sectionResult.error ??
    sectionSubjectResult.error ??
    staffResult.error;

  if (firstError) {
    throw new Error(firstError.message);
  }

  const schoolYears = (schoolYearResult.data ?? []) as SchoolYear[];
  const gradeLevels = (gradeLevelResult.data ?? []) as GradeLevel[];
  const subjects = (subjectResult.data ?? []) as Subject[];
  const sections = (sectionResult.data ?? []) as Section[];
  const sectionSubjects = (sectionSubjectResult.data ?? []) as SectionSubject[];
  const staff = (staffResult.data ?? []) as StaffProfile[];

  const activeYear = schoolYears.find((year) => year.status === "active");
  const advisers = staff.filter(
    (profile) =>
      profile.role === "adviser" || profile.role === "admin_principal",
  );
  const subjectTeachers = staff.filter(
    (profile) =>
      profile.role === "subject_teacher" || profile.role === "admin_principal",
  );
  const gradeById = new Map(gradeLevels.map((grade) => [grade.id, grade]));
  const yearById = new Map(schoolYears.map((year) => [year.id, year]));
  const staffById = new Map(staff.map((profile) => [profile.user_id, profile]));
  const subjectById = new Map(subjects.map((subject) => [subject.id, subject]));
  const assignmentsBySection = sectionSubjects.reduce((map, assignment) => {
    const current = map.get(assignment.section_id) ?? [];
    current.push(assignment);
    map.set(assignment.section_id, current);
    return map;
  }, new Map<string, SectionSubject[]>());

  const setupReady = schoolYears.length > 0 && gradeLevels.length > 0;

  return (
    <div className="space-y-6">
      <div>
        <p className="text-xs font-bold uppercase text-skybrand-600">Phase 4</p>
        <h1 className="mt-3 font-display text-3xl font-extrabold text-navy-950">
          Sections and subjects
        </h1>
        <details className="mt-3 max-w-3xl text-sm leading-7 text-slate-600">
          <summary className="cursor-pointer text-sm font-bold text-navy-950">
            Page details
          </summary>
          Build the active school setup that controls adviser access, subject
          teacher access, learner enrollments, attendance, grades, and reports.
        </details>
      </div>

      <div className="grid gap-6 xl:grid-cols-[0.85fr_1.15fr]">
        <section className="rounded-lg border border-slate-200 bg-white p-4 shadow-soft">
          <div className="flex items-start gap-3">
            <span className="grid size-12 place-items-center rounded-lg bg-skybrand-50 text-skybrand-600">
              <CheckCircle2 size={22} />
            </span>
            <div>
              <h2 className="font-display text-xl font-extrabold text-navy-950">
                Active setup
              </h2>
              <p className="mt-1 text-sm text-slate-500">
                {activeYear
                  ? `${activeYear.name} is active.`
                  : "No active school year yet."}
              </p>
            </div>
          </div>

          <div className="mt-6">
            <MetricStrip
              items={[
                { label: "School years", value: schoolYears.length },
                { label: "Grade levels", value: gradeLevels.length },
                { label: "Sections", value: sections.length },
                { label: "Subjects", value: subjects.length },
              ]}
            />
          </div>
        </section>

        <section className="rounded-lg border border-slate-200 bg-white p-4 shadow-soft">
          <div className="flex items-start gap-3">
            <span className="grid size-12 place-items-center rounded-lg bg-skybrand-50 text-skybrand-600">
              <GraduationCap size={24} />
            </span>
            <div>
              <h2 className="font-display text-xl font-extrabold text-navy-950">
                Grade levels
              </h2>
              <p className="mt-1 text-sm text-slate-500">
                Seeded from Kindergarten through Grade 6.
              </p>
            </div>
          </div>

          <div className="mt-5 flex flex-wrap gap-2">
            {gradeLevels.map((grade) => (
              <span
                className="rounded-full border border-skybrand-200 bg-skybrand-50 px-3 py-1 text-xs font-bold text-navy-900"
                key={grade.id}
              >
                {grade.label}
              </span>
            ))}
          </div>
        </section>
      </div>

      {setupReady ? (
        <div className="grid gap-6 xl:grid-cols-3">
          <ActionDisclosure
            icon={<BookOpen size={17} />}
            meta="Code and grade"
            title="Add subject"
          >
            <form action={createSubjectAction} className="grid gap-4">
              <label>
                <span className="label">Code</span>
                <input
                  className="input"
                  name="code"
                  placeholder="MATH6"
                  required
                />
              </label>
              <label>
                <span className="label">Subject name</span>
                <input
                  className="input"
                  name="name"
                  placeholder="Mathematics"
                  required
                />
              </label>
              <label>
                <span className="label">Grade level</span>
                <select className="input" name="gradeLevelId">
                  <option value="">All grade levels</option>
                  {gradeLevels.map((grade) => (
                    <option key={grade.id} value={grade.id}>
                      {grade.label}
                    </option>
                  ))}
                </select>
              </label>
              <div>
                <SubmitButton>Add subject</SubmitButton>
              </div>
            </form>
          </ActionDisclosure>

          <ActionDisclosure
            icon={<Layers3 size={17} />}
            meta="Year, grade, adviser"
            title="Add section"
          >
            <form action={createSectionAction} className="grid gap-4">
              <label>
                <span className="label">School year</span>
                <select
                  className="input"
                  defaultValue={activeYear?.id ?? schoolYears[0]?.id}
                  name="schoolYearId"
                  required
                >
                  {schoolYears.map((year) => (
                    <option key={year.id} value={year.id}>
                      {year.name} ({year.status})
                    </option>
                  ))}
                </select>
              </label>
              <label>
                <span className="label">Grade level</span>
                <select className="input" name="gradeLevelId" required>
                  {gradeLevels.map((grade) => (
                    <option key={grade.id} value={grade.id}>
                      {grade.label}
                    </option>
                  ))}
                </select>
              </label>
              <label>
                <span className="label">Section name</span>
                <input
                  className="input"
                  name="name"
                  placeholder="Aguinaldo"
                  required
                />
              </label>
              <label>
                <span className="label">Adviser</span>
                <select className="input" name="adviserId">
                  <option value="">Unassigned</option>
                  {advisers.map((profile) => (
                    <option key={profile.user_id} value={profile.user_id}>
                      {staffLabel(profile)} ({roleLabel(profile.role)})
                    </option>
                  ))}
                </select>
              </label>
              <label>
                <span className="label">Room</span>
                <input className="input" name="room" placeholder="Room 1" />
              </label>
              <div>
                <SubmitButton>Add section</SubmitButton>
              </div>
            </form>
          </ActionDisclosure>

          <ActionDisclosure
            icon={<UserRoundCheck size={17} />}
            meta="Subject teacher"
            title="Assign subject"
          >
            {sections.length && subjects.length ? (
              <form action={assignSectionSubjectAction} className="grid gap-4">
                <label>
                  <span className="label">Section</span>
                  <select className="input" name="sectionId" required>
                    {sections.map((section) => (
                      <option key={section.id} value={section.id}>
                        {yearById.get(section.school_year_id)?.name ??
                          "School year"}{" "}
                        - {gradeById.get(section.grade_level_id)?.label}{" "}
                        {section.name}
                      </option>
                    ))}
                  </select>
                </label>
                <label>
                  <span className="label">Subject</span>
                  <select className="input" name="subjectId" required>
                    {subjects.map((subject) => (
                      <option key={subject.id} value={subject.id}>
                        {subject.code} - {subject.name}
                      </option>
                    ))}
                  </select>
                </label>
                <label>
                  <span className="label">Teacher</span>
                  <select className="input" name="teacherId">
                    <option value="">Unassigned</option>
                    {subjectTeachers.map((profile) => (
                      <option key={profile.user_id} value={profile.user_id}>
                        {staffLabel(profile)} ({roleLabel(profile.role)})
                      </option>
                    ))}
                  </select>
                </label>
                <div>
                  <SubmitButton>Save assignment</SubmitButton>
                </div>
              </form>
            ) : (
              <p className="rounded-lg bg-slate-50 p-4 text-sm leading-6 text-slate-600">
                Add at least one section and one subject before creating class
                subject assignments.
              </p>
            )}
          </ActionDisclosure>
        </div>
      ) : (
        <EmptyState
          message="Create a school year first. Grade levels are created by the initial Supabase migration."
          title="School setup is not ready"
        />
      )}

      <section className="rounded-lg border border-slate-200 bg-white p-4 shadow-soft">
        <div className="flex items-center justify-between gap-4">
          <div>
            <h2 className="font-display text-xl font-extrabold text-navy-950">
              Section list
            </h2>
            <p className="mt-1 text-sm text-slate-500">
              Adviser and subject assignments are the access boundary for
              teacher accounts.
            </p>
          </div>
          <span className="rounded-full bg-skybrand-50 px-3 py-1 text-xs font-bold text-skybrand-600">
            {sections.length} total
          </span>
        </div>

        {sections.length ? (
          <div className="mt-5 overflow-x-auto rounded-lg border border-slate-200">
            <table className="min-w-[900px] text-left text-sm">
              <thead className="bg-slate-50 text-xs font-bold uppercase text-slate-500">
                <tr>
                  <th className="px-4 py-3">Section</th>
                  <th className="px-4 py-3">School year</th>
                  <th className="px-4 py-3">Adviser</th>
                  <th className="px-4 py-3">Room</th>
                  <th className="px-4 py-3">Subjects</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {sections.map((section) => {
                  const assignments =
                    assignmentsBySection.get(section.id) ?? [];
                  const adviser = section.adviser_id
                    ? staffById.get(section.adviser_id)
                    : null;

                  return (
                    <tr key={section.id}>
                      <td className="px-4 py-4">
                        <p className="font-semibold text-navy-950">
                          {gradeById.get(section.grade_level_id)?.label}{" "}
                          {section.name}
                        </p>
                      </td>
                      <td className="px-4 py-4 text-slate-600">
                        {yearById.get(section.school_year_id)?.name ??
                          "Unknown year"}
                      </td>
                      <td className="px-4 py-4 text-slate-600">
                        {adviser ? staffLabel(adviser) : "Unassigned"}
                      </td>
                      <td className="px-4 py-4 text-slate-600">
                        {section.room || "Unassigned"}
                      </td>
                      <td className="px-4 py-4">
                        {assignments.length ? (
                          <div className="flex flex-wrap gap-2">
                            {assignments.map((assignment) => {
                              const subject = subjectById.get(
                                assignment.subject_id,
                              );
                              const teacher = assignment.teacher_id
                                ? staffById.get(assignment.teacher_id)
                                : null;

                              return (
                                <span
                                  className="rounded-full bg-slate-100 px-3 py-1 text-xs font-bold text-slate-700"
                                  key={assignment.id}
                                >
                                  {subject?.code ?? "Subject"}:{" "}
                                  {teacher ? staffLabel(teacher) : "Unassigned"}
                                </span>
                              );
                            })}
                          </div>
                        ) : (
                          <span className="text-slate-500">
                            No subjects assigned
                          </span>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="mt-5">
            <EmptyState
              message="Create sections for the active school year once teacher accounts and subjects are ready."
              title="No sections yet"
            />
          </div>
        )}
      </section>

      <section className="rounded-lg border border-slate-200 bg-white p-4 shadow-soft">
        <div className="flex items-center justify-between gap-4">
          <div>
            <h2 className="font-display text-xl font-extrabold text-navy-950">
              Subject list
            </h2>
            <p className="mt-1 text-sm text-slate-500">
              Subjects can apply globally or to one grade level.
            </p>
          </div>
          <span className="rounded-full bg-skybrand-50 px-3 py-1 text-xs font-bold text-skybrand-600">
            {subjects.length} total
          </span>
        </div>

        {subjects.length ? (
          <div className="mt-5 grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
            {subjects.map((subject) => (
              <div
                className="rounded-lg border border-slate-200 bg-slate-50 p-4"
                key={subject.id}
              >
                <p className="text-xs font-bold uppercase text-skybrand-600">
                  {subject.code}
                </p>
                <h3 className="mt-1 font-display text-base font-extrabold text-navy-950">
                  {subject.name}
                </h3>
                <p className="mt-2 text-sm text-slate-600">
                  {subject.grade_level_id
                    ? gradeById.get(subject.grade_level_id)?.label
                    : "All grade levels"}
                </p>
              </div>
            ))}
          </div>
        ) : (
          <div className="mt-5">
            <EmptyState
              message="Add subjects before assigning subject teachers to sections."
              title="No subjects yet"
            />
          </div>
        )}
      </section>
    </div>
  );
}
