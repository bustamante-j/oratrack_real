import {
  ArrowRight,
  CalendarDays,
  CheckCircle2,
  GraduationCap,
  Layers3,
  Route,
  UserRoundCheck,
  UsersRound,
} from "lucide-react";

import { ActionDisclosure } from "@/components/ui/action-disclosure";
import { ButtonLink } from "@/components/ui/button";
import { EmptyState } from "@/components/ui/empty-state";
import { MetricStrip } from "@/components/ui/metric-strip";
import { SubmitButton } from "@/components/ui/submit-button";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import type { AppRole } from "@/types/domain";

import { promoteLearnerBatchAction } from "./actions";

export const metadata = {
  title: "Promotion",
};

type SchoolYear = {
  id: string;
  name: string;
  starts_on: string;
  ends_on: string;
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
  adviser_id: string | null;
  room: string | null;
};

type StaffProfile = {
  user_id: string;
  email: string | null;
  full_name: string | null;
  role: AppRole;
  status: "active" | "inactive";
};

type LearnerStatus = "active" | "inactive" | "archived" | "transferred";

type Learner = {
  id: string;
  lrn: string;
  first_name: string;
  middle_name: string | null;
  last_name: string;
  extension_name: string | null;
  status: LearnerStatus;
};

type LearnerEnrollment = {
  id: string;
  learner_id: string;
  school_year_id: string;
  grade_level_id: number;
  section_id: string | null;
  enrollment_status: string;
  promoted_from_enrollment_id: string | null;
  enrolled_on: string;
  created_at: string;
};

type GroupedCount = {
  key: string;
  schoolYearId: string;
  gradeLevelId: number;
  sectionId: string | null;
  count: number;
  promotedCount: number;
};

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

function staffLabel(profile: StaffProfile | null | undefined) {
  return profile?.full_name || profile?.email || "Unassigned";
}

function formatDate(value: string) {
  return new Intl.DateTimeFormat("en", {
    month: "short",
    day: "numeric",
    year: "numeric",
  }).format(new Date(`${value}T00:00:00`));
}

function gradeLabel(gradeById: Map<number, GradeLevel>, gradeId: number) {
  return gradeById.get(gradeId)?.label ?? "Grade";
}

function yearLabel(yearById: Map<string, SchoolYear>, yearId: string) {
  return yearById.get(yearId)?.name ?? "School year";
}

function sectionLabel(
  sectionById: Map<string, Section>,
  sectionId: string | null,
) {
  if (!sectionId) return "Unassigned";

  return sectionById.get(sectionId)?.name ?? "Section";
}

function groupEnrollments(
  enrollments: LearnerEnrollment[],
  promotedSourceIds: Set<string>,
) {
  const groups = new Map<string, GroupedCount>();

  for (const enrollment of enrollments) {
    const key = [
      enrollment.school_year_id,
      enrollment.grade_level_id,
      enrollment.section_id ?? "unassigned",
    ].join(":");
    const current =
      groups.get(key) ??
      ({
        key,
        schoolYearId: enrollment.school_year_id,
        gradeLevelId: enrollment.grade_level_id,
        sectionId: enrollment.section_id,
        count: 0,
        promotedCount: 0,
      } satisfies GroupedCount);

    current.count += 1;
    if (promotedSourceIds.has(enrollment.id)) {
      current.promotedCount += 1;
    }
    groups.set(key, current);
  }

  return Array.from(groups.values());
}

function sortGroupedCounts(
  rows: GroupedCount[],
  yearOrder: Map<string, number>,
  gradeById: Map<number, GradeLevel>,
  sectionById: Map<string, Section>,
) {
  return rows.sort((a, b) => {
    const yearDiff =
      (yearOrder.get(a.schoolYearId) ?? 999) -
      (yearOrder.get(b.schoolYearId) ?? 999);
    if (yearDiff) return yearDiff;

    const gradeDiff =
      (gradeById.get(a.gradeLevelId)?.sort_order ?? 999) -
      (gradeById.get(b.gradeLevelId)?.sort_order ?? 999);
    if (gradeDiff) return gradeDiff;

    return sectionLabel(sectionById, a.sectionId).localeCompare(
      sectionLabel(sectionById, b.sectionId),
    );
  });
}

function SectionOptions({
  schoolYears,
  sections,
  gradeById,
}: {
  schoolYears: SchoolYear[];
  sections: Section[];
  gradeById: Map<number, GradeLevel>;
}) {
  return schoolYears.map((year) => {
    const yearSections = sections.filter(
      (section) => section.school_year_id === year.id,
    );

    if (!yearSections.length) return null;

    return (
      <optgroup key={year.id} label={year.name}>
        {yearSections.map((section) => (
          <option key={section.id} value={section.id}>
            {gradeLabel(gradeById, section.grade_level_id)} {section.name}
          </option>
        ))}
      </optgroup>
    );
  });
}

export default async function PromotionPage() {
  const supabase = await createSupabaseServerClient();
  const [
    schoolYearResult,
    gradeLevelResult,
    sectionResult,
    staffResult,
    learnerResult,
    enrollmentResult,
  ] = await Promise.all([
    supabase
      .from("school_years")
      .select("id,name,starts_on,ends_on,status")
      .order("starts_on", { ascending: false }),
    supabase
      .from("grade_levels")
      .select("id,label,sort_order")
      .order("sort_order", { ascending: true }),
    supabase
      .from("sections")
      .select("id,school_year_id,grade_level_id,name,adviser_id,room")
      .order("name", { ascending: true }),
    supabase
      .from("profiles")
      .select("user_id,email,full_name,role,status")
      .eq("status", "active")
      .order("full_name", { ascending: true }),
    supabase
      .from("learners")
      .select("id,lrn,first_name,middle_name,last_name,extension_name,status")
      .order("last_name", { ascending: true }),
    supabase
      .from("learner_enrollments")
      .select(
        "id,learner_id,school_year_id,grade_level_id,section_id,enrollment_status,promoted_from_enrollment_id,enrolled_on,created_at",
      )
      .order("created_at", { ascending: false }),
  ]);

  const firstError =
    schoolYearResult.error ??
    gradeLevelResult.error ??
    sectionResult.error ??
    staffResult.error ??
    learnerResult.error ??
    enrollmentResult.error;

  if (firstError) {
    throw new Error(firstError.message);
  }

  const schoolYears = (schoolYearResult.data ?? []) as SchoolYear[];
  const gradeLevels = (gradeLevelResult.data ?? []) as GradeLevel[];
  const sections = (sectionResult.data ?? []) as Section[];
  const staff = (staffResult.data ?? []) as StaffProfile[];
  const learners = (learnerResult.data ?? []) as Learner[];
  const enrollments = (enrollmentResult.data ?? []) as LearnerEnrollment[];

  const activeYear = schoolYears.find((year) => year.status === "active");
  const gradeById = new Map(gradeLevels.map((grade) => [grade.id, grade]));
  const yearById = new Map(schoolYears.map((year) => [year.id, year]));
  const sectionById = new Map(sections.map((section) => [section.id, section]));
  const learnerById = new Map(learners.map((learner) => [learner.id, learner]));
  const staffById = new Map(staff.map((profile) => [profile.user_id, profile]));
  const enrollmentById = new Map(
    enrollments.map((enrollment) => [enrollment.id, enrollment]),
  );
  const yearOrder = new Map(schoolYears.map((year, index) => [year.id, index]));
  const activeLearnerIds = new Set(
    learners
      .filter((learner) => learner.status === "active")
      .map((learner) => learner.id),
  );
  const promotedSourceIds = new Set(
    enrollments
      .map((enrollment) => enrollment.promoted_from_enrollment_id)
      .filter((id): id is string => Boolean(id)),
  );
  const enrolledActiveEnrollments = enrollments.filter(
    (enrollment) =>
      enrollment.enrollment_status === "enrolled" &&
      activeLearnerIds.has(enrollment.learner_id),
  );
  const readyForPromotion = enrolledActiveEnrollments.filter(
    (enrollment) => !promotedSourceIds.has(enrollment.id),
  ).length;
  const promotedEnrollments = enrollments.filter(
    (enrollment) => enrollment.promoted_from_enrollment_id,
  );
  const assignedEnrollments = enrollments.filter(
    (enrollment) => enrollment.section_id,
  ).length;
  const defaultSourceYearId = activeYear?.id ?? schoolYears[0]?.id;
  const defaultTargetYearId =
    schoolYears.find(
      (year) => year.id !== defaultSourceYearId && year.status !== "closed",
    )?.id ??
    schoolYears.find((year) => year.id !== defaultSourceYearId)?.id ??
    defaultSourceYearId;
  const defaultTargetGradeId = gradeLevels[1]?.id ?? gradeLevels[0]?.id;
  const setupReady =
    schoolYears.length >= 2 && gradeLevels.length > 0 && learners.length > 0;
  const cohortRows = sortGroupedCounts(
    groupEnrollments(enrolledActiveEnrollments, promotedSourceIds),
    yearOrder,
    gradeById,
    sectionById,
  );
  const classLoadRows = sortGroupedCounts(
    groupEnrollments(
      enrollments.filter(
        (enrollment) => enrollment.enrollment_status === "enrolled",
      ),
      promotedSourceIds,
    ),
    yearOrder,
    gradeById,
    sectionById,
  );
  const recentPromotionRows = promotedEnrollments.slice(0, 8);

  return (
    <div className="space-y-6">
      <div>
        <p className="text-xs font-bold uppercase text-skybrand-600">Phase 7</p>
        <h1 className="mt-3 font-display text-3xl font-extrabold text-navy-950">
          Promotion and class assignment
        </h1>
        <details className="mt-3 max-w-3xl text-sm leading-7 text-slate-600">
          <summary className="cursor-pointer text-sm font-bold text-navy-950">
            Page details
          </summary>
          Move active enrolled learners into the next school year, assign their
          grade and section, and keep every source enrollment linked for review.
        </details>
      </div>

      <MetricStrip
        items={[
          { label: "Ready records", value: readyForPromotion },
          { label: "Promotion links", value: promotedEnrollments.length },
          { label: "Section assigned", value: assignedEnrollments },
          { label: "School years", value: schoolYears.length },
        ]}
      />

      {setupReady ? (
        <div className="grid gap-6 xl:grid-cols-[0.95fr_1.05fr]">
          <ActionDisclosure
            icon={<GraduationCap size={17} />}
            meta="Cohort action"
            title="Batch promotion"
          >
            <form action={promoteLearnerBatchAction} className="grid gap-4">
              <div className="grid gap-4 sm:grid-cols-2">
                <label>
                  <span className="label">Source school year</span>
                  <select
                    className="input"
                    defaultValue={defaultSourceYearId}
                    name="sourceSchoolYearId"
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
                  <span className="label">Source grade</span>
                  <select className="input" name="sourceGradeLevelId">
                    <option value="">All grades</option>
                    {gradeLevels.map((grade) => (
                      <option key={grade.id} value={grade.id}>
                        {grade.label}
                      </option>
                    ))}
                  </select>
                </label>
              </div>

              <label>
                <span className="label">Source section</span>
                <select className="input" name="sourceSectionId">
                  <option value="">All sections</option>
                  <SectionOptions
                    gradeById={gradeById}
                    schoolYears={schoolYears}
                    sections={sections}
                  />
                </select>
              </label>

              <div className="grid gap-4 sm:grid-cols-2">
                <label>
                  <span className="label">Target school year</span>
                  <select
                    className="input"
                    defaultValue={defaultTargetYearId}
                    name="targetSchoolYearId"
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
                  <span className="label">Target grade</span>
                  <select
                    className="input"
                    defaultValue={defaultTargetGradeId}
                    name="targetGradeLevelId"
                    required
                  >
                    {gradeLevels.map((grade) => (
                      <option key={grade.id} value={grade.id}>
                        {grade.label}
                      </option>
                    ))}
                  </select>
                </label>
              </div>

              <label>
                <span className="label">Target section</span>
                <select className="input" name="targetSectionId">
                  <option value="">Unassigned</option>
                  <SectionOptions
                    gradeById={gradeById}
                    schoolYears={schoolYears}
                    sections={sections}
                  />
                </select>
              </label>

              <label>
                <span className="label">Enrolled on</span>
                <input className="input" name="enrolledOn" type="date" />
              </label>

              <SubmitButton pendingLabel="Promoting...">
                Promote cohort
              </SubmitButton>
            </form>
          </ActionDisclosure>

          <section className="rounded-lg border border-slate-200 bg-white p-4 shadow-soft">
            <div className="flex items-start gap-3">
              <span className="grid size-12 place-items-center rounded-lg bg-skybrand-50 text-skybrand-600">
                <Route size={24} />
              </span>
              <div>
                <h2 className="font-display text-xl font-extrabold text-navy-950">
                  Cohort readiness
                </h2>
                <p className="mt-1 text-sm text-slate-500">
                  Active learners with enrolled source records.
                </p>
              </div>
            </div>

            {cohortRows.length ? (
              <div className="mt-6 overflow-x-auto rounded-lg border border-slate-200">
                <table className="min-w-[720px] text-left text-sm">
                  <thead className="bg-slate-50 text-xs font-bold uppercase text-slate-500">
                    <tr>
                      <th className="px-4 py-3">Cohort</th>
                      <th className="px-4 py-3">Section</th>
                      <th className="px-4 py-3">Ready</th>
                      <th className="px-4 py-3">Linked</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {cohortRows.slice(0, 8).map((row) => (
                      <tr key={row.key}>
                        <td className="px-4 py-4">
                          <p className="font-semibold text-navy-950">
                            {yearLabel(yearById, row.schoolYearId)}
                          </p>
                          <p className="mt-1 text-slate-500">
                            {gradeLabel(gradeById, row.gradeLevelId)}
                          </p>
                        </td>
                        <td className="px-4 py-4 text-slate-600">
                          {sectionLabel(sectionById, row.sectionId)}
                        </td>
                        <td className="px-4 py-4 font-bold text-navy-950">
                          {row.count}
                        </td>
                        <td className="px-4 py-4 text-slate-600">
                          {row.promotedCount}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : (
              <div className="mt-6">
                <EmptyState
                  message="Add active learner enrollments before running promotion."
                  title="No ready cohorts"
                />
              </div>
            )}
          </section>
        </div>
      ) : (
        <EmptyState
          action={
            <div className="flex flex-wrap justify-center gap-3">
              <ButtonLink href="/admin/school-years" variant="secondary">
                <CalendarDays size={17} />
                School years
              </ButtonLink>
              <ButtonLink href="/admin/learners" variant="secondary">
                <UsersRound size={17} />
                Learners
              </ButtonLink>
            </div>
          }
          message="Promotion needs at least two school years, grade levels, and learner records."
          title="Promotion setup is not ready"
        />
      )}

      <section className="rounded-lg border border-slate-200 bg-white p-4 shadow-soft">
        <div className="flex items-start gap-3">
          <span className="grid size-12 place-items-center rounded-lg bg-skybrand-50 text-skybrand-600">
            <Layers3 size={24} />
          </span>
          <div>
            <h2 className="font-display text-xl font-extrabold text-navy-950">
              Class assignment load
            </h2>
            <p className="mt-1 text-sm text-slate-500">
              Current enrolled counts by school year, grade, and section.
            </p>
          </div>
        </div>

        {classLoadRows.length ? (
          <div className="mt-6 grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
            {classLoadRows.slice(0, 12).map((row) => {
              const section = row.sectionId
                ? sectionById.get(row.sectionId)
                : null;
              const adviser = section?.adviser_id
                ? staffById.get(section.adviser_id)
                : null;

              return (
                <article
                  className="rounded-lg border border-slate-200 bg-slate-50 p-4"
                  key={row.key}
                >
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <p className="text-xs font-bold uppercase text-skybrand-600">
                        {yearLabel(yearById, row.schoolYearId)}
                      </p>
                      <h3 className="mt-2 font-display text-lg font-extrabold text-navy-950">
                        {gradeLabel(gradeById, row.gradeLevelId)}{" "}
                        {sectionLabel(sectionById, row.sectionId)}
                      </h3>
                    </div>
                    <span className="rounded-full bg-white px-3 py-1 text-xs font-bold text-slate-600">
                      {row.count}
                    </span>
                  </div>
                  <div className="mt-4 flex items-start gap-2 text-sm text-slate-600">
                    <UserRoundCheck
                      className="mt-0.5 shrink-0 text-skybrand-600"
                      size={17}
                    />
                    <span>{staffLabel(adviser)}</span>
                  </div>
                  <div className="mt-3 flex items-start gap-2 text-sm text-slate-600">
                    <CheckCircle2
                      className="mt-0.5 shrink-0 text-skybrand-600"
                      size={17}
                    />
                    <span>{row.promotedCount} source links used</span>
                  </div>
                </article>
              );
            })}
          </div>
        ) : (
          <div className="mt-6">
            <EmptyState
              message="Enroll learners before reviewing class assignment load."
              title="No enrolled classes"
            />
          </div>
        )}
      </section>

      <section className="rounded-lg border border-slate-200 bg-white p-4 shadow-soft">
        <div className="flex items-start gap-3">
          <span className="grid size-12 place-items-center rounded-lg bg-skybrand-50 text-skybrand-600">
            <ArrowRight size={24} />
          </span>
          <div>
            <h2 className="font-display text-xl font-extrabold text-navy-950">
              Recent promotion history
            </h2>
            <p className="mt-1 text-sm text-slate-500">
              Target enrollments linked to their source records.
            </p>
          </div>
        </div>

        {recentPromotionRows.length ? (
          <div className="mt-6 overflow-x-auto rounded-lg border border-slate-200">
            <table className="min-w-[920px] text-left text-sm">
              <thead className="bg-slate-50 text-xs font-bold uppercase text-slate-500">
                <tr>
                  <th className="px-4 py-3">Learner</th>
                  <th className="px-4 py-3">From</th>
                  <th className="px-4 py-3">To</th>
                  <th className="px-4 py-3">Date</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {recentPromotionRows.map((targetEnrollment) => {
                  const learner = learnerById.get(targetEnrollment.learner_id);
                  const sourceEnrollment =
                    targetEnrollment.promoted_from_enrollment_id
                      ? enrollmentById.get(
                          targetEnrollment.promoted_from_enrollment_id,
                        )
                      : null;

                  return (
                    <tr key={targetEnrollment.id}>
                      <td className="px-4 py-4">
                        <p className="font-semibold text-navy-950">
                          {learner ? learnerName(learner) : "Learner"}
                        </p>
                        <p className="mt-1 text-slate-500">
                          LRN {learner?.lrn ?? "Unrecorded"}
                        </p>
                      </td>
                      <td className="px-4 py-4 text-slate-600">
                        {sourceEnrollment ? (
                          <>
                            <p>
                              {yearLabel(
                                yearById,
                                sourceEnrollment.school_year_id,
                              )}
                            </p>
                            <p className="mt-1">
                              {gradeLabel(
                                gradeById,
                                sourceEnrollment.grade_level_id,
                              )}{" "}
                              {sectionLabel(
                                sectionById,
                                sourceEnrollment.section_id,
                              )}
                            </p>
                          </>
                        ) : (
                          "Source unavailable"
                        )}
                      </td>
                      <td className="px-4 py-4 text-slate-600">
                        <p>
                          {yearLabel(yearById, targetEnrollment.school_year_id)}
                        </p>
                        <p className="mt-1">
                          {gradeLabel(
                            gradeById,
                            targetEnrollment.grade_level_id,
                          )}{" "}
                          {sectionLabel(
                            sectionById,
                            targetEnrollment.section_id,
                          )}
                        </p>
                      </td>
                      <td className="px-4 py-4 text-slate-600">
                        {formatDate(targetEnrollment.enrolled_on)}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="mt-6">
            <EmptyState
              message="Promotion history appears after a batch is saved."
              title="No promotions yet"
            />
          </div>
        )}
      </section>
    </div>
  );
}
