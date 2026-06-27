import {
  BookOpenCheck,
  Download,
  FileSpreadsheet,
  Save,
  TrendingUp,
  Upload,
} from "lucide-react";

import { ButtonLink } from "@/components/ui/button";
import { EmptyState } from "@/components/ui/empty-state";
import { SubmitButton } from "@/components/ui/submit-button";
import { requireAuthenticatedProfile } from "@/lib/auth/session";
import { createSupabaseServerClient } from "@/lib/supabase/server";

import { importGradeWorkbookAction, saveGradeRecordsAction } from "./actions";

export const metadata = {
  title: "Grades",
};

type Learner = {
  id: string;
  lrn: string;
  first_name: string;
  middle_name: string | null;
  last_name: string;
  extension_name: string | null;
  status: "active" | "inactive" | "archived" | "transferred";
};

type LearnerEnrollment = {
  id: string;
  learner_id: string;
  school_year_id: string;
  grade_level_id: number;
  section_id: string | null;
  enrollment_status: string;
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

type Subject = {
  id: string;
  code: string;
  name: string;
  grade_level_id: number | null;
  is_active: boolean;
};

type SectionSubject = {
  id: string;
  section_id: string;
  subject_id: string;
  teacher_id: string | null;
};

type GradePeriod = {
  id: string;
  school_year_id: string | null;
  code: string;
  name: string;
  sort_order: number;
};

type GradeRecord = {
  id: string;
  enrollment_id: string;
  subject_id: string;
  grade_period_id: string;
  numeric_grade: number;
  remarks: string | null;
};

type GradeImportBatch = {
  id: string;
  school_year_id: string;
  section_id: string;
  subject_id: string;
  status: string;
  row_count: number;
  error_count: number;
  source_file_path: string | null;
  created_at: string;
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

function formatDateTime(value: string) {
  return new Intl.DateTimeFormat("en", {
    month: "short",
    day: "numeric",
    year: "numeric",
    hour: "numeric",
    minute: "2-digit",
  }).format(new Date(value));
}

function gradeLabel(gradeById: Map<number, GradeLevel>, gradeId: number) {
  return gradeById.get(gradeId)?.label ?? "Grade";
}

function gradeTone(value: number | null) {
  if (value === null) return "bg-slate-100 text-slate-600";
  if (value >= 90) return "bg-emerald-50 text-emerald-700";
  if (value >= 75) return "bg-skybrand-50 text-navy-900";
  return "bg-rose-50 text-rose-700";
}

function average(values: number[]) {
  if (!values.length) return null;

  return values.reduce((sum, value) => sum + value, 0) / values.length;
}

export default async function GradesPage({
  searchParams,
}: {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}) {
  const profile = await requireAuthenticatedProfile();
  const params = await searchParams;
  const supabase = await createSupabaseServerClient();
  const [
    schoolYearResult,
    gradeLevelResult,
    sectionResult,
    subjectResult,
    assignmentResult,
    learnerResult,
    enrollmentResult,
    gradePeriodResult,
    gradeResult,
    batchResult,
  ] = await Promise.all([
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
    supabase
      .from("subjects")
      .select("id,code,name,grade_level_id,is_active")
      .order("code", { ascending: true }),
    supabase
      .from("section_subjects")
      .select("id,section_id,subject_id,teacher_id")
      .eq("teacher_id", profile.userId),
    supabase
      .from("learners")
      .select("id,lrn,first_name,middle_name,last_name,extension_name,status")
      .order("last_name", { ascending: true }),
    supabase
      .from("learner_enrollments")
      .select(
        "id,learner_id,school_year_id,grade_level_id,section_id,enrollment_status",
      )
      .order("created_at", { ascending: false }),
    supabase
      .from("grade_periods")
      .select("id,school_year_id,code,name,sort_order")
      .order("sort_order", { ascending: true }),
    supabase
      .from("grades")
      .select(
        "id,enrollment_id,subject_id,grade_period_id,numeric_grade,remarks",
      ),
    supabase
      .from("grade_import_batches")
      .select(
        "id,school_year_id,section_id,subject_id,status,row_count,error_count,source_file_path,created_at",
      )
      .order("created_at", { ascending: false }),
  ]);

  const firstError =
    schoolYearResult.error ??
    gradeLevelResult.error ??
    sectionResult.error ??
    subjectResult.error ??
    assignmentResult.error ??
    learnerResult.error ??
    enrollmentResult.error ??
    gradePeriodResult.error ??
    gradeResult.error ??
    batchResult.error;

  if (firstError) {
    throw new Error(firstError.message);
  }

  const schoolYears = (schoolYearResult.data ?? []) as SchoolYear[];
  const gradeLevels = (gradeLevelResult.data ?? []) as GradeLevel[];
  const sections = (sectionResult.data ?? []) as Section[];
  const subjects = (subjectResult.data ?? []) as Subject[];
  const assignments = (assignmentResult.data ?? []) as SectionSubject[];
  const learners = (learnerResult.data ?? []) as Learner[];
  const enrollments = (enrollmentResult.data ?? []) as LearnerEnrollment[];
  const gradePeriods = (gradePeriodResult.data ?? []) as GradePeriod[];
  const grades = (gradeResult.data ?? []) as GradeRecord[];
  const batches = (batchResult.data ?? []) as GradeImportBatch[];

  const gradeById = new Map(gradeLevels.map((grade) => [grade.id, grade]));
  const yearById = new Map(schoolYears.map((year) => [year.id, year]));
  const sectionById = new Map(sections.map((section) => [section.id, section]));
  const subjectById = new Map(subjects.map((subject) => [subject.id, subject]));
  const learnerById = new Map(learners.map((learner) => [learner.id, learner]));
  const requestedAssignmentId = firstSearchValue(params.assignmentId);
  const selectedAssignment =
    assignments.find((assignment) => assignment.id === requestedAssignmentId) ??
    assignments[0];
  const selectedSection = selectedAssignment
    ? sectionById.get(selectedAssignment.section_id)
    : null;
  const selectedSubject = selectedAssignment
    ? subjectById.get(selectedAssignment.subject_id)
    : null;
  const selectedGradePeriods = selectedSection
    ? gradePeriods.filter(
        (period) => period.school_year_id === selectedSection.school_year_id,
      )
    : [];
  const requestedPeriodId = firstSearchValue(params.periodId);
  const selectedPeriod =
    selectedGradePeriods.find((period) => period.id === requestedPeriodId) ??
    selectedGradePeriods[0];
  const selectedEnrollments = selectedSection
    ? enrollments.filter(
        (enrollment) =>
          enrollment.section_id === selectedSection.id &&
          enrollment.enrollment_status === "enrolled",
      )
    : [];
  const selectedGrades = selectedAssignment
    ? grades.filter(
        (grade) => grade.subject_id === selectedAssignment.subject_id,
      )
    : [];
  const selectedPeriodGrades =
    selectedPeriod && selectedAssignment
      ? selectedGrades.filter(
          (grade) => grade.grade_period_id === selectedPeriod.id,
        )
      : [];
  const gradeByEnrollment = new Map(
    selectedPeriodGrades.map((grade) => [grade.enrollment_id, grade]),
  );
  const encodedValues = selectedEnrollments
    .map((enrollment) => gradeByEnrollment.get(enrollment.id)?.numeric_grade)
    .filter((value): value is number => typeof value === "number");
  const classAverage = average(encodedValues);
  const missingCount = selectedEnrollments.length - encodedValues.length;
  const recentBatches = selectedAssignment
    ? batches
        .filter(
          (batch) =>
            batch.section_id === selectedAssignment.section_id &&
            batch.subject_id === selectedAssignment.subject_id,
        )
        .slice(0, 6)
    : [];
  const subjectAverages = selectedAssignment
    ? selectedGradePeriods.map((period) => {
        const values = selectedEnrollments
          .map((enrollment) =>
            grades.find(
              (grade) =>
                grade.enrollment_id === enrollment.id &&
                grade.subject_id === selectedAssignment.subject_id &&
                grade.grade_period_id === period.id,
            ),
          )
          .map((grade) => grade?.numeric_grade)
          .filter((value): value is number => typeof value === "number");

        return {
          period,
          average: average(values),
          encodedCount: values.length,
        };
      })
    : [];
  const assignmentLabel =
    selectedAssignment && selectedSection && selectedSubject
      ? `${gradeLabel(gradeById, selectedSection.grade_level_id)} ${selectedSection.name} - ${selectedSubject.code}`
      : "No subject assignment";

  return (
    <div className="space-y-8">
      <div>
        <p className="text-xs font-bold uppercase text-skybrand-600">Phase 9</p>
        <h1 className="mt-3 font-display text-3xl font-extrabold text-navy-950">
          Grades
        </h1>
        <p className="mt-3 max-w-3xl text-sm leading-7 text-slate-600">
          Encode subject grades manually or import the ORATRACK Excel template
          for the sections assigned to your teacher account.
        </p>
      </div>

      <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
        {[
          ["Assignments", assignments.length],
          ["Learners", selectedEnrollments.length],
          ["Encoded", encodedValues.length],
          [
            "Class average",
            classAverage === null ? "N/A" : classAverage.toFixed(2),
          ],
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

      {assignments.length ? (
        <>
          <div className="grid gap-6 xl:grid-cols-[1.05fr_0.95fr]">
            <section className="rounded-[1.5rem] border border-slate-200 bg-white p-6 shadow-soft">
              <div className="flex items-start gap-3">
                <span className="grid size-12 place-items-center rounded-2xl bg-skybrand-50 text-skybrand-600">
                  <BookOpenCheck size={24} />
                </span>
                <div>
                  <h2 className="font-display text-xl font-extrabold text-navy-950">
                    Grade sheet
                  </h2>
                  <p className="mt-1 text-sm text-slate-500">
                    {assignmentLabel}
                    {selectedPeriod ? ` - ${selectedPeriod.name}` : ""}
                  </p>
                </div>
              </div>

              <form className="mt-6 grid gap-4 md:grid-cols-[1fr_1fr_auto]">
                <label>
                  <span className="label">Assignment</span>
                  <select
                    className="input"
                    defaultValue={selectedAssignment?.id}
                    name="assignmentId"
                  >
                    {assignments.map((assignment) => {
                      const section = sectionById.get(assignment.section_id);
                      const subject = subjectById.get(assignment.subject_id);

                      return (
                        <option key={assignment.id} value={assignment.id}>
                          {section
                            ? `${gradeLabel(gradeById, section.grade_level_id)} ${section.name}`
                            : "Section"}{" "}
                          - {subject?.code ?? "Subject"}
                        </option>
                      );
                    })}
                  </select>
                </label>
                <label>
                  <span className="label">Period</span>
                  <select
                    className="input"
                    defaultValue={selectedPeriod?.id ?? ""}
                    name="periodId"
                  >
                    {selectedGradePeriods.length ? (
                      selectedGradePeriods.map((period) => (
                        <option key={period.id} value={period.id}>
                          {period.code} - {period.name}
                        </option>
                      ))
                    ) : (
                      <option value="">No periods configured</option>
                    )}
                  </select>
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

              {selectedAssignment &&
              selectedPeriod &&
              selectedEnrollments.length ? (
                <form
                  action={saveGradeRecordsAction}
                  className="mt-6 overflow-x-auto rounded-2xl border border-slate-200"
                >
                  <input
                    name="assignmentId"
                    type="hidden"
                    value={selectedAssignment.id}
                  />
                  <input
                    name="gradePeriodId"
                    type="hidden"
                    value={selectedPeriod.id}
                  />
                  <table className="min-w-[840px] text-left text-sm">
                    <thead className="bg-slate-50 text-xs font-bold uppercase text-slate-500">
                      <tr>
                        <th className="px-4 py-3">Learner</th>
                        <th className="px-4 py-3">Grade</th>
                        <th className="px-4 py-3">Remarks</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                      {selectedEnrollments.map((enrollment) => {
                        const learner = learnerById.get(enrollment.learner_id);
                        const grade = gradeByEnrollment.get(enrollment.id);

                        return (
                          <tr key={enrollment.id}>
                            <td className="px-4 py-4">
                              <input
                                name="enrollmentId"
                                type="hidden"
                                value={enrollment.id}
                              />
                              <p className="font-semibold text-navy-950">
                                {learner ? learnerName(learner) : "Learner"}
                              </p>
                              <p className="mt-1 text-xs font-bold uppercase text-slate-500">
                                LRN {learner?.lrn ?? "Unrecorded"}
                              </p>
                            </td>
                            <td className="px-4 py-4">
                              <input
                                className="input w-32"
                                defaultValue={grade?.numeric_grade ?? ""}
                                max="100"
                                min="0"
                                name={`numericGrade-${enrollment.id}`}
                                required
                                step="0.01"
                                type="number"
                              />
                            </td>
                            <td className="px-4 py-4">
                              <input
                                className="input min-w-72"
                                defaultValue={grade?.remarks ?? ""}
                                name={`remarks-${enrollment.id}`}
                              />
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                  <div className="border-t border-slate-200 bg-white p-4">
                    <SubmitButton pendingLabel="Saving grades...">
                      <Save size={17} />
                      Save grades
                    </SubmitButton>
                  </div>
                </form>
              ) : (
                <div className="mt-6">
                  <EmptyState
                    action={
                      !selectedGradePeriods.length ? (
                        <ButtonLink
                          href="/admin/school-years"
                          variant="secondary"
                        >
                          Grade periods
                        </ButtonLink>
                      ) : null
                    }
                    message={
                      selectedGradePeriods.length
                        ? "Enroll learners into this section before encoding grades."
                        : "Ask the admin to create standard quarters for this school year."
                    }
                    title={
                      selectedGradePeriods.length
                        ? "No learners in section"
                        : "No grade periods"
                    }
                  />
                </div>
              )}
            </section>

            <section className="rounded-[1.5rem] border border-slate-200 bg-white p-6 shadow-soft">
              <div className="flex items-start gap-3">
                <span className="grid size-12 place-items-center rounded-2xl bg-skybrand-50 text-skybrand-600">
                  <FileSpreadsheet size={24} />
                </span>
                <div>
                  <h2 className="font-display text-xl font-extrabold text-navy-950">
                    Excel import
                  </h2>
                  <p className="mt-1 text-sm text-slate-500">
                    Template columns: LRN, Subject Code, Period Code, Grade,
                    Remarks.
                  </p>
                </div>
              </div>

              <div className="mt-6 flex flex-wrap gap-3">
                <ButtonLink
                  href="/api/templates/grade-import"
                  variant="secondary"
                >
                  <Download size={17} />
                  Download template
                </ButtonLink>
              </div>

              {selectedAssignment ? (
                <form
                  action={importGradeWorkbookAction}
                  className="mt-5 grid gap-4 rounded-2xl border border-slate-200 bg-slate-50 p-5"
                >
                  <input
                    name="assignmentId"
                    type="hidden"
                    value={selectedAssignment.id}
                  />
                  <label>
                    <span className="label">Workbook</span>
                    <input
                      accept=".xlsx"
                      className="input bg-white"
                      name="gradeFile"
                      required
                      type="file"
                    />
                  </label>
                  <SubmitButton pendingLabel="Importing workbook...">
                    <Upload size={17} />
                    Import grades
                  </SubmitButton>
                </form>
              ) : null}

              <div className="mt-6 grid gap-3 sm:grid-cols-2">
                {[
                  ["Missing", missingCount],
                  [
                    "Lowest",
                    encodedValues.length
                      ? Math.min(...encodedValues).toFixed(2)
                      : "N/A",
                  ],
                  [
                    "Highest",
                    encodedValues.length
                      ? Math.max(...encodedValues).toFixed(2)
                      : "N/A",
                  ],
                  ["Imports", recentBatches.length],
                ].map(([label, value]) => (
                  <div
                    className="rounded-2xl border border-slate-200 bg-slate-50 p-4"
                    key={label}
                  >
                    <p className="text-2xl font-extrabold text-navy-950">
                      {value}
                    </p>
                    <p className="mt-1 text-xs font-bold uppercase text-slate-500">
                      {label}
                    </p>
                  </div>
                ))}
              </div>
            </section>
          </div>

          <div className="grid gap-6 xl:grid-cols-[0.85fr_1.15fr]">
            <section className="rounded-[1.5rem] border border-slate-200 bg-white p-6 shadow-soft">
              <div className="flex items-start gap-3">
                <span className="grid size-12 place-items-center rounded-2xl bg-skybrand-50 text-skybrand-600">
                  <TrendingUp size={24} />
                </span>
                <div>
                  <h2 className="font-display text-xl font-extrabold text-navy-950">
                    Period averages
                  </h2>
                  <p className="mt-1 text-sm text-slate-500">
                    Encoded class averages for the selected subject.
                  </p>
                </div>
              </div>

              {subjectAverages.length ? (
                <div className="mt-6 grid gap-3">
                  {subjectAverages.map((row) => (
                    <div
                      className="rounded-2xl border border-slate-200 bg-slate-50 p-4"
                      key={row.period.id}
                    >
                      <div className="flex items-center justify-between gap-3">
                        <div>
                          <p className="font-semibold text-navy-950">
                            {row.period.code} - {row.period.name}
                          </p>
                          <p className="mt-1 text-sm text-slate-500">
                            {row.encodedCount} encoded
                          </p>
                        </div>
                        <span
                          className={`rounded-full px-3 py-1 text-xs font-bold ${gradeTone(row.average)}`}
                        >
                          {row.average === null
                            ? "N/A"
                            : row.average.toFixed(2)}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="mt-6">
                  <EmptyState
                    message="Period averages appear once grade periods and records exist."
                    title="No averages yet"
                  />
                </div>
              )}
            </section>

            <section className="rounded-[1.5rem] border border-slate-200 bg-white p-6 shadow-soft">
              <div className="flex items-start gap-3">
                <span className="grid size-12 place-items-center rounded-2xl bg-skybrand-50 text-skybrand-600">
                  <Upload size={24} />
                </span>
                <div>
                  <h2 className="font-display text-xl font-extrabold text-navy-950">
                    Import history
                  </h2>
                  <p className="mt-1 text-sm text-slate-500">
                    Recent successful imports for this assignment.
                  </p>
                </div>
              </div>

              {recentBatches.length ? (
                <div className="mt-6 overflow-x-auto rounded-2xl border border-slate-200">
                  <table className="min-w-[760px] text-left text-sm">
                    <thead className="bg-slate-50 text-xs font-bold uppercase text-slate-500">
                      <tr>
                        <th className="px-4 py-3">File</th>
                        <th className="px-4 py-3">Year</th>
                        <th className="px-4 py-3">Rows</th>
                        <th className="px-4 py-3">Status</th>
                        <th className="px-4 py-3">Imported</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                      {recentBatches.map((batch) => (
                        <tr key={batch.id}>
                          <td className="px-4 py-4 font-semibold text-navy-950">
                            {batch.source_file_path ?? "Workbook"}
                          </td>
                          <td className="px-4 py-4 text-slate-600">
                            {yearById.get(batch.school_year_id)?.name ??
                              "School year"}
                          </td>
                          <td className="px-4 py-4 text-slate-600">
                            {batch.row_count} rows, {batch.error_count} errors
                          </td>
                          <td className="px-4 py-4">
                            <span className="rounded-full bg-emerald-50 px-3 py-1 text-xs font-bold text-emerald-700">
                              {batch.status}
                            </span>
                          </td>
                          <td className="px-4 py-4 text-slate-600">
                            {formatDateTime(batch.created_at)}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              ) : (
                <div className="mt-6">
                  <EmptyState
                    message="Successful Excel imports will appear here."
                    title="No import batches"
                  />
                </div>
              )}
            </section>
          </div>
        </>
      ) : (
        <EmptyState
          message="Grades are available after an admin assigns your account to a section subject."
          title="No subject assignments"
        />
      )}
    </div>
  );
}
