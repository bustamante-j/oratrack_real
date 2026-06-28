import {
  Activity,
  BarChart3,
  BookOpenCheck,
  GraduationCap,
  ShieldAlert,
  TrendingUp,
} from "lucide-react";

import { EmptyState } from "@/components/ui/empty-state";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import type {
  AttendanceStatus,
  InterventionStatus,
  RatingLevel,
} from "@/types/domain";

export const metadata = {
  title: "Analytics",
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

type AttendanceDate = {
  id: string;
  school_year_id: string;
  section_id: string;
};

type AttendanceRecord = {
  id: string;
  attendance_date_id: string;
  enrollment_id: string;
  am_status: AttendanceStatus;
  pm_status: AttendanceStatus;
};

type GradeRecord = {
  id: string;
  enrollment_id: string;
  numeric_grade: number;
};

type LiteracyRecord = {
  id: string;
  enrollment_id: string;
  literacy_rating: RatingLevel;
  numeracy_rating: RatingLevel;
};

type Intervention = {
  id: string;
  learner_id: string;
  enrollment_id: string | null;
  status: InterventionStatus;
  follow_up_on: string | null;
};

type GeneratedCertificate = {
  id: string;
  enrollment_id: string;
};

type LessonPlan = {
  id: string;
  status: string;
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

function attendanceValue(status: AttendanceStatus) {
  if (status === "absent") return 0;
  if (status === "half_day") return 0.5;

  return 1;
}

function average(values: number[]) {
  if (!values.length) return null;

  return values.reduce((sum, value) => sum + value, 0) / values.length;
}

function percent(value: number | null) {
  if (value === null || Number.isNaN(value)) return "No data";

  return `${value.toFixed(1)}%`;
}

function numberValue(value: number | null) {
  if (value === null || Number.isNaN(value)) return "No data";

  return value.toFixed(1);
}

function barWidth(value: number | null) {
  if (value === null || Number.isNaN(value)) return "0%";

  return `${Math.max(0, Math.min(100, value))}%`;
}

export default async function AdminAnalyticsPage() {
  const supabase = await createSupabaseServerClient();
  const [
    yearResult,
    gradeLevelResult,
    learnerResult,
    enrollmentResult,
    attendanceDateResult,
    attendanceResult,
    gradeResult,
    literacyResult,
    interventionResult,
    certificateResult,
    lessonPlanResult,
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
      .from("learners")
      .select("id,lrn,first_name,middle_name,last_name,extension_name,status")
      .order("last_name", { ascending: true }),
    supabase
      .from("learner_enrollments")
      .select(
        "id,learner_id,school_year_id,grade_level_id,section_id,enrollment_status",
      ),
    supabase.from("attendance_dates").select("id,school_year_id,section_id"),
    supabase
      .from("attendance_records")
      .select("id,attendance_date_id,enrollment_id,am_status,pm_status"),
    supabase.from("grades").select("id,enrollment_id,numeric_grade"),
    supabase
      .from("literacy_numeracy_records")
      .select("id,enrollment_id,literacy_rating,numeracy_rating"),
    supabase
      .from("interventions")
      .select("id,learner_id,enrollment_id,status,follow_up_on"),
    supabase.from("generated_certificates").select("id,enrollment_id"),
    supabase.from("lesson_plans").select("id,status"),
  ]);

  const firstError =
    yearResult.error ??
    gradeLevelResult.error ??
    learnerResult.error ??
    enrollmentResult.error ??
    attendanceDateResult.error ??
    attendanceResult.error ??
    gradeResult.error ??
    literacyResult.error ??
    interventionResult.error ??
    certificateResult.error ??
    lessonPlanResult.error;

  if (firstError) {
    throw new Error(firstError.message);
  }

  const years = (yearResult.data ?? []) as SchoolYear[];
  const gradeLevels = (gradeLevelResult.data ?? []) as GradeLevel[];
  const learners = (learnerResult.data ?? []) as Learner[];
  const enrollments = (enrollmentResult.data ?? []) as LearnerEnrollment[];
  const attendanceDates = (attendanceDateResult.data ?? []) as AttendanceDate[];
  const attendanceRecords = (attendanceResult.data ?? []) as AttendanceRecord[];
  const grades = (gradeResult.data ?? []) as GradeRecord[];
  const literacyRecords = (literacyResult.data ?? []) as LiteracyRecord[];
  const interventions = (interventionResult.data ?? []) as Intervention[];
  const certificates = (certificateResult.data ?? []) as GeneratedCertificate[];
  const lessonPlans = (lessonPlanResult.data ?? []) as LessonPlan[];
  const activeYear = years.find((year) => year.status === "active") ?? years[0];
  const learnerById = new Map(learners.map((learner) => [learner.id, learner]));
  const dateById = new Map(attendanceDates.map((date) => [date.id, date]));
  const activeEnrollments = activeYear
    ? enrollments.filter(
        (enrollment) =>
          enrollment.school_year_id === activeYear.id &&
          enrollment.enrollment_status === "enrolled",
      )
    : enrollments.filter(
        (enrollment) => enrollment.enrollment_status === "enrolled",
      );
  const activeEnrollmentIds = new Set(
    activeEnrollments.map((enrollment) => enrollment.id),
  );
  const activeLearnerIds = new Set(
    activeEnrollments.map((enrollment) => enrollment.learner_id),
  );
  const activeAttendanceRecords = attendanceRecords.filter((record) => {
    const date = dateById.get(record.attendance_date_id);
    const matchesYear = activeYear
      ? date?.school_year_id === activeYear.id
      : true;

    return matchesYear && activeEnrollmentIds.has(record.enrollment_id);
  });
  const activeGrades = grades.filter((grade) =>
    activeEnrollmentIds.has(grade.enrollment_id),
  );
  const activeLiteracyRecords = literacyRecords.filter((record) =>
    activeEnrollmentIds.has(record.enrollment_id),
  );
  const activeInterventions = interventions.filter((intervention) =>
    activeLearnerIds.has(intervention.learner_id),
  );
  const activeCertificateCount = certificates.filter((certificate) =>
    activeEnrollmentIds.has(certificate.enrollment_id),
  ).length;
  const attendanceEarned = activeAttendanceRecords.reduce(
    (sum, record) =>
      sum +
      attendanceValue(record.am_status) +
      attendanceValue(record.pm_status),
    0,
  );
  const attendanceRate = activeAttendanceRecords.length
    ? (attendanceEarned / (activeAttendanceRecords.length * 2)) * 100
    : null;
  const gradeAverage = average(
    activeGrades.map((grade) => Number(grade.numeric_grade)),
  );
  const literacyWatchCount = activeLiteracyRecords.filter(
    (record) =>
      record.literacy_rating === "beginning" ||
      record.literacy_rating === "developing" ||
      record.numeracy_rating === "beginning" ||
      record.numeracy_rating === "developing",
  ).length;
  const openInterventions = activeInterventions.filter(
    (intervention) =>
      intervention.status === "planned" || intervention.status === "ongoing",
  );
  const dueToday = new Date().toISOString().slice(0, 10);
  const dueInterventions = openInterventions.filter(
    (intervention) =>
      intervention.follow_up_on && intervention.follow_up_on <= dueToday,
  );

  const attendanceByEnrollment = activeAttendanceRecords.reduce(
    (map, record) => {
      const current = map.get(record.enrollment_id) ?? { earned: 0, total: 0 };
      current.earned +=
        attendanceValue(record.am_status) + attendanceValue(record.pm_status);
      current.total += 2;
      map.set(record.enrollment_id, current);
      return map;
    },
    new Map<string, { earned: number; total: number }>(),
  );
  const gradesByEnrollment = activeGrades.reduce((map, grade) => {
    const current = map.get(grade.enrollment_id) ?? [];
    current.push(Number(grade.numeric_grade));
    map.set(grade.enrollment_id, current);
    return map;
  }, new Map<string, number[]>());
  const literacyByEnrollment = new Map(
    activeLiteracyRecords.map((record) => [record.enrollment_id, record]),
  );
  const watchlist = activeEnrollments
    .flatMap((enrollment) => {
      const learner = learnerById.get(enrollment.learner_id);
      if (!learner) return [];

      const reasons: string[] = [];
      const attendance = attendanceByEnrollment.get(enrollment.id);
      const learnerAttendanceRate =
        attendance && attendance.total
          ? (attendance.earned / attendance.total) * 100
          : null;
      const learnerGradeAverage = average(
        gradesByEnrollment.get(enrollment.id) ?? [],
      );
      const literacy = literacyByEnrollment.get(enrollment.id);

      if (learnerAttendanceRate !== null && learnerAttendanceRate < 80) {
        reasons.push(`Attendance ${percent(learnerAttendanceRate)}`);
      }

      if (learnerGradeAverage !== null && learnerGradeAverage < 75) {
        reasons.push(`Grade average ${numberValue(learnerGradeAverage)}`);
      }

      if (
        literacy &&
        (literacy.literacy_rating === "beginning" ||
          literacy.numeracy_rating === "beginning")
      ) {
        reasons.push("Beginning literacy/numeracy rating");
      }

      if (!reasons.length) return [];

      return [
        {
          learner,
          reasons,
        },
      ];
    })
    .slice(0, 8);

  const gradeCards = gradeLevels.map((gradeLevel) => {
    const gradeEnrollments = activeEnrollments.filter(
      (enrollment) => enrollment.grade_level_id === gradeLevel.id,
    );
    const gradeEnrollmentIds = new Set(
      gradeEnrollments.map((enrollment) => enrollment.id),
    );
    const gradeLearnerIds = new Set(
      gradeEnrollments.map((enrollment) => enrollment.learner_id),
    );
    const gradeAttendance = activeAttendanceRecords.filter((record) =>
      gradeEnrollmentIds.has(record.enrollment_id),
    );
    const gradeAttendanceEarned = gradeAttendance.reduce(
      (sum, record) =>
        sum +
        attendanceValue(record.am_status) +
        attendanceValue(record.pm_status),
      0,
    );
    const gradeAttendanceRate = gradeAttendance.length
      ? (gradeAttendanceEarned / (gradeAttendance.length * 2)) * 100
      : null;
    const gradeAverageValue = average(
      activeGrades
        .filter((grade) => gradeEnrollmentIds.has(grade.enrollment_id))
        .map((grade) => Number(grade.numeric_grade)),
    );
    const gradeInterventions = activeInterventions.filter((intervention) =>
      gradeLearnerIds.has(intervention.learner_id),
    ).length;

    return {
      gradeLevel,
      enrollmentCount: gradeEnrollments.length,
      attendanceRate: gradeAttendanceRate,
      gradeAverage: gradeAverageValue,
      interventionCount: gradeInterventions,
    };
  });

  return (
    <div className="space-y-8">
      <div>
        <p className="text-xs font-bold uppercase text-skybrand-600">
          Phase 15
        </p>
        <h1 className="mt-3 font-display text-3xl font-extrabold text-navy-950">
          Analytics dashboard
        </h1>
        <p className="mt-3 max-w-3xl text-sm leading-7 text-slate-600">
          School-wide operational metrics for{" "}
          {activeYear?.name ?? "all school years"}, using the data already
          encoded in attendance, grades, literacy, interventions, certificates,
          and lesson plans.
        </p>
      </div>

      {activeEnrollments.length ? (
        <>
          <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
            {[
              {
                label: "Active learners",
                value: activeEnrollments.length,
                icon: GraduationCap,
              },
              {
                label: "Attendance rate",
                value: percent(attendanceRate),
                icon: Activity,
              },
              {
                label: "Grade average",
                value: numberValue(gradeAverage),
                icon: TrendingUp,
              },
              {
                label: "Open interventions",
                value: openInterventions.length,
                icon: ShieldAlert,
              },
            ].map(({ label, value, icon: Icon }) => (
              <section
                className="rounded-[1.5rem] border border-slate-200 bg-white p-5 shadow-soft"
                key={label}
              >
                <div className="flex items-center justify-between gap-3">
                  <p className="text-3xl font-extrabold text-navy-950">
                    {value}
                  </p>
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

          <div className="grid gap-6 xl:grid-cols-[1.05fr_0.95fr]">
            <section className="rounded-[1.5rem] border border-slate-200 bg-white p-6 shadow-soft">
              <div className="flex items-start gap-3">
                <span className="grid size-12 place-items-center rounded-2xl bg-skybrand-50 text-skybrand-600">
                  <BarChart3 size={24} />
                </span>
                <div>
                  <h2 className="font-display text-xl font-extrabold text-navy-950">
                    Grade-level overview
                  </h2>
                  <p className="mt-1 text-sm text-slate-500">
                    Compare enrollment load, attendance, grade averages, and
                    intervention volume.
                  </p>
                </div>
              </div>

              <div className="mt-6 grid gap-4">
                {gradeCards
                  .filter((card) => card.enrollmentCount > 0)
                  .map((card) => (
                    <article
                      className="rounded-2xl border border-slate-200 bg-slate-50 p-4"
                      key={card.gradeLevel.id}
                    >
                      <div className="flex flex-wrap items-center justify-between gap-3">
                        <div>
                          <p className="font-display text-lg font-extrabold text-navy-950">
                            {card.gradeLevel.label}
                          </p>
                          <p className="text-sm text-slate-500">
                            {card.enrollmentCount} enrolled learners
                          </p>
                        </div>
                        <span className="rounded-full bg-white px-3 py-1 text-xs font-bold text-slate-600">
                          {card.interventionCount} interventions
                        </span>
                      </div>
                      <div className="mt-4 grid gap-3 sm:grid-cols-2">
                        <div>
                          <div className="flex justify-between text-xs font-bold uppercase text-slate-500">
                            <span>Attendance</span>
                            <span>{percent(card.attendanceRate)}</span>
                          </div>
                          <div className="mt-2 h-2 rounded-full bg-white">
                            <div
                              className="h-2 rounded-full bg-skybrand-500"
                              style={{ width: barWidth(card.attendanceRate) }}
                            />
                          </div>
                        </div>
                        <div>
                          <div className="flex justify-between text-xs font-bold uppercase text-slate-500">
                            <span>Grade average</span>
                            <span>{numberValue(card.gradeAverage)}</span>
                          </div>
                          <div className="mt-2 h-2 rounded-full bg-white">
                            <div
                              className="h-2 rounded-full bg-navy-900"
                              style={{ width: barWidth(card.gradeAverage) }}
                            />
                          </div>
                        </div>
                      </div>
                    </article>
                  ))}
              </div>
            </section>

            <section className="rounded-[1.5rem] border border-slate-200 bg-white p-6 shadow-soft">
              <div className="flex items-start gap-3">
                <span className="grid size-12 place-items-center rounded-2xl bg-skybrand-50 text-skybrand-600">
                  <ShieldAlert size={24} />
                </span>
                <div>
                  <h2 className="font-display text-xl font-extrabold text-navy-950">
                    Learner watchlist
                  </h2>
                  <p className="mt-1 text-sm text-slate-500">
                    Signals from low attendance, grade averages, and beginning
                    ratings.
                  </p>
                </div>
              </div>

              {watchlist.length ? (
                <div className="mt-6 grid gap-3">
                  {watchlist.map(({ learner, reasons }) => (
                    <article
                      className="rounded-2xl border border-slate-200 bg-slate-50 p-4"
                      key={learner.id}
                    >
                      <p className="font-semibold text-navy-950">
                        {learnerName(learner)}
                      </p>
                      <p className="mt-1 text-sm text-slate-500">
                        LRN {learner.lrn}
                      </p>
                      <div className="mt-3 flex flex-wrap gap-2">
                        {reasons.map((reason) => (
                          <span
                            className="rounded-full bg-white px-3 py-1 text-xs font-bold text-rose-700"
                            key={reason}
                          >
                            {reason}
                          </span>
                        ))}
                      </div>
                    </article>
                  ))}
                </div>
              ) : (
                <p className="mt-6 rounded-2xl bg-slate-50 p-4 text-sm text-slate-600">
                  No learner risk signals are visible from the current data.
                </p>
              )}
            </section>
          </div>

          <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
            {[
              {
                label: "Literacy/numeracy watch",
                value: literacyWatchCount,
                icon: BookOpenCheck,
              },
              {
                label: "Due follow-ups",
                value: dueInterventions.length,
                icon: ShieldAlert,
              },
              {
                label: "Certificates generated",
                value: activeCertificateCount,
                icon: GraduationCap,
              },
              {
                label: "Lesson plans submitted",
                value: lessonPlans.length,
                icon: FileTextIcon,
              },
            ].map(({ label, value, icon: Icon }) => (
              <section
                className="rounded-[1.5rem] border border-slate-200 bg-white p-5 shadow-soft"
                key={label}
              >
                <div className="flex items-center justify-between gap-3">
                  <p className="text-3xl font-extrabold text-navy-950">
                    {value}
                  </p>
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
        </>
      ) : (
        <EmptyState
          message="Analytics will populate when learners are enrolled into a school year and operational data is encoded."
          title="No active enrollment data"
        />
      )}
    </div>
  );
}

function FileTextIcon({ size }: { size: number }) {
  return <BookOpenCheck size={size} />;
}
