import { Download, FileText, History, Printer } from "lucide-react";

import { EmptyState } from "@/components/ui/empty-state";
import { createSupabaseServerClient } from "@/lib/supabase/server";

export const metadata = {
  title: "Reports",
};

type SchoolYear = {
  id: string;
  name: string;
  status: "draft" | "active" | "closed";
};

type Section = {
  id: string;
  school_year_id: string;
  name: string;
};

type Learner = {
  id: string;
  lrn: string;
  first_name: string;
  middle_name: string | null;
  last_name: string;
  extension_name: string | null;
};

type LearnerEnrollment = {
  id: string;
  learner_id: string;
  school_year_id: string;
  section_id: string | null;
};

type ReportExport = {
  id: string;
  report_type: string;
  exported_at: string;
};

const reportOptions = [
  ["attendance", "Attendance"],
  ["grades", "Grades"],
  ["literacy_numeracy", "Literacy and numeracy"],
  ["interventions", "Interventions"],
  ["learner_profile", "Learner profile"],
  ["school_summary", "Class summary"],
] as const;

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

function reportLabel(value: string) {
  return (
    reportOptions.find(([type]) => type === value)?.[1] ??
    value.replaceAll("_", " ")
  );
}

export default async function TeacherReportsPage() {
  const supabase = await createSupabaseServerClient();
  const [
    yearResult,
    sectionResult,
    learnerResult,
    enrollmentResult,
    exportResult,
  ] = await Promise.all([
    supabase
      .from("school_years")
      .select("id,name,status")
      .order("starts_on", { ascending: false }),
    supabase
      .from("sections")
      .select("id,school_year_id,name")
      .order("name", { ascending: true }),
    supabase
      .from("learners")
      .select("id,lrn,first_name,middle_name,last_name,extension_name")
      .order("last_name", { ascending: true }),
    supabase
      .from("learner_enrollments")
      .select("id,learner_id,school_year_id,section_id"),
    supabase
      .from("report_exports")
      .select("id,report_type,exported_at")
      .order("exported_at", { ascending: false })
      .limit(12),
  ]);

  const firstError =
    yearResult.error ??
    sectionResult.error ??
    learnerResult.error ??
    enrollmentResult.error ??
    exportResult.error;

  if (firstError) {
    throw new Error(firstError.message);
  }

  const years = (yearResult.data ?? []) as SchoolYear[];
  const sections = (sectionResult.data ?? []) as Section[];
  const learners = (learnerResult.data ?? []) as Learner[];
  const enrollments = (enrollmentResult.data ?? []) as LearnerEnrollment[];
  const exports = (exportResult.data ?? []) as ReportExport[];
  const visibleYearIds = new Set(
    enrollments.map((enrollment) => enrollment.school_year_id),
  );
  const visibleSectionIds = new Set(
    enrollments
      .map((enrollment) => enrollment.section_id)
      .filter((sectionId): sectionId is string => Boolean(sectionId)),
  );
  const visibleYears = years.filter((year) => visibleYearIds.has(year.id));
  const visibleSections = sections.filter((section) =>
    visibleSectionIds.has(section.id),
  );
  const yearById = new Map(years.map((year) => [year.id, year]));

  return (
    <div className="space-y-8">
      <div>
        <p className="text-xs font-bold uppercase text-skybrand-600">
          Phase 16
        </p>
        <h1 className="mt-3 font-display text-3xl font-extrabold text-navy-950">
          Class reports
        </h1>
        <p className="mt-3 max-w-3xl text-sm leading-7 text-slate-600">
          Export PDF reports for attendance, grades, literacy, interventions,
          learner profiles, and class summaries within your visible records.
        </p>
      </div>

      <div className="grid gap-3 sm:grid-cols-3">
        {[
          ["Visible learners", learners.length],
          ["Visible sections", visibleSections.length],
          ["Recent exports", exports.length],
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
            <Printer size={24} />
          </span>
          <div>
            <h2 className="font-display text-xl font-extrabold text-navy-950">
              Export report
            </h2>
            <p className="mt-1 text-sm text-slate-500">
              Exports are limited by the learner and section records visible to
              your account.
            </p>
          </div>
        </div>

        <form
          action="/api/reports/export"
          className="mt-6 grid gap-4"
          method="get"
        >
          <div className="grid gap-4 lg:grid-cols-4">
            <label>
              <span className="label">Report type</span>
              <select className="input" name="reportType" required>
                {reportOptions.map(([value, label]) => (
                  <option key={value} value={value}>
                    {label}
                  </option>
                ))}
              </select>
            </label>
            <label>
              <span className="label">School year</span>
              <select className="input" name="schoolYearId">
                <option value="">All visible</option>
                {(visibleYears.length ? visibleYears : years).map((year) => (
                  <option key={year.id} value={year.id}>
                    {year.name} ({year.status})
                  </option>
                ))}
              </select>
            </label>
            <label>
              <span className="label">Section</span>
              <select className="input" name="sectionId">
                <option value="">All visible</option>
                {visibleSections.map((section) => (
                  <option key={section.id} value={section.id}>
                    {yearById.get(section.school_year_id)?.name ?? "Year"} -{" "}
                    {section.name}
                  </option>
                ))}
              </select>
            </label>
            <label>
              <span className="label">Learner</span>
              <select className="input" name="learnerId">
                <option value="">All visible</option>
                {learners.map((learner) => (
                  <option key={learner.id} value={learner.id}>
                    {learnerName(learner)} - {learner.lrn}
                  </option>
                ))}
              </select>
            </label>
          </div>
          <button
            className="inline-flex min-h-10 w-fit items-center justify-center gap-2 rounded-xl bg-navy-900 px-4 py-2 text-sm font-bold text-white transition hover:bg-skybrand-600"
            type="submit"
          >
            <Download size={17} />
            Export PDF
          </button>
        </form>
      </section>

      <section className="rounded-[1.5rem] border border-slate-200 bg-white p-6 shadow-soft">
        <div className="flex items-start gap-3">
          <span className="grid size-12 place-items-center rounded-2xl bg-skybrand-50 text-skybrand-600">
            <History size={24} />
          </span>
          <div>
            <h2 className="font-display text-xl font-extrabold text-navy-950">
              Export history
            </h2>
            <p className="mt-1 text-sm text-slate-500">
              Recent exports from your account are listed here.
            </p>
          </div>
        </div>

        {exports.length ? (
          <div className="mt-6 grid gap-3">
            {exports.map((item) => (
              <article
                className="flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-slate-200 bg-slate-50 p-4"
                key={item.id}
              >
                <div className="flex items-center gap-3">
                  <span className="grid size-10 place-items-center rounded-2xl bg-white text-skybrand-600">
                    <FileText size={20} />
                  </span>
                  <div>
                    <p className="font-semibold text-navy-950">
                      {reportLabel(item.report_type)}
                    </p>
                    <p className="text-sm text-slate-500">
                      {formatDateTime(item.exported_at)}
                    </p>
                  </div>
                </div>
              </article>
            ))}
          </div>
        ) : (
          <div className="mt-6">
            <EmptyState
              message="Report exports will appear here after your first PDF is generated."
              title="No report exports"
            />
          </div>
        )}
      </section>
    </div>
  );
}
