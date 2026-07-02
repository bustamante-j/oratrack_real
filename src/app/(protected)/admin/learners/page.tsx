import Link from "next/link";
import {
  Archive,
  BookUser,
  Download,
  FileSpreadsheet,
  GraduationCap,
  Search,
  Shield,
  Undo2,
  Upload,
  UserPlus,
  UsersRound,
} from "lucide-react";

import { ActionDisclosure } from "@/components/ui/action-disclosure";
import { AnalyticsSummary } from "@/components/ui/analytics-summary";
import { ButtonLink } from "@/components/ui/button";
import { EmptyState } from "@/components/ui/empty-state";
import { MetricStrip } from "@/components/ui/metric-strip";
import { SubmitButton } from "@/components/ui/submit-button";
import { ViewModePanel } from "@/components/ui/view-mode-panel";
import { createSupabaseServerClient } from "@/lib/supabase/server";

import {
  createLearnerAction,
  importLearnersWorkbookAction,
  setLearnerStatusAction,
  updateLearnerAction,
  upsertLearnerEnrollmentAction,
  upsertPrimaryGuardianAction,
} from "./actions";

export const metadata = {
  title: "Learner Repository",
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
  archived_at: string | null;
  created_at: string;
};

type LearnerGuardian = {
  id: string;
  learner_id: string;
  full_name: string;
  relationship: string;
  phone: string | null;
  email: string | null;
  address: string | null;
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

export default async function LearnersPage({
  searchParams,
}: {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}) {
  const params = await searchParams;
  const query = firstSearchValue(params.q)?.trim().toLowerCase() ?? "";
  const statusFilter = firstSearchValue(params.status) ?? "";
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
        "id,lrn,first_name,middle_name,last_name,extension_name,sex,birth_date,address,status,archived_at,created_at",
      )
      .order("last_name", { ascending: true }),
    supabase
      .from("learner_guardians")
      .select(
        "id,learner_id,full_name,relationship,phone,email,address,is_primary",
      ),
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
    const text = `${learner.lrn} ${learnerName(learner)}`.toLowerCase();
    const matchesQuery = query ? text.includes(query) : true;
    const matchesStatus = statusFilter ? learner.status === statusFilter : true;
    return matchesQuery && matchesStatus;
  });

  const activeLearners = learners.filter(
    (learner) => learner.status === "active",
  ).length;
  const archivedLearners = learners.filter(
    (learner) => learner.status === "archived",
  ).length;
  const activeYearEnrollments = activeYear
    ? enrollments.filter(
        (enrollment) => enrollment.school_year_id === activeYear.id,
      ).length
    : 0;

  const sectionLabel = (section: Section) => {
    const year = yearById.get(section.school_year_id)?.name ?? "School year";
    const grade = gradeById.get(section.grade_level_id)?.label ?? "Grade";
    return `${year} - ${grade} ${section.name}`;
  };

  return (
    <div className="space-y-4">
      <div>
        <h1 className="font-display text-2xl font-extrabold text-navy-950">
          Learner repository
        </h1>
        <details className="mt-3 max-w-3xl text-sm leading-7 text-slate-600">
          <summary className="cursor-pointer text-sm font-bold text-navy-950">
            More
          </summary>
          Maintain one stable learner record, then track every yearly grade,
          section, guardian, and archive state through linked records.
        </details>
      </div>

      <MetricStrip
        items={[
          { label: "Learners", value: learners.length },
          { label: "Active", value: activeLearners },
          { label: "Active-year enrollments", value: activeYearEnrollments },
          { label: "Archived", value: archivedLearners },
        ]}
      />

      <div className="grid gap-4">
        <ActionDisclosure
          icon={<UserPlus size={17} />}
          meta="Identity and guardian"
          title="Register learner"
        >
          <form
            action={createLearnerAction}
            className="grid gap-4 md:grid-cols-2"
          >
            <label>
              <span className="label">LRN</span>
              <input className="input" name="lrn" required />
            </label>
            <label>
              <span className="label">Birth date</span>
              <input className="input" name="birthDate" required type="date" />
            </label>
            <label>
              <span className="label">First name</span>
              <input className="input" name="firstName" required />
            </label>
            <label>
              <span className="label">Middle name</span>
              <input className="input" name="middleName" />
            </label>
            <label>
              <span className="label">Last name</span>
              <input className="input" name="lastName" required />
            </label>
            <label>
              <span className="label">Extension</span>
              <input className="input" name="extensionName" placeholder="Jr." />
            </label>
            <label>
              <span className="label">Sex</span>
              <select className="input" name="sex" required>
                <option value="female">Female</option>
                <option value="male">Male</option>
              </select>
            </label>
            <label>
              <span className="label">Address</span>
              <input className="input" name="address" />
            </label>

            <div className="md:col-span-2">
              <p className="text-xs font-bold uppercase text-slate-500">
                Primary guardian
              </p>
            </div>
            <label>
              <span className="label">Guardian name</span>
              <input className="input" name="guardianFullName" />
            </label>
            <label>
              <span className="label">Relationship</span>
              <input className="input" name="guardianRelationship" />
            </label>
            <label>
              <span className="label">Guardian phone</span>
              <input className="input" name="guardianPhone" />
            </label>
            <label>
              <span className="label">Guardian email</span>
              <input className="input" name="guardianEmail" type="email" />
            </label>
            <label className="md:col-span-2">
              <span className="label">Guardian address</span>
              <input className="input" name="guardianAddress" />
            </label>
            <div className="md:col-span-2">
              <SubmitButton>Register learner</SubmitButton>
            </div>
          </form>
        </ActionDisclosure>

        <section className="rounded-lg border border-slate-200 bg-white p-4 shadow-soft">
          <div className="flex items-start gap-3">
            <span className="grid size-12 place-items-center rounded-lg bg-skybrand-50 text-skybrand-600">
              <FileSpreadsheet size={24} />
            </span>
            <div>
              <h2 className="font-display text-xl font-extrabold text-navy-950">
                Bulk import learners
              </h2>
            </div>
          </div>

          <div className="mt-4 flex flex-wrap gap-3">
            <ButtonLink
              href="/api/templates/learner-import"
              variant="secondary"
            >
              <Download size={17} />
              Download learner template
            </ButtonLink>
          </div>

          <ActionDisclosure
            className="mt-5 bg-slate-50 shadow-none"
            icon={<Upload size={17} />}
            meta="XLSX"
            title="Import learners"
          >
            <form action={importLearnersWorkbookAction} className="grid gap-4">
              <label>
                <span className="label">Filled workbook</span>
                <input
                  accept=".xlsx"
                  className="input bg-white"
                  name="learnerFile"
                  required
                  type="file"
                />
              </label>
              <div>
                <SubmitButton pendingLabel="Importing learners...">
                  <Upload size={17} />
                  Import learners
                </SubmitButton>
              </div>
            </form>
          </ActionDisclosure>

          <details className="mt-5 rounded-lg bg-skybrand-50 p-4">
            <summary className="cursor-pointer text-sm font-bold text-navy-950">
              Import note
            </summary>
            <p className="mt-3 text-sm leading-7 text-slate-700">
              The workbook uses existing school year, grade level, and section
              names. Rows are upserted by LRN, so corrected uploads update the
              same learner record instead of duplicating it.
            </p>
          </details>
        </section>
      </div>

      <section className="rounded-lg border border-slate-200 bg-white p-4 shadow-soft">
        <div className="flex items-start gap-3">
          <span className="grid size-12 place-items-center rounded-lg bg-skybrand-50 text-skybrand-600">
            <GraduationCap size={24} />
          </span>
          <div>
            <h2 className="font-display text-xl font-extrabold text-navy-950">
              Enrolled learners
            </h2>
          </div>
        </div>

        <div className="mt-4 grid gap-4">
          <ActionDisclosure
            className="bg-slate-50 shadow-none"
            icon={<GraduationCap size={17} />}
            meta="Year and section"
            title="Save enrollment"
          >
            {learners.length && schoolYears.length && gradeLevels.length ? (
              <form
                action={upsertLearnerEnrollmentAction}
                className="grid gap-4"
              >
                <label>
                  <span className="label">Learner</span>
                  <select className="input bg-white" name="learnerId" required>
                    {learners.map((learner) => (
                      <option key={learner.id} value={learner.id}>
                        {learnerName(learner)} - {learner.lrn}
                      </option>
                    ))}
                  </select>
                </label>
                <label>
                  <span className="label">School year</span>
                  <select
                    className="input bg-white"
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
                  <select
                    className="input bg-white"
                    name="gradeLevelId"
                    required
                  >
                    {gradeLevels.map((grade) => (
                      <option key={grade.id} value={grade.id}>
                        {grade.label}
                      </option>
                    ))}
                  </select>
                </label>
                <label>
                  <span className="label">Section</span>
                  <select className="input bg-white" name="sectionId">
                    <option value="">Unassigned</option>
                    {sections.map((section) => (
                      <option key={section.id} value={section.id}>
                        {sectionLabel(section)}
                      </option>
                    ))}
                  </select>
                </label>
                <div className="grid gap-4 sm:grid-cols-2">
                  <label>
                    <span className="label">Enrollment status</span>
                    <input
                      className="input bg-white"
                      defaultValue="enrolled"
                      name="enrollmentStatus"
                      required
                    />
                  </label>
                  <label>
                    <span className="label">Enrolled on</span>
                    <input
                      className="input bg-white"
                      name="enrolledOn"
                      type="date"
                    />
                  </label>
                </div>
                <SubmitButton>Save enrollment</SubmitButton>
              </form>
            ) : (
              <EmptyState
                message="Add a learner and school setup before assigning sections."
                title="Enrollment setup incomplete"
              />
            )}
          </ActionDisclosure>

          <div className="overflow-x-auto rounded-lg border border-slate-200">
            <table className="min-w-[760px] text-left text-sm">
              <thead className="bg-slate-50 text-xs font-bold uppercase text-slate-500">
                <tr>
                  <th className="px-4 py-3">Learner</th>
                  <th className="px-4 py-3">School year</th>
                  <th className="px-4 py-3">Grade</th>
                  <th className="px-4 py-3">Section</th>
                  <th className="px-4 py-3">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 bg-white">
                {(activeYear
                  ? enrollments.filter(
                      (enrollment) =>
                        enrollment.school_year_id === activeYear.id,
                    )
                  : enrollments
                )
                  .slice(0, 12)
                  .map((enrollment) => {
                    const learner = learners.find(
                      (item) => item.id === enrollment.learner_id,
                    );
                    return (
                      <tr key={enrollment.id}>
                        <td className="px-4 py-4">
                          <p className="font-semibold text-navy-950">
                            {learner ? learnerName(learner) : "Learner"}
                          </p>
                          <p className="mt-1 text-xs font-bold uppercase text-slate-500">
                            LRN {learner?.lrn ?? "Unrecorded"}
                          </p>
                        </td>
                        <td className="px-4 py-4 text-slate-600">
                          {yearById.get(enrollment.school_year_id)?.name ??
                            "School year"}
                        </td>
                        <td className="px-4 py-4 text-slate-600">
                          {gradeById.get(enrollment.grade_level_id)?.label ??
                            "Grade"}
                        </td>
                        <td className="px-4 py-4 text-slate-600">
                          {enrollment.section_id
                            ? sectionById.get(enrollment.section_id)?.name
                            : "Unassigned"}
                        </td>
                        <td className="px-4 py-4">
                          <span className="rounded-full bg-skybrand-50 px-3 py-1 text-xs font-bold text-skybrand-700">
                            {enrollment.enrollment_status}
                          </span>
                        </td>
                      </tr>
                    );
                  })}
              </tbody>
            </table>
          </div>
        </div>
      </section>

      <section className="rounded-lg border border-slate-200 bg-white p-4 shadow-soft">
        <div className="flex flex-col gap-4 xl:flex-row xl:items-end xl:justify-between">
          <div className="flex items-start gap-3">
            <span className="grid size-12 place-items-center rounded-lg bg-skybrand-50 text-skybrand-600">
              <UsersRound size={24} />
            </span>
            <div>
              <h2 className="font-display text-xl font-extrabold text-navy-950">
                Learner profiles
              </h2>
            </div>
          </div>

          <form className="grid gap-3 sm:grid-cols-[minmax(14rem,1fr)_11rem_auto]">
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
            <label>
              <span className="label">Status</span>
              <select
                className="input"
                defaultValue={statusFilter}
                name="status"
              >
                <option value="">All</option>
                <option value="active">Active</option>
                <option value="inactive">Inactive</option>
                <option value="archived">Archived</option>
                <option value="transferred">Transferred</option>
              </select>
            </label>
            <div className="flex items-end">
              <button
                className="inline-flex min-h-9 items-center justify-center rounded-lg border border-slate-200 bg-white px-3 py-1.5 text-sm font-bold text-navy-950 transition hover:border-slate-300 hover:bg-slate-50"
                type="submit"
              >
                Filter
              </button>
            </div>
          </form>
        </div>

        {filteredLearners.length ? (
          <div className="mt-4">
            <ViewModePanel
              analytics={
                <div className="grid gap-4">
                  <AnalyticsSummary
                    items={[
                      {
                        label: "Active",
                        value: filteredLearners.filter(
                          (learner) => learner.status === "active",
                        ).length,
                        total: filteredLearners.length,
                      },
                      {
                        label: "Inactive",
                        value: filteredLearners.filter(
                          (learner) => learner.status === "inactive",
                        ).length,
                        total: filteredLearners.length,
                      },
                      {
                        label: "Transferred",
                        value: filteredLearners.filter(
                          (learner) => learner.status === "transferred",
                        ).length,
                        total: filteredLearners.length,
                      },
                      {
                        label: "Archived",
                        value: filteredLearners.filter(
                          (learner) => learner.status === "archived",
                        ).length,
                        total: filteredLearners.length,
                      },
                    ]}
                    title="Status mix"
                  />
                  <AnalyticsSummary
                    items={[
                      {
                        label: "With guardian",
                        value: filteredLearners.filter((learner) =>
                          primaryGuardianByLearner.has(learner.id),
                        ).length,
                        total: filteredLearners.length,
                      },
                      {
                        label: "With enrollment",
                        value: filteredLearners.filter(
                          (learner) =>
                            (enrollmentsByLearner.get(learner.id) ?? [])
                              .length > 0,
                        ).length,
                        total: filteredLearners.length,
                      },
                      {
                        label: "Female",
                        value: filteredLearners.filter(
                          (learner) => learner.sex === "female",
                        ).length,
                        total: filteredLearners.length,
                      },
                      {
                        label: "Male",
                        value: filteredLearners.filter(
                          (learner) => learner.sex === "male",
                        ).length,
                        total: filteredLearners.length,
                      },
                    ]}
                    title="Record completeness"
                  />
                </div>
              }
              label="Learner view"
              cards={
                <div className="grid gap-4">
                  {filteredLearners.map((learner) => {
                    const learnerEnrollments =
                      enrollmentsByLearner.get(learner.id) ?? [];
                    const currentEnrollment = activeYear
                      ? learnerEnrollments.find(
                          (enrollment) =>
                            enrollment.school_year_id === activeYear.id,
                        )
                      : learnerEnrollments[0];
                    const guardian = primaryGuardianByLearner.get(learner.id);

                    return (
                      <article
                        className="rounded-lg border border-slate-200 bg-white p-4 shadow-soft transition hover:border-skybrand-200"
                        key={learner.id}
                      >
                        <div className="flex flex-wrap items-center justify-between gap-3">
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
                          <Link
                            className="inline-flex items-center gap-2 rounded-lg border border-slate-200 bg-white px-2.5 py-1.5 text-xs font-bold text-navy-950 transition hover:border-slate-300 hover:bg-slate-50"
                            href={`/admin/learners/${learner.id}`}
                          >
                            Open
                          </Link>
                        </div>

                        <h3 className="mt-4 font-display text-xl font-extrabold text-navy-950">
                          {learnerName(learner)}
                        </h3>

                        <section className="mt-5 rounded-lg bg-slate-50 p-4">
                          <div className="flex items-start gap-2">
                            <BookUser
                              className="mt-0.5 text-skybrand-600"
                              size={18}
                            />
                            <div>
                              <p className="text-sm font-bold text-navy-950">
                                Current enrollment
                              </p>
                              <p className="mt-1 text-sm text-slate-600">
                                {currentEnrollment
                                  ? `${yearById.get(currentEnrollment.school_year_id)?.name ?? "School year"} - ${gradeById.get(currentEnrollment.grade_level_id)?.label ?? "Grade"}`
                                  : "No enrollment recorded"}
                              </p>
                              <p className="mt-1 text-sm text-slate-600">
                                {currentEnrollment?.section_id
                                  ? sectionById.get(
                                      currentEnrollment.section_id,
                                    )?.name
                                  : "No section assigned"}
                              </p>
                            </div>
                          </div>
                        </section>

                        <details className="mt-4 rounded-lg border border-slate-200 bg-white p-4 transition open:border-skybrand-200">
                          <summary className="cursor-pointer text-sm font-bold text-navy-950">
                            More details and actions
                          </summary>

                          <div className="mt-4 grid gap-4">
                            <div className="grid gap-2 text-sm text-slate-600 sm:grid-cols-2">
                              <p>
                                <span className="font-bold text-slate-700">
                                  Sex:
                                </span>{" "}
                                {learner.sex}
                              </p>
                              <p>
                                <span className="font-bold text-slate-700">
                                  Birth date:
                                </span>{" "}
                                {learner.birth_date}
                              </p>
                              <p className="sm:col-span-2">
                                <span className="font-bold text-slate-700">
                                  Address:
                                </span>{" "}
                                {learner.address || "Unassigned"}
                              </p>
                            </div>

                            <div className="rounded-lg bg-slate-50 p-4">
                              <div className="flex items-start gap-2">
                                <Shield
                                  className="mt-0.5 text-skybrand-600"
                                  size={17}
                                />
                                <div>
                                  <p className="text-xs font-bold uppercase text-slate-500">
                                    Guardian
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
                            </div>

                            <details className="rounded-lg border border-slate-200 bg-white p-4">
                              <summary className="cursor-pointer text-sm font-bold text-navy-950">
                                Enrollment history
                              </summary>
                              {learnerEnrollments.length ? (
                                <div className="mt-4 grid gap-2">
                                  {learnerEnrollments.map((enrollment) => (
                                    <div
                                      className="rounded-lg bg-slate-50 p-3 text-sm text-slate-600"
                                      key={enrollment.id}
                                    >
                                      <p className="font-bold text-navy-950">
                                        {yearById.get(enrollment.school_year_id)
                                          ?.name ?? "School year"}{" "}
                                        -{" "}
                                        {gradeById.get(
                                          enrollment.grade_level_id,
                                        )?.label ?? "Grade"}
                                      </p>
                                      <p className="mt-1">
                                        Section:{" "}
                                        {enrollment.section_id
                                          ? sectionById.get(
                                              enrollment.section_id,
                                            )?.name
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

                            <details className="rounded-lg border border-slate-200 bg-white p-4">
                              <summary className="cursor-pointer text-sm font-bold text-navy-950">
                                Status actions
                              </summary>
                              <div className="mt-4 flex flex-wrap gap-2">
                                {(
                                  ["active", "inactive", "transferred"] as const
                                ).map((status) => (
                                  <form
                                    action={setLearnerStatusAction}
                                    key={status}
                                  >
                                    <input
                                      name="id"
                                      type="hidden"
                                      value={learner.id}
                                    />
                                    <input
                                      name="status"
                                      type="hidden"
                                      value={status}
                                    />
                                    <button
                                      className="rounded-lg border border-slate-200 bg-white px-3 py-2 text-xs font-bold text-slate-600 transition hover:border-skybrand-300 hover:bg-skybrand-50 hover:text-navy-900 disabled:cursor-not-allowed disabled:opacity-45"
                                      disabled={learner.status === status}
                                      type="submit"
                                    >
                                      Mark {status}
                                    </button>
                                  </form>
                                ))}
                                {learner.status === "archived" ? (
                                  <form action={setLearnerStatusAction}>
                                    <input
                                      name="id"
                                      type="hidden"
                                      value={learner.id}
                                    />
                                    <input
                                      name="status"
                                      type="hidden"
                                      value="active"
                                    />
                                    <button
                                      className="inline-flex items-center gap-2 rounded-lg border border-slate-200 bg-white px-3 py-2 text-xs font-bold text-slate-600 transition hover:border-skybrand-300 hover:bg-skybrand-50 hover:text-navy-900"
                                      type="submit"
                                    >
                                      <Undo2 size={14} />
                                      Restore
                                    </button>
                                  </form>
                                ) : (
                                  <form action={setLearnerStatusAction}>
                                    <input
                                      name="id"
                                      type="hidden"
                                      value={learner.id}
                                    />
                                    <input
                                      name="status"
                                      type="hidden"
                                      value="archived"
                                    />
                                    <button
                                      className="inline-flex items-center gap-2 rounded-lg border border-rose-200 bg-white px-3 py-2 text-xs font-bold text-rose-700 transition hover:bg-rose-50"
                                      type="submit"
                                    >
                                      <Archive size={14} />
                                      Archive
                                    </button>
                                  </form>
                                )}
                              </div>
                            </details>

                            <details className="rounded-lg border border-slate-200 bg-white p-4">
                              <summary className="cursor-pointer text-sm font-bold text-navy-950">
                                Edit learner
                              </summary>
                              <form
                                action={updateLearnerAction}
                                className="mt-4 grid gap-4 sm:grid-cols-2"
                              >
                                <input
                                  name="id"
                                  type="hidden"
                                  value={learner.id}
                                />
                                <label>
                                  <span className="label">LRN</span>
                                  <input
                                    className="input"
                                    defaultValue={learner.lrn}
                                    name="lrn"
                                    required
                                  />
                                </label>
                                <label>
                                  <span className="label">Birth date</span>
                                  <input
                                    className="input"
                                    defaultValue={learner.birth_date}
                                    name="birthDate"
                                    required
                                    type="date"
                                  />
                                </label>
                                <label>
                                  <span className="label">First name</span>
                                  <input
                                    className="input"
                                    defaultValue={learner.first_name}
                                    name="firstName"
                                    required
                                  />
                                </label>
                                <label>
                                  <span className="label">Middle name</span>
                                  <input
                                    className="input"
                                    defaultValue={learner.middle_name ?? ""}
                                    name="middleName"
                                  />
                                </label>
                                <label>
                                  <span className="label">Last name</span>
                                  <input
                                    className="input"
                                    defaultValue={learner.last_name}
                                    name="lastName"
                                    required
                                  />
                                </label>
                                <label>
                                  <span className="label">Extension</span>
                                  <input
                                    className="input"
                                    defaultValue={learner.extension_name ?? ""}
                                    name="extensionName"
                                  />
                                </label>
                                <label>
                                  <span className="label">Sex</span>
                                  <select
                                    className="input"
                                    defaultValue={learner.sex}
                                    name="sex"
                                    required
                                  >
                                    <option value="female">Female</option>
                                    <option value="male">Male</option>
                                  </select>
                                </label>
                                <label>
                                  <span className="label">Address</span>
                                  <input
                                    className="input"
                                    defaultValue={learner.address ?? ""}
                                    name="address"
                                  />
                                </label>
                                <div className="sm:col-span-2">
                                  <SubmitButton>Save learner</SubmitButton>
                                </div>
                              </form>
                            </details>

                            <details className="rounded-lg border border-slate-200 bg-white p-4">
                              <summary className="cursor-pointer text-sm font-bold text-navy-950">
                                Update guardian
                              </summary>
                              <form
                                action={upsertPrimaryGuardianAction}
                                className="mt-4 grid gap-4 sm:grid-cols-2"
                              >
                                <input
                                  name="learnerId"
                                  type="hidden"
                                  value={learner.id}
                                />
                                <label>
                                  <span className="label">Guardian name</span>
                                  <input
                                    className="input"
                                    defaultValue={guardian?.full_name ?? ""}
                                    name="fullName"
                                    required
                                  />
                                </label>
                                <label>
                                  <span className="label">Relationship</span>
                                  <input
                                    className="input"
                                    defaultValue={guardian?.relationship ?? ""}
                                    name="relationship"
                                    required
                                  />
                                </label>
                                <label>
                                  <span className="label">Phone</span>
                                  <input
                                    className="input"
                                    defaultValue={guardian?.phone ?? ""}
                                    name="phone"
                                  />
                                </label>
                                <label>
                                  <span className="label">Email</span>
                                  <input
                                    className="input"
                                    defaultValue={guardian?.email ?? ""}
                                    name="email"
                                    type="email"
                                  />
                                </label>
                                <label className="sm:col-span-2">
                                  <span className="label">Address</span>
                                  <input
                                    className="input"
                                    defaultValue={guardian?.address ?? ""}
                                    name="address"
                                  />
                                </label>
                                <div className="sm:col-span-2">
                                  <SubmitButton>Save guardian</SubmitButton>
                                </div>
                              </form>
                            </details>
                          </div>
                        </details>
                      </article>
                    );
                  })}
                </div>
              }
              table={
                <div className="overflow-x-auto rounded-lg border border-slate-200 bg-white">
                  <table className="min-w-[900px] text-left text-sm">
                    <thead className="bg-slate-50 text-xs font-bold uppercase text-slate-500">
                      <tr>
                        <th className="px-4 py-3">Learner</th>
                        <th className="px-4 py-3">LRN</th>
                        <th className="px-4 py-3">Status</th>
                        <th className="px-4 py-3">Enrollment</th>
                        <th className="px-4 py-3">Guardian</th>
                        <th className="px-4 py-3">Action</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                      {filteredLearners.map((learner) => {
                        const learnerEnrollments =
                          enrollmentsByLearner.get(learner.id) ?? [];
                        const currentEnrollment = activeYear
                          ? learnerEnrollments.find(
                              (enrollment) =>
                                enrollment.school_year_id === activeYear.id,
                            )
                          : learnerEnrollments[0];
                        const guardian = primaryGuardianByLearner.get(
                          learner.id,
                        );

                        return (
                          <tr key={learner.id}>
                            <td className="px-4 py-4 font-semibold text-navy-950">
                              {learnerName(learner)}
                            </td>
                            <td className="px-4 py-4 text-slate-600">
                              {learner.lrn}
                            </td>
                            <td className="px-4 py-4">
                              <span
                                className={`rounded-full px-3 py-1 text-xs font-bold ${statusTone(learner.status)}`}
                              >
                                {learner.status}
                              </span>
                            </td>
                            <td className="px-4 py-4 text-slate-600">
                              {currentEnrollment
                                ? `${gradeById.get(currentEnrollment.grade_level_id)?.label ?? "Grade"} - ${
                                    currentEnrollment.section_id
                                      ? sectionById.get(
                                          currentEnrollment.section_id,
                                        )?.name
                                      : "Unassigned"
                                  }`
                                : "No enrollment"}
                            </td>
                            <td className="px-4 py-4 text-slate-600">
                              {guardian?.full_name ?? "Unassigned"}
                            </td>
                            <td className="px-4 py-4">
                              <Link
                                className="rounded-lg border border-slate-200 bg-white px-2.5 py-1.5 text-xs font-bold text-navy-950 transition hover:border-slate-300 hover:bg-slate-50"
                                href={`/admin/learners/${learner.id}`}
                              >
                                Open
                              </Link>
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              }
              compact={
                <div className="grid gap-2">
                  {filteredLearners.map((learner) => {
                    const learnerEnrollments =
                      enrollmentsByLearner.get(learner.id) ?? [];
                    const currentEnrollment = activeYear
                      ? learnerEnrollments.find(
                          (enrollment) =>
                            enrollment.school_year_id === activeYear.id,
                        )
                      : learnerEnrollments[0];

                    return (
                      <Link
                        className="flex flex-wrap items-center justify-between gap-3 rounded-lg border border-slate-200 bg-white p-4 transition hover:border-skybrand-300 hover:bg-skybrand-50"
                        href={`/admin/learners/${learner.id}`}
                        key={learner.id}
                      >
                        <div>
                          <p className="font-semibold text-navy-950">
                            {learnerName(learner)}
                          </p>
                          <p className="text-xs font-bold uppercase text-slate-500">
                            LRN {learner.lrn}
                          </p>
                        </div>
                        <div className="flex flex-wrap items-center gap-2">
                          <span
                            className={`rounded-full px-3 py-1 text-xs font-bold ${statusTone(learner.status)}`}
                          >
                            {learner.status}
                          </span>
                          <span className="text-sm font-semibold text-slate-600">
                            {currentEnrollment
                              ? gradeById.get(currentEnrollment.grade_level_id)
                                  ?.label
                              : "No enrollment"}
                          </span>
                        </div>
                      </Link>
                    );
                  })}
                </div>
              }
            />
          </div>
        ) : (
          <div className="mt-4">
            <EmptyState
              message="No learner records match the current filter."
              title="No learners found"
            />
          </div>
        )}
      </section>
    </div>
  );
}
