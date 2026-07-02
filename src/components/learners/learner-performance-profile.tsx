import Link from "next/link";
import {
  ArrowLeft,
  Award,
  BookOpenCheck,
  CalendarCheck2,
  GraduationCap,
  Shield,
} from "lucide-react";

import type { LearnerPerformanceData } from "@/lib/learners/performance";

function learnerName(learner: LearnerPerformanceData["learner"]) {
  return [
    learner.first_name,
    learner.middle_name,
    learner.last_name,
    learner.extension_name,
  ]
    .filter(Boolean)
    .join(" ");
}

function attendanceValue(status: string) {
  if (status === "absent") return 0;
  if (status === "half_day") return 0.5;
  return 1;
}

function average(values: number[]) {
  if (!values.length) return null;
  return values.reduce((sum, value) => sum + value, 0) / values.length;
}

function formatDate(value: string) {
  return new Intl.DateTimeFormat("en-PH", {
    month: "short",
    day: "numeric",
    year: "numeric",
    timeZone: "Asia/Manila",
  }).format(new Date(`${value}T00:00:00`));
}

function percent(value: number | null) {
  if (value === null) return "No data";
  return `${value.toFixed(1)}%`;
}

export function LearnerPerformanceProfile({
  data,
  backHref,
}: {
  data: LearnerPerformanceData;
  backHref: string;
}) {
  const yearById = new Map(data.schoolYears.map((year) => [year.id, year]));
  const gradeById = new Map(data.gradeLevels.map((grade) => [grade.id, grade]));
  const sectionById = new Map(
    data.sections.map((section) => [section.id, section]),
  );
  const dateById = new Map(data.attendanceDates.map((date) => [date.id, date]));
  const subjectById = new Map(
    data.subjects.map((subject) => [subject.id, subject]),
  );
  const periodById = new Map(data.periods.map((period) => [period.id, period]));
  const templateById = new Map(
    data.certificateTemplates.map((template) => [template.id, template]),
  );
  const earnedAttendance = data.attendance.reduce(
    (sum, record) =>
      sum +
      attendanceValue(record.am_status) +
      attendanceValue(record.pm_status),
    0,
  );
  const attendanceRate = data.attendance.length
    ? (earnedAttendance / (data.attendance.length * 2)) * 100
    : null;
  const gradeAverage = average(
    data.grades.map((grade) => Number(grade.numeric_grade)),
  );
  const primaryGuardian =
    data.guardians.find((guardian) => guardian.is_primary) ?? data.guardians[0];

  return (
    <div className="space-y-4">
      <Link
        className="inline-flex items-center gap-2 text-sm font-bold text-skybrand-600 hover:text-navy-900"
        href={backHref}
      >
        <ArrowLeft size={16} />
        Back to learners
      </Link>

      <section className="rounded-[1.75rem] border border-slate-200 bg-white p-4 shadow-soft">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
          <div>
            <p className="text-xs font-bold uppercase text-skybrand-600">
              Learner profile
            </p>
            <h1 className="mt-3 font-display text-3xl font-extrabold text-navy-950">
              {learnerName(data.learner)}
            </h1>
            <p className="mt-2 text-sm font-semibold text-slate-500">
              LRN {data.learner.lrn} - {data.learner.sex} - Born{" "}
              {data.learner.birth_date}
            </p>
            <details className="mt-3 max-w-3xl">
              <summary className="cursor-pointer text-xs font-bold uppercase text-slate-400 transition hover:text-navy-900">
                More
              </summary>
              <p className="mt-2 text-sm leading-7 text-slate-600">
                {data.learner.address || "No address recorded."}
              </p>
            </details>
          </div>
          <div className="rounded-2xl bg-skybrand-50 p-5">
            <p className="text-xs font-bold uppercase text-skybrand-700">
              Primary guardian
            </p>
            <p className="mt-2 font-display text-lg font-extrabold text-navy-950">
              {primaryGuardian
                ? `${primaryGuardian.full_name} (${primaryGuardian.relationship})`
                : "Unassigned"}
            </p>
            <p className="mt-1 text-sm text-slate-600">
              {primaryGuardian?.phone || primaryGuardian?.email || ""}
            </p>
          </div>
        </div>
      </section>

      <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
        {[
          {
            label: "Attendance rate",
            value: percent(attendanceRate),
            icon: CalendarCheck2,
          },
          {
            label: "Grade average",
            value: gradeAverage === null ? "No data" : gradeAverage.toFixed(2),
            icon: BookOpenCheck,
          },
          {
            label: "Enrollments",
            value: data.enrollments.length,
            icon: GraduationCap,
          },
          {
            label: "Awards",
            value: data.awards.length,
            icon: Award,
          },
        ].map(({ label, value, icon: Icon }) => (
          <section
            className="rounded-[1.5rem] border border-slate-200 bg-white p-5 shadow-soft"
            key={label}
          >
            <div className="flex items-center justify-between gap-3">
              <p className="text-3xl font-extrabold text-navy-950">{value}</p>
              <span className="grid size-10 place-items-center rounded-2xl bg-skybrand-50 text-skybrand-600">
                <Icon size={21} />
              </span>
            </div>
            <p className="mt-1 text-xs font-bold uppercase text-slate-500">
              {label}
            </p>
          </section>
        ))}
      </div>

      <section className="rounded-[1.5rem] border border-slate-200 bg-white p-4 shadow-soft">
        <h2 className="font-display text-xl font-extrabold text-navy-950">
          Awards
        </h2>
        {data.awards.length ? (
          <div className="mt-4 grid gap-3">
            {data.awards.map((award) => (
              <article
                className="flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-slate-200 bg-slate-50 p-4"
                key={award.id}
              >
                <div>
                  <p className="font-semibold capitalize text-navy-950">
                    {award.certificate_type}
                  </p>
                  <p className="mt-1 text-sm text-slate-500">
                    {award.certificate_template_id
                      ? (templateById.get(award.certificate_template_id)
                          ?.name ?? "Certificate template")
                      : "Temporary clean template"}
                  </p>
                </div>
                <span className="rounded-full bg-white px-3 py-1 text-xs font-bold text-slate-600">
                  {formatDate(award.generated_at.slice(0, 10))}
                </span>
              </article>
            ))}
          </div>
        ) : (
          <p className="mt-4 rounded-2xl bg-slate-50 p-4 text-sm text-slate-600">
            No awards recorded yet.
          </p>
        )}
      </section>

      <section className="rounded-[1.5rem] border border-slate-200 bg-white p-4 shadow-soft">
        <h2 className="font-display text-xl font-extrabold text-navy-950">
          Enrollment history
        </h2>
        <div className="mt-5 grid gap-3">
          {data.enrollments.map((enrollment) => (
            <article
              className="rounded-2xl border border-slate-200 bg-slate-50 p-4"
              key={enrollment.id}
            >
              <p className="font-semibold text-navy-950">
                {yearById.get(enrollment.school_year_id)?.name ?? "School year"}
              </p>
              <p className="mt-2 text-sm text-slate-600">
                {gradeById.get(enrollment.grade_level_id)?.label ?? "Grade"} -{" "}
                {enrollment.section_id
                  ? sectionById.get(enrollment.section_id)?.name
                  : "Unassigned section"}
              </p>
              <p className="mt-1 text-sm text-slate-500">
                {enrollment.enrollment_status} on {enrollment.enrolled_on}
              </p>
            </article>
          ))}
        </div>
      </section>

      <div className="grid gap-4">
        <section className="rounded-[1.5rem] border border-slate-200 bg-white p-4 shadow-soft">
          <h2 className="font-display text-xl font-extrabold text-navy-950">
            Individual attendance
          </h2>
          {data.attendance.length ? (
            <div className="mt-5 overflow-x-auto rounded-2xl border border-slate-200">
              <table className="min-w-[620px] text-left text-sm">
                <thead className="bg-slate-50 text-xs font-bold uppercase text-slate-500">
                  <tr>
                    <th className="px-4 py-3">Date</th>
                    <th className="px-4 py-3">AM</th>
                    <th className="px-4 py-3">PM</th>
                    <th className="px-4 py-3">Remarks</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {data.attendance.slice(0, 18).map((record) => (
                    <tr key={record.id}>
                      <td className="px-4 py-4 font-semibold text-navy-950">
                        {dateById.get(record.attendance_date_id)
                          ? formatDate(
                              dateById.get(record.attendance_date_id)!
                                .attendance_on,
                            )
                          : "Date"}
                      </td>
                      <td className="px-4 py-4 text-slate-600">
                        {record.am_status}
                      </td>
                      <td className="px-4 py-4 text-slate-600">
                        {record.pm_status}
                      </td>
                      <td className="px-4 py-4 text-slate-600">
                        {record.remarks || "-"}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <p className="mt-5 rounded-2xl bg-slate-50 p-4 text-sm text-slate-600">
              No attendance records are visible for this learner.
            </p>
          )}
        </section>

        <section className="rounded-[1.5rem] border border-slate-200 bg-white p-4 shadow-soft">
          <h2 className="font-display text-xl font-extrabold text-navy-950">
            Academic performance
          </h2>
          {data.grades.length ? (
            <div className="mt-5 overflow-x-auto rounded-2xl border border-slate-200">
              <table className="min-w-[680px] text-left text-sm">
                <thead className="bg-slate-50 text-xs font-bold uppercase text-slate-500">
                  <tr>
                    <th className="px-4 py-3">Subject</th>
                    <th className="px-4 py-3">Period</th>
                    <th className="px-4 py-3">Grade</th>
                    <th className="px-4 py-3">Remarks</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {data.grades.map((grade) => (
                    <tr key={grade.id}>
                      <td className="px-4 py-4 font-semibold text-navy-950">
                        {subjectById.get(grade.subject_id)?.name ?? "Subject"}
                      </td>
                      <td className="px-4 py-4 text-slate-600">
                        {periodById.get(grade.grade_period_id)?.name ??
                          "Period"}
                      </td>
                      <td className="px-4 py-4">
                        <span className="rounded-full bg-skybrand-50 px-3 py-1 text-xs font-bold text-navy-900">
                          {Number(grade.numeric_grade).toFixed(2)}
                        </span>
                      </td>
                      <td className="px-4 py-4 text-slate-600">
                        {grade.remarks || "-"}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <p className="mt-5 rounded-2xl bg-slate-50 p-4 text-sm text-slate-600">
              No grade records are visible for this learner.
            </p>
          )}
        </section>
      </div>

      <section className="rounded-[1.5rem] border border-slate-200 bg-white p-4 shadow-soft">
        <div className="flex items-start gap-3">
          <span className="grid size-12 place-items-center rounded-2xl bg-skybrand-50 text-skybrand-600">
            <Shield size={24} />
          </span>
          <div>
            <h2 className="font-display text-xl font-extrabold text-navy-950">
              Literacy and numeracy
            </h2>
            {data.literacy.length ? (
              <div className="mt-4 grid gap-3">
                {data.literacy.map((record) => (
                  <article
                    className="rounded-2xl border border-slate-200 bg-slate-50 p-4"
                    key={record.id}
                  >
                    <p className="text-sm font-semibold text-navy-950">
                      Literacy: {record.literacy_rating}
                    </p>
                    <p className="mt-1 text-sm font-semibold text-navy-950">
                      Numeracy: {record.numeracy_rating}
                    </p>
                    <p className="mt-2 text-sm leading-6 text-slate-600">
                      {record.remarks || "No remarks recorded."}
                    </p>
                  </article>
                ))}
              </div>
            ) : (
              <p className="mt-3 text-sm text-slate-600">
                No literacy or numeracy record is visible for this learner.
              </p>
            )}
          </div>
        </div>
      </section>
    </div>
  );
}
