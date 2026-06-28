import Link from "next/link";
import {
  BookUser,
  GraduationCap,
  Search,
  Shield,
  UsersRound,
} from "lucide-react";

import { EmptyState } from "@/components/ui/empty-state";
import { requireRole } from "@/lib/auth/session";
import { createSupabaseServerClient } from "@/lib/supabase/server";

export const metadata = {
  title: "Assigned Learners",
};

type LearnerStatus = "active" | "inactive" | "archived" | "transferred";

type Learner = {
  id: string;
  lrn: string;
  first_name: string;
  middle_name: string | null;
  last_name: string;
  extension_name: string | null;
  sex: "female" | "male";
  birth_date: string;
  address: string | null;
  status: LearnerStatus;
};

type LearnerGuardian = {
  id: string;
  learner_id: string;
  full_name: string;
  relationship: string;
  phone: string | null;
  email: string | null;
  is_primary: boolean;
};

type LearnerEnrollment = {
  id: string;
  learner_id: string;
  school_year_id: string;
  grade_level_id: number;
  section_id: string | null;
  enrollment_status: string;
  enrolled_on: string;
  created_at: string;
};

type SchoolYear = {
  id: string;
  name: string;
  status: "draft" | "active" | "closed";
};

type GradeLevel = {
  id: number;
  label: string;
  sort_order: number;
};

type Section = {
  id: string;
  school_year_id: string;
  grade_level_id: number;
  name: string;
};

function firstSearchValue(value: string | string[] | undefined) {
  return Array.isArray(value) ? value[0] : value;
}

function learnerName(learner: Learner) {
  return [
    learner.first_name,
    learner.middle_name,
    learner.last_name,
    learner.extension_name,
  ]
    .filter(Boolean)
    .join(" ");
}

function statusTone(status: LearnerStatus) {
  if (status === "active") return "bg-emerald-50 text-emerald-700";
  if (status === "archived") return "bg-slate-200 text-slate-700";
  if (status === "transferred") return "bg-amber-50 text-amber-700";
  return "bg-rose-50 text-rose-700";
}

export default async function TeacherLearnersPage({
  searchParams,
}: {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}) {
  await requireRole("/teacher");

  const params = await searchParams;
  const query = firstSearchValue(params.q)?.trim().toLowerCase() ?? "";
  const supabase = await createSupabaseServerClient();
  const [
    learnerResult,
    guardianResult,
    enrollmentResult,
    schoolYearResult,
    gradeLevelResult,
    sectionResult,
  ] = await Promise.all([
    supabase
      .from("learners")
      .select(
        "id,lrn,first_name,middle_name,last_name,extension_name,sex,birth_date,address,status",
      )
      .order("last_name", { ascending: true }),
    supabase
      .from("learner_guardians")
      .select("id,learner_id,full_name,relationship,phone,email,is_primary"),
    supabase
      .from("learner_enrollments")
      .select(
        "id,learner_id,school_year_id,grade_level_id,section_id,enrollment_status,enrolled_on,created_at",
      )
      .order("created_at", { ascending: false }),
    supabase
      .from("school_years")
      .select("id,name,status")
      .order("starts_on", { ascending: false }),
    supabase
      .from("grade_levels")
      .select("id,label,sort_order")
      .order("sort_order", { ascending: true }),
    supabase
      .from("sections")
      .select("id,school_year_id,grade_level_id,name")
      .order("name", { ascending: true }),
  ]);

  const firstError =
    learnerResult.error ??
    guardianResult.error ??
    enrollmentResult.error ??
    schoolYearResult.error ??
    gradeLevelResult.error ??
    sectionResult.error;

  if (firstError) {
    throw new Error(firstError.message);
  }

  const learners = (learnerResult.data ?? []) as Learner[];
  const guardians = (guardianResult.data ?? []) as LearnerGuardian[];
  const enrollments = (enrollmentResult.data ?? []) as LearnerEnrollment[];
  const schoolYears = (schoolYearResult.data ?? []) as SchoolYear[];
  const gradeLevels = (gradeLevelResult.data ?? []) as GradeLevel[];
  const sections = (sectionResult.data ?? []) as Section[];

  const activeYear = schoolYears.find((year) => year.status === "active");
  const gradeById = new Map(gradeLevels.map((grade) => [grade.id, grade]));
  const yearById = new Map(schoolYears.map((year) => [year.id, year]));
  const sectionById = new Map(sections.map((section) => [section.id, section]));
  const primaryGuardianByLearner = new Map(
    guardians
      .filter((guardian) => guardian.is_primary)
      .map((guardian) => [guardian.learner_id, guardian]),
  );
  const enrollmentsByLearner = enrollments.reduce((map, enrollment) => {
    const current = map.get(enrollment.learner_id) ?? [];
    current.push(enrollment);
    map.set(enrollment.learner_id, current);
    return map;
  }, new Map<string, LearnerEnrollment[]>());

  const filteredLearners = learners.filter((learner) => {
    if (!query) return true;
    return `${learner.lrn} ${learnerName(learner)}`
      .toLowerCase()
      .includes(query);
  });

  const activeLearners = learners.filter(
    (learner) => learner.status === "active",
  ).length;
  const activeYearLearners = activeYear
    ? new Set(
        enrollments
          .filter((enrollment) => enrollment.school_year_id === activeYear.id)
          .map((enrollment) => enrollment.learner_id),
      ).size
    : 0;

  return (
    <div className="space-y-8">
      <div>
        <p className="text-xs font-bold uppercase text-skybrand-600">Phase 6</p>
        <h1 className="mt-3 font-display text-3xl font-extrabold text-navy-950">
          Assigned learners
        </h1>
        <p className="mt-3 max-w-3xl text-sm leading-7 text-slate-600">
          View learner identity, guardian contact, and enrollment history for
          the classes currently visible to your account.
        </p>
      </div>

      <div className="grid gap-3 sm:grid-cols-3">
        {[
          ["Visible learners", learners.length],
          ["Active", activeLearners],
          ["Active year", activeYearLearners],
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
        <div className="flex flex-col gap-4 xl:flex-row xl:items-end xl:justify-between">
          <div className="flex items-start gap-3">
            <span className="grid size-12 place-items-center rounded-2xl bg-skybrand-50 text-skybrand-600">
              <UsersRound size={24} />
            </span>
            <div>
              <h2 className="font-display text-xl font-extrabold text-navy-950">
                Learner list
              </h2>
              <p className="mt-1 text-sm text-slate-500">
                Records are scoped by adviser and subject assignments.
              </p>
            </div>
          </div>

          <form className="grid gap-3 sm:grid-cols-[minmax(14rem,1fr)_auto]">
            <label>
              <span className="label">Search</span>
              <span className="relative block">
                <Search
                  className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
                  size={17}
                />
                <input
                  className="input pl-10"
                  defaultValue={firstSearchValue(params.q) ?? ""}
                  name="q"
                  placeholder="LRN or name"
                />
              </span>
            </label>
            <div className="flex items-end">
              <button
                className="inline-flex min-h-10 items-center justify-center rounded-xl bg-navy-900 px-4 py-2 text-sm font-bold text-white transition hover:bg-skybrand-600"
                type="submit"
              >
                Filter
              </button>
            </div>
          </form>
        </div>

        {filteredLearners.length ? (
          <div className="mt-6 grid gap-4 xl:grid-cols-2">
            {filteredLearners.map((learner) => {
              const learnerEnrollments =
                enrollmentsByLearner.get(learner.id) ?? [];
              const currentEnrollment = activeYear
                ? learnerEnrollments.find(
                    (enrollment) => enrollment.school_year_id === activeYear.id,
                  )
                : learnerEnrollments[0];
              const guardian = primaryGuardianByLearner.get(learner.id);

              return (
                <article
                  className="rounded-[1.25rem] border border-slate-200 bg-slate-50 p-5"
                  key={learner.id}
                >
                  <div className="flex flex-wrap items-center gap-2">
                    <span
                      className={`rounded-full px-3 py-1 text-xs font-bold ${statusTone(learner.status)}`}
                    >
                      {learner.status}
                    </span>
                    <span className="rounded-full bg-white px-3 py-1 text-xs font-bold text-slate-600">
                      LRN {learner.lrn}
                    </span>
                  </div>

                  <h3 className="mt-4 font-display text-xl font-extrabold text-navy-950">
                    {learnerName(learner)}
                  </h3>
                  <Link
                    className="mt-3 inline-flex items-center gap-2 rounded-xl bg-navy-900 px-3 py-2 text-xs font-bold text-white transition hover:bg-skybrand-600"
                    href={`/teacher/learners/${learner.id}`}
                  >
                    View performance
                  </Link>

                  <div className="mt-4 grid gap-2 text-sm text-slate-600 sm:grid-cols-2">
                    <p>
                      <span className="font-bold text-slate-700">Sex:</span>{" "}
                      {learner.sex}
                    </p>
                    <p>
                      <span className="font-bold text-slate-700">
                        Birth date:
                      </span>{" "}
                      {learner.birth_date}
                    </p>
                    <p className="sm:col-span-2">
                      <span className="font-bold text-slate-700">Address:</span>{" "}
                      {learner.address || "Unassigned"}
                    </p>
                  </div>

                  <div className="mt-5 grid gap-3">
                    <section className="rounded-2xl bg-white p-4">
                      <div className="flex gap-2">
                        <GraduationCap
                          className="mt-0.5 shrink-0 text-skybrand-600"
                          size={18}
                        />
                        <div>
                          <p className="text-xs font-bold uppercase text-slate-500">
                            Current enrollment
                          </p>
                          <p className="mt-1 text-sm font-semibold text-navy-950">
                            {currentEnrollment
                              ? `${yearById.get(currentEnrollment.school_year_id)?.name ?? "School year"} - ${gradeById.get(currentEnrollment.grade_level_id)?.label ?? "Grade"}`
                              : "No active enrollment"}
                          </p>
                          <p className="mt-1 text-sm text-slate-600">
                            {currentEnrollment?.section_id
                              ? sectionById.get(currentEnrollment.section_id)
                                  ?.name
                              : "No section assigned"}
                          </p>
                        </div>
                      </div>
                    </section>

                    <section className="rounded-2xl bg-white p-4">
                      <div className="flex gap-2">
                        <Shield
                          className="mt-0.5 shrink-0 text-skybrand-600"
                          size={18}
                        />
                        <div>
                          <p className="text-xs font-bold uppercase text-slate-500">
                            Primary guardian
                          </p>
                          <p className="mt-1 text-sm font-semibold text-navy-950">
                            {guardian
                              ? `${guardian.full_name} (${guardian.relationship})`
                              : "Unassigned"}
                          </p>
                          <p className="mt-1 text-sm text-slate-600">
                            {guardian?.phone || guardian?.email || ""}
                          </p>
                        </div>
                      </div>
                    </section>
                  </div>

                  <details className="mt-4 rounded-2xl border border-slate-200 bg-white p-4">
                    <summary className="flex cursor-pointer items-center gap-2 text-sm font-bold text-navy-950">
                      <BookUser size={17} />
                      Enrollment history
                    </summary>
                    {learnerEnrollments.length ? (
                      <div className="mt-4 grid gap-2">
                        {learnerEnrollments.map((enrollment) => (
                          <div
                            className="rounded-xl bg-slate-50 p-3 text-sm text-slate-600"
                            key={enrollment.id}
                          >
                            <p className="font-bold text-navy-950">
                              {yearById.get(enrollment.school_year_id)?.name ??
                                "School year"}{" "}
                              -{" "}
                              {gradeById.get(enrollment.grade_level_id)
                                ?.label ?? "Grade"}
                            </p>
                            <p className="mt-1">
                              Section:{" "}
                              {enrollment.section_id
                                ? sectionById.get(enrollment.section_id)?.name
                                : "Unassigned"}
                            </p>
                            <p className="mt-1">
                              Status: {enrollment.enrollment_status}
                            </p>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <p className="mt-4 text-sm text-slate-500">
                        No enrollment history yet.
                      </p>
                    )}
                  </details>
                </article>
              );
            })}
          </div>
        ) : (
          <div className="mt-6">
            <EmptyState
              message="No assigned learners match the current filter."
              title="No learners found"
            />
          </div>
        )}
      </section>
    </div>
  );
}
