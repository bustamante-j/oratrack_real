import {
  AlertTriangle,
  CalendarPlus,
  CheckCircle2,
  Clock3,
  ListChecks,
  Save,
  UsersRound,
} from "lucide-react";

import { EmptyState } from "@/components/ui/empty-state";
import { SubmitButton } from "@/components/ui/submit-button";
import { calculateAttendanceTotals } from "@/lib/attendance/calculations";
import { requireAuthenticatedProfile } from "@/lib/auth/session";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { attendanceStatuses, type AttendanceStatus } from "@/types/domain";

import {
  createAttendanceDateAction,
  saveAttendanceSheetAction,
} from "./actions";

export const metadata = {
  title: "Attendance",
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

type AttendanceDate = {
  id: string;
  school_year_id: string;
  section_id: string;
  attendance_on: string;
  created_at: string;
};

type AttendanceRecord = {
  id: string;
  attendance_date_id: string;
  enrollment_id: string;
  am_status: AttendanceStatus;
  pm_status: AttendanceStatus;
  remarks: string | null;
};

function firstSearchValue(value: string | string[] | undefined) {
  return Array.isArray(value) ? value[0] : value;
}

function todayDateValue() {
  return new Date().toISOString().slice(0, 10);
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

function formatDate(value: string) {
  return new Intl.DateTimeFormat("en", {
    month: "short",
    day: "numeric",
    year: "numeric",
  }).format(new Date(`${value}T00:00:00`));
}

function statusLabel(status: AttendanceStatus) {
  if (status === "half_day") return "Half day";
  return status[0].toUpperCase() + status.slice(1);
}

function gradeLabel(gradeById: Map<number, GradeLevel>, gradeId: number) {
  return gradeById.get(gradeId)?.label ?? "Grade";
}

export default async function AttendancePage({
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
    attendanceDateResult,
    attendanceRecordResult,
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
      .from("attendance_dates")
      .select("id,school_year_id,section_id,attendance_on,created_at")
      .order("attendance_on", { ascending: false }),
    supabase
      .from("attendance_records")
      .select(
        "id,attendance_date_id,enrollment_id,am_status,pm_status,remarks",
      ),
  ]);

  const firstError =
    schoolYearResult.error ??
    gradeLevelResult.error ??
    sectionResult.error ??
    learnerResult.error ??
    enrollmentResult.error ??
    attendanceDateResult.error ??
    attendanceRecordResult.error;

  if (firstError) {
    throw new Error(firstError.message);
  }

  const schoolYears = (schoolYearResult.data ?? []) as SchoolYear[];
  const gradeLevels = (gradeLevelResult.data ?? []) as GradeLevel[];
  const sections = (sectionResult.data ?? []) as Section[];
  const learners = (learnerResult.data ?? []) as Learner[];
  const enrollments = (enrollmentResult.data ?? []) as LearnerEnrollment[];
  const attendanceDates = (attendanceDateResult.data ?? []) as AttendanceDate[];
  const attendanceRecords = (attendanceRecordResult.data ??
    []) as AttendanceRecord[];

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
  const sectionAttendanceDates = selectedSection
    ? attendanceDates.filter((date) => date.section_id === selectedSection.id)
    : [];
  const requestedDateId = firstSearchValue(params.dateId);
  const selectedAttendanceDate =
    sectionAttendanceDates.find((date) => date.id === requestedDateId) ??
    sectionAttendanceDates[0];
  const selectedSectionEnrollments = selectedSection
    ? enrollments.filter(
        (enrollment) =>
          enrollment.section_id === selectedSection.id &&
          enrollment.enrollment_status === "enrolled",
      )
    : [];
  const selectedDateRecords = selectedAttendanceDate
    ? attendanceRecords.filter(
        (record) => record.attendance_date_id === selectedAttendanceDate.id,
      )
    : [];
  const recordsByEnrollment = new Map(
    selectedDateRecords.map((record) => [record.enrollment_id, record]),
  );
  const selectedTotals = calculateAttendanceTotals(
    selectedDateRecords.map((record) => ({
      amStatus: record.am_status,
      pmStatus: record.pm_status,
    })),
  );
  const allRecordsByEnrollment = attendanceRecords.reduce((map, record) => {
    const current = map.get(record.enrollment_id) ?? [];
    current.push(record);
    map.set(record.enrollment_id, current);
    return map;
  }, new Map<string, AttendanceRecord[]>());
  const riskRows = selectedSectionEnrollments
    .map((enrollment) => {
      const learner = learnerById.get(enrollment.learner_id);
      const records = allRecordsByEnrollment.get(enrollment.id) ?? [];
      const totals = calculateAttendanceTotals(
        records.map((record) => ({
          amStatus: record.am_status,
          pmStatus: record.pm_status,
        })),
      );

      return { enrollment, learner, totals, recordCount: records.length };
    })
    .filter((row) => row.totals.isAbsenteeismRisk || row.totals.lateCount >= 3)
    .slice(0, 6);
  const selectedSectionName = selectedSection
    ? `${gradeLabel(gradeById, selectedSection.grade_level_id)} ${selectedSection.name}`
    : "No advisory section";
  const attendanceRate = Math.round(selectedTotals.attendancePercentage * 100);

  return (
    <div className="space-y-8">
      <div>
        <p className="text-xs font-bold uppercase text-skybrand-600">Phase 8</p>
        <h1 className="mt-3 font-display text-3xl font-extrabold text-navy-950">
          Attendance
        </h1>
        <p className="mt-3 max-w-3xl text-sm leading-7 text-slate-600">
          Create daily section attendance dates, encode AM/PM status, and watch
          tardy and absenteeism indicators for your advisory class.
        </p>
      </div>

      <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
        {[
          ["Advisory sections", manageableSections.length],
          ["Attendance dates", attendanceDates.length],
          ["Selected records", selectedDateRecords.length],
          ["Attendance rate", `${attendanceRate}%`],
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

      {manageableSections.length ? (
        <>
          <div className="grid gap-6 xl:grid-cols-[1.05fr_0.95fr]">
            <section className="rounded-[1.5rem] border border-slate-200 bg-white p-6 shadow-soft">
              <div className="flex items-start gap-3">
                <span className="grid size-12 place-items-center rounded-2xl bg-skybrand-50 text-skybrand-600">
                  <ListChecks size={24} />
                </span>
                <div>
                  <h2 className="font-display text-xl font-extrabold text-navy-950">
                    Attendance sheet
                  </h2>
                  <p className="mt-1 text-sm text-slate-500">
                    {selectedAttendanceDate
                      ? `${selectedSectionName} - ${formatDate(selectedAttendanceDate.attendance_on)}`
                      : `${selectedSectionName} has no attendance date selected.`}
                  </p>
                </div>
              </div>

              <form className="mt-6 grid gap-4 sm:grid-cols-[1fr_1fr_auto]">
                <label>
                  <span className="label">Section</span>
                  <select
                    className="input"
                    defaultValue={selectedSection?.id}
                    name="sectionId"
                  >
                    {manageableSections.map((section) => (
                      <option key={section.id} value={section.id}>
                        {gradeLabel(gradeById, section.grade_level_id)}{" "}
                        {section.name}
                      </option>
                    ))}
                  </select>
                </label>
                <label>
                  <span className="label">Attendance date</span>
                  <select
                    className="input"
                    defaultValue={selectedAttendanceDate?.id ?? ""}
                    name="dateId"
                  >
                    {sectionAttendanceDates.length ? (
                      sectionAttendanceDates.map((date) => (
                        <option key={date.id} value={date.id}>
                          {formatDate(date.attendance_on)}
                        </option>
                      ))
                    ) : (
                      <option value="">No dates yet</option>
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

              {selectedAttendanceDate && selectedSectionEnrollments.length ? (
                <form
                  action={saveAttendanceSheetAction}
                  className="mt-6 overflow-x-auto rounded-2xl border border-slate-200"
                >
                  <input
                    name="attendanceDateId"
                    type="hidden"
                    value={selectedAttendanceDate.id}
                  />
                  <input
                    name="sectionId"
                    type="hidden"
                    value={selectedSection?.id}
                  />
                  <table className="min-w-[900px] text-left text-sm">
                    <thead className="bg-slate-50 text-xs font-bold uppercase text-slate-500">
                      <tr>
                        <th className="px-4 py-3">Learner</th>
                        <th className="px-4 py-3">AM</th>
                        <th className="px-4 py-3">PM</th>
                        <th className="px-4 py-3">Remarks</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                      {selectedSectionEnrollments.map((enrollment) => {
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
                                className="input min-w-32"
                                defaultValue={record?.am_status ?? "present"}
                                name={`amStatus-${enrollment.id}`}
                              >
                                {attendanceStatuses.map((status) => (
                                  <option key={status} value={status}>
                                    {statusLabel(status)}
                                  </option>
                                ))}
                              </select>
                            </td>
                            <td className="px-4 py-4">
                              <select
                                className="input min-w-32"
                                defaultValue={record?.pm_status ?? "present"}
                                name={`pmStatus-${enrollment.id}`}
                              >
                                {attendanceStatuses.map((status) => (
                                  <option key={status} value={status}>
                                    {statusLabel(status)}
                                  </option>
                                ))}
                              </select>
                            </td>
                            <td className="px-4 py-4">
                              <input
                                className="input min-w-60"
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
                    <SubmitButton pendingLabel="Saving attendance...">
                      <Save size={17} />
                      Save attendance
                    </SubmitButton>
                  </div>
                </form>
              ) : (
                <div className="mt-6">
                  <EmptyState
                    message={
                      selectedAttendanceDate
                        ? "Enroll learners into this advisory section before encoding attendance."
                        : "Create an attendance date before encoding records."
                    }
                    title={
                      selectedAttendanceDate
                        ? "No learners in section"
                        : "No attendance date selected"
                    }
                  />
                </div>
              )}
            </section>

            <section className="rounded-[1.5rem] border border-slate-200 bg-white p-6 shadow-soft">
              <div className="flex items-start gap-3">
                <span className="grid size-12 place-items-center rounded-2xl bg-skybrand-50 text-skybrand-600">
                  <CalendarPlus size={24} />
                </span>
                <div>
                  <h2 className="font-display text-xl font-extrabold text-navy-950">
                    Create date
                  </h2>
                  <p className="mt-1 text-sm text-slate-500">
                    One attendance sheet is created per section per day.
                  </p>
                </div>
              </div>

              <form
                action={createAttendanceDateAction}
                className="mt-6 grid gap-4"
              >
                <label>
                  <span className="label">Section</span>
                  <select
                    className="input"
                    defaultValue={selectedSection?.id}
                    name="sectionId"
                    required
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
                <label>
                  <span className="label">School year</span>
                  <select
                    className="input"
                    defaultValue={selectedSection?.school_year_id}
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
                  <span className="label">Attendance date</span>
                  <input
                    className="input"
                    defaultValue={todayDateValue()}
                    name="attendanceOn"
                    required
                    type="date"
                  />
                </label>
                <SubmitButton>Create attendance date</SubmitButton>
              </form>

              <div className="mt-6 grid gap-3 sm:grid-cols-2">
                {[
                  ["Present days", selectedTotals.presentDays],
                  ["Absent days", selectedTotals.absentDays],
                  ["Late marks", selectedTotals.lateCount],
                  ["Excused days", selectedTotals.excusedDays],
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

          <section className="rounded-[1.5rem] border border-slate-200 bg-white p-6 shadow-soft">
            <div className="flex items-start gap-3">
              <span className="grid size-12 place-items-center rounded-2xl bg-skybrand-50 text-skybrand-600">
                <AlertTriangle size={24} />
              </span>
              <div>
                <h2 className="font-display text-xl font-extrabold text-navy-950">
                  Attendance watchlist
                </h2>
                <p className="mt-1 text-sm text-slate-500">
                  Learners appear here when absence or tardy patterns need
                  attention.
                </p>
              </div>
            </div>

            {riskRows.length ? (
              <div className="mt-6 grid gap-3 md:grid-cols-2 xl:grid-cols-3">
                {riskRows.map((row) => (
                  <article
                    className="rounded-[1.25rem] border border-amber-200 bg-amber-50 p-5"
                    key={row.enrollment.id}
                  >
                    <p className="font-display text-lg font-extrabold text-navy-950">
                      {row.learner ? learnerName(row.learner) : "Learner"}
                    </p>
                    <div className="mt-4 grid gap-2 text-sm text-slate-700">
                      <p className="flex items-center gap-2">
                        <Clock3 size={16} />
                        {row.totals.lateCount} late marks
                      </p>
                      <p className="flex items-center gap-2">
                        <UsersRound size={16} />
                        {row.totals.absentDays} absence days
                      </p>
                      <p className="flex items-center gap-2">
                        <CheckCircle2 size={16} />
                        {Math.round(row.totals.attendancePercentage * 100)}%
                        attendance across {row.recordCount} dates
                      </p>
                    </div>
                  </article>
                ))}
              </div>
            ) : (
              <div className="mt-6">
                <EmptyState
                  message="No learners are currently flagged by the attendance thresholds."
                  title="No attendance risks"
                />
              </div>
            )}
          </section>
        </>
      ) : (
        <EmptyState
          message="Attendance encoding is available to section advisers. Ask the admin to assign you as adviser for a section."
          title="No advisory sections"
        />
      )}
    </div>
  );
}
