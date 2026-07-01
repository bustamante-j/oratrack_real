import { AlertTriangle, BookOpenCheck, Brain, Save } from "lucide-react";

import { EmptyState } from "@/components/ui/empty-state";
import { MetricStrip } from "@/components/ui/metric-strip";
import { SubmitButton } from "@/components/ui/submit-button";
import { requireAuthenticatedProfile } from "@/lib/auth/session";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { ratingLevels, type RatingLevel } from "@/types/domain";

import { saveLiteracyNumeracySheetAction } from "./actions";

export const metadata = {
  title: "Literacy and Numeracy",
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
  adviser_id: string | null;
};

type LiteracyNumeracyRecord = {
  id: string;
  enrollment_id: string;
  school_year_id: string;
  literacy_rating: RatingLevel;
  numeracy_rating: RatingLevel;
  remarks: string | null;
  encoded_at: string;
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

function ratingLabel(value: RatingLevel) {
  return value[0].toUpperCase() + value.slice(1);
}

function ratingTone(value: RatingLevel) {
  if (value === "advanced") return "bg-emerald-50 text-emerald-700";
  if (value === "proficient") return "bg-skybrand-50 text-navy-900";
  if (value === "developing") return "bg-amber-50 text-amber-700";
  return "bg-rose-50 text-rose-700";
}

function gradeLabel(gradeById: Map<number, GradeLevel>, gradeId: number) {
  return gradeById.get(gradeId)?.label ?? "Grade";
}

function ratingCounts(
  records: LiteracyNumeracyRecord[],
  field: "literacy" | "numeracy",
) {
  const key = `${field}_rating` as const;

  return ratingLevels.map((rating) => ({
    rating,
    count: records.filter((record) => record[key] === rating).length,
  }));
}

export default async function LiteracyNumeracyPage({
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
    learnerResult,
    enrollmentResult,
    recordResult,
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
      .select("id,school_year_id,grade_level_id,name,adviser_id")
      .order("name", { ascending: true }),
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
      .from("literacy_numeracy_records")
      .select(
        "id,enrollment_id,school_year_id,literacy_rating,numeracy_rating,remarks,encoded_at",
      ),
  ]);

  const firstError =
    schoolYearResult.error ??
    gradeLevelResult.error ??
    sectionResult.error ??
    learnerResult.error ??
    enrollmentResult.error ??
    recordResult.error;

  if (firstError) {
    throw new Error(firstError.message);
  }

  const schoolYears = (schoolYearResult.data ?? []) as SchoolYear[];
  const gradeLevels = (gradeLevelResult.data ?? []) as GradeLevel[];
  const sections = (sectionResult.data ?? []) as Section[];
  const learners = (learnerResult.data ?? []) as Learner[];
  const enrollments = (enrollmentResult.data ?? []) as LearnerEnrollment[];
  const records = (recordResult.data ?? []) as LiteracyNumeracyRecord[];

  const gradeById = new Map(gradeLevels.map((grade) => [grade.id, grade]));
  const yearById = new Map(schoolYears.map((year) => [year.id, year]));
  const learnerById = new Map(learners.map((learner) => [learner.id, learner]));
  const manageableSections = sections.filter(
    (section) => section.adviser_id === profile.userId,
  );
  const requestedSectionId = firstSearchValue(params.sectionId);
  const selectedSection =
    manageableSections.find((section) => section.id === requestedSectionId) ??
    manageableSections[0];
  const selectedEnrollments = selectedSection
    ? enrollments.filter(
        (enrollment) =>
          enrollment.section_id === selectedSection.id &&
          enrollment.school_year_id === selectedSection.school_year_id &&
          enrollment.enrollment_status === "enrolled",
      )
    : [];
  const selectedRecords = selectedSection
    ? records.filter(
        (record) => record.school_year_id === selectedSection.school_year_id,
      )
    : [];
  const recordsByEnrollment = new Map(
    selectedRecords.map((record) => [record.enrollment_id, record]),
  );
  const encodedCount = selectedEnrollments.filter((enrollment) =>
    recordsByEnrollment.has(enrollment.id),
  ).length;
  const lowRows = selectedEnrollments
    .map((enrollment) => {
      const record = recordsByEnrollment.get(enrollment.id);
      return {
        enrollment,
        record,
        learner: learnerById.get(enrollment.learner_id),
      };
    })
    .filter(
      (row) =>
        row.record &&
        (row.record.literacy_rating === "beginning" ||
          row.record.literacy_rating === "developing" ||
          row.record.numeracy_rating === "beginning" ||
          row.record.numeracy_rating === "developing"),
    );
  const selectedSectionName = selectedSection
    ? `${gradeLabel(gradeById, selectedSection.grade_level_id)} ${selectedSection.name}`
    : "No advisory section";
  const literacyCounts = ratingCounts(
    selectedEnrollments
      .map((enrollment) => recordsByEnrollment.get(enrollment.id))
      .filter((record): record is LiteracyNumeracyRecord => Boolean(record)),
    "literacy",
  );
  const numeracyCounts = ratingCounts(
    selectedEnrollments
      .map((enrollment) => recordsByEnrollment.get(enrollment.id))
      .filter((record): record is LiteracyNumeracyRecord => Boolean(record)),
    "numeracy",
  );

  return (
    <div className="space-y-6">
      <div>
        <p className="text-xs font-bold uppercase text-skybrand-600">
          Phase 10
        </p>
        <h1 className="mt-3 font-display text-3xl font-extrabold text-navy-950">
          Literacy and numeracy
        </h1>
        <details className="mt-3 max-w-3xl text-sm leading-7 text-slate-600">
          <summary className="cursor-pointer text-sm font-bold text-navy-950">
            More
          </summary>
          Encode class literacy and numeracy levels, then surface learners who
          may need focused follow-up.
        </details>
      </div>

      <MetricStrip
        items={[
          { label: "Advisory sections", value: manageableSections.length },
          { label: "Learners", value: selectedEnrollments.length },
          { label: "Encoded", value: encodedCount },
          { label: "Watchlist", value: lowRows.length },
        ]}
      />

      {manageableSections.length ? (
        <>
          <section className="rounded-lg border border-slate-200 bg-white p-4 shadow-soft">
            <div className="flex flex-col gap-4 xl:flex-row xl:items-end xl:justify-between">
              <div className="flex items-start gap-3">
                <span className="grid size-12 place-items-center rounded-lg bg-skybrand-50 text-skybrand-600">
                  <BookOpenCheck size={24} />
                </span>
                <div>
                  <h2 className="font-display text-xl font-extrabold text-navy-950">
                    Class encoding sheet
                  </h2>
                  <p className="mt-1 text-sm text-slate-500">
                    {selectedSectionName}
                    {selectedSection
                      ? ` - ${yearById.get(selectedSection.school_year_id)?.name ?? "School year"}`
                      : ""}
                  </p>
                </div>
              </div>

              <form className="grid gap-3 sm:grid-cols-[minmax(14rem,1fr)_auto]">
                <label>
                  <span className="label">Section</span>
                  <select
                    className="input"
                    defaultValue={selectedSection?.id}
                    name="sectionId"
                  >
                    {manageableSections.map((section) => (
                      <option key={section.id} value={section.id}>
                        {yearById.get(section.school_year_id)?.name ??
                          "School year"}{" "}
                        - {gradeLabel(gradeById, section.grade_level_id)}{" "}
                        {section.name}
                      </option>
                    ))}
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

            {selectedSection && selectedEnrollments.length ? (
              <form
                action={saveLiteracyNumeracySheetAction}
                className="mt-6 overflow-x-auto rounded-lg border border-slate-200"
              >
                <input
                  name="sectionId"
                  type="hidden"
                  value={selectedSection.id}
                />
                <input
                  name="schoolYearId"
                  type="hidden"
                  value={selectedSection.school_year_id}
                />
                <table className="min-w-[920px] text-left text-sm">
                  <thead className="bg-slate-50 text-xs font-bold uppercase text-slate-500">
                    <tr>
                      <th className="px-4 py-3">Learner</th>
                      <th className="px-4 py-3">Literacy</th>
                      <th className="px-4 py-3">Numeracy</th>
                      <th className="px-4 py-3">Remarks</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {selectedEnrollments.map((enrollment) => {
                      const learner = learnerById.get(enrollment.learner_id);
                      const record = recordsByEnrollment.get(enrollment.id);

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
                            <select
                              className="input min-w-36"
                              defaultValue={
                                record?.literacy_rating ?? "developing"
                              }
                              name={`literacyRating-${enrollment.id}`}
                            >
                              {ratingLevels.map((rating) => (
                                <option key={rating} value={rating}>
                                  {ratingLabel(rating)}
                                </option>
                              ))}
                            </select>
                          </td>
                          <td className="px-4 py-4">
                            <select
                              className="input min-w-36"
                              defaultValue={
                                record?.numeracy_rating ?? "developing"
                              }
                              name={`numeracyRating-${enrollment.id}`}
                            >
                              {ratingLevels.map((rating) => (
                                <option key={rating} value={rating}>
                                  {ratingLabel(rating)}
                                </option>
                              ))}
                            </select>
                          </td>
                          <td className="px-4 py-4">
                            <input
                              className="input min-w-72"
                              defaultValue={record?.remarks ?? ""}
                              name={`remarks-${enrollment.id}`}
                            />
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
                <div className="border-t border-slate-200 bg-white p-4">
                  <SubmitButton pendingLabel="Saving ratings...">
                    <Save size={17} />
                    Save ratings
                  </SubmitButton>
                </div>
              </form>
            ) : (
              <div className="mt-6">
                <EmptyState
                  message="Enroll learners into this advisory section before encoding ratings."
                  title="No learners in section"
                />
              </div>
            )}
          </section>

          <div className="grid gap-6 xl:grid-cols-[0.9fr_1.1fr]">
            <section className="rounded-lg border border-slate-200 bg-white p-4 shadow-soft">
              <div className="flex items-start gap-3">
                <span className="grid size-12 place-items-center rounded-lg bg-skybrand-50 text-skybrand-600">
                  <Brain size={24} />
                </span>
                <div>
                  <h2 className="font-display text-xl font-extrabold text-navy-950">
                    Class distribution
                  </h2>
                </div>
              </div>

              <div className="mt-6 grid gap-4 sm:grid-cols-2">
                {[
                  ["Literacy", literacyCounts],
                  ["Numeracy", numeracyCounts],
                ].map(([label, rows]) => (
                  <div
                    className="rounded-lg border border-slate-200 bg-slate-50 p-4"
                    key={label as string}
                  >
                    <p className="text-sm font-bold text-navy-950">
                      {label as string}
                    </p>
                    <div className="mt-4 grid gap-2">
                      {(rows as typeof literacyCounts).map((row) => (
                        <div
                          className="flex items-center justify-between gap-3 text-sm"
                          key={row.rating}
                        >
                          <span
                            className={`rounded-full px-3 py-1 text-xs font-bold ${ratingTone(row.rating)}`}
                          >
                            {ratingLabel(row.rating)}
                          </span>
                          <span className="font-bold text-navy-950">
                            {row.count}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </section>

            <section className="rounded-lg border border-slate-200 bg-white p-4 shadow-soft">
              <div className="flex items-start gap-3">
                <span className="grid size-12 place-items-center rounded-lg bg-skybrand-50 text-skybrand-600">
                  <AlertTriangle size={24} />
                </span>
                <div>
                  <h2 className="font-display text-xl font-extrabold text-navy-950">
                    Focus list
                  </h2>
                </div>
              </div>

              {lowRows.length ? (
                <div className="mt-6 grid gap-3 md:grid-cols-2">
                  {lowRows.slice(0, 8).map((row) => (
                    <article
                      className="rounded-lg border border-amber-200 bg-amber-50 p-4"
                      key={row.enrollment.id}
                    >
                      <p className="font-display text-lg font-extrabold text-navy-950">
                        {row.learner ? learnerName(row.learner) : "Learner"}
                      </p>
                      {row.record ? (
                        <div className="mt-4 flex flex-wrap gap-2">
                          <span
                            className={`rounded-full px-3 py-1 text-xs font-bold ${ratingTone(row.record.literacy_rating)}`}
                          >
                            Literacy: {ratingLabel(row.record.literacy_rating)}
                          </span>
                          <span
                            className={`rounded-full px-3 py-1 text-xs font-bold ${ratingTone(row.record.numeracy_rating)}`}
                          >
                            Numeracy: {ratingLabel(row.record.numeracy_rating)}
                          </span>
                        </div>
                      ) : null}
                    </article>
                  ))}
                </div>
              ) : (
                <div className="mt-6">
                  <EmptyState
                    message="No encoded beginning or developing ratings in this section."
                    title="No focus records"
                  />
                </div>
              )}
            </section>
          </div>
        </>
      ) : (
        <EmptyState
          message="Literacy and numeracy encoding is available to section advisers. Ask the admin to assign you as adviser for a section."
          title="No advisory sections"
        />
      )}
    </div>
  );
}
