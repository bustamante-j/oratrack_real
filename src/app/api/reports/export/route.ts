import { logAuditEvent } from "@/lib/audit";
import { getSessionProfile } from "@/lib/auth/session";
import { createSimplePdfReport } from "@/lib/reports/pdf";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { reportExportFormSchema } from "@/lib/validation/domain";
import type { Json } from "@/types/database";
import type {
  AttendanceStatus,
  InterventionStatus,
  RatingLevel,
} from "@/types/domain";

export const runtime = "nodejs";

type ReportType = ReturnType<typeof reportExportFormSchema.parse>["reportType"];

type SchoolYear = {
  id: string;
  name: string;
  status: "draft" | "active" | "closed";
};

type GradeLevel = {
  id: number;
  label: string;
};

type Section = {
  id: string;
  school_year_id: string;
  grade_level_id: number;
  name: string;
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
  attendance_on: string;
};

type AttendanceRecord = {
  id: string;
  attendance_date_id: string;
  enrollment_id: string;
  am_status: AttendanceStatus;
  pm_status: AttendanceStatus;
};

type Subject = {
  id: string;
  code: string;
  name: string;
};

type GradePeriod = {
  id: string;
  code: string;
  name: string;
};

type GradeRecord = {
  id: string;
  enrollment_id: string;
  subject_id: string;
  grade_period_id: string;
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
  category: string;
  status: InterventionStatus;
  started_on: string;
  follow_up_on: string | null;
};

type ReportData = {
  years: SchoolYear[];
  gradeLevels: GradeLevel[];
  sections: Section[];
  learners: Learner[];
  enrollments: LearnerEnrollment[];
  attendanceDates: AttendanceDate[];
  attendanceRecords: AttendanceRecord[];
  subjects: Subject[];
  gradePeriods: GradePeriod[];
  grades: GradeRecord[];
  literacyRecords: LiteracyRecord[];
  interventions: Intervention[];
};

type ScopedData = ReportData & {
  scopedEnrollments: LearnerEnrollment[];
  scopedAttendanceDates: AttendanceDate[];
  scopedAttendanceRecords: AttendanceRecord[];
  scopedGrades: GradeRecord[];
  scopedLiteracyRecords: LiteracyRecord[];
  scopedInterventions: Intervention[];
};

const reportTitles: Record<ReportType, string> = {
  attendance: "Attendance Report",
  grades: "Grades Report",
  literacy_numeracy: "Literacy and Numeracy Report",
  interventions: "Intervention Report",
  promotion: "Promotion Readiness Report",
  learner_profile: "Learner Profile Report",
  school_summary: "School Summary Report",
};

function optionalQueryValue(value: string | null) {
  return value && value.trim().length ? value.trim() : undefined;
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

function attendanceValue(status: AttendanceStatus) {
  if (status === "absent") return 0;
  if (status === "half_day") return 0.5;

  return 1;
}

function average(values: number[]) {
  if (!values.length) return null;

  return values.reduce((sum, value) => sum + value, 0) / values.length;
}

function formatPercent(value: number | null) {
  if (value === null || Number.isNaN(value)) return "No data";

  return `${value.toFixed(1)}%`;
}

function formatNumber(value: number | null) {
  if (value === null || Number.isNaN(value)) return "No data";

  return value.toFixed(1);
}

function statusCounts<T extends string>(values: T[]) {
  return values.reduce(
    (map, value) => map.set(value, (map.get(value) ?? 0) + 1),
    new Map<T, number>(),
  );
}

function mapById<T extends { id: string }>(items: T[]) {
  return new Map(items.map((item) => [item.id, item]));
}

function safeFilename(value: string) {
  return value
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "")
    .slice(0, 80);
}

function scopeLabel(
  data: ReportData,
  scope: {
    schoolYearId?: string;
    sectionId?: string;
    learnerId?: string;
  },
) {
  const yearById = mapById(data.years);
  const sectionById = mapById(data.sections);
  const learnerById = mapById(data.learners);
  const learner = scope.learnerId ? learnerById.get(scope.learnerId) : null;

  return [
    `School year: ${
      scope.schoolYearId
        ? (yearById.get(scope.schoolYearId)?.name ?? "Selected year")
        : "All visible"
    }`,
    `Section: ${
      scope.sectionId
        ? (sectionById.get(scope.sectionId)?.name ?? "Selected section")
        : "All visible"
    }`,
    `Learner: ${learner ? learnerName(learner) : "All visible"}`,
  ].join(" | ");
}

async function loadReportData(): Promise<ReportData> {
  const supabase = await createSupabaseServerClient();
  const [
    yearResult,
    gradeLevelResult,
    sectionResult,
    learnerResult,
    enrollmentResult,
    attendanceDateResult,
    attendanceResult,
    subjectResult,
    gradePeriodResult,
    gradeResult,
    literacyResult,
    interventionResult,
  ] = await Promise.all([
    supabase
      .from("school_years")
      .select("id,name,status")
      .order("starts_on", { ascending: false }),
    supabase.from("grade_levels").select("id,label").order("id"),
    supabase
      .from("sections")
      .select("id,school_year_id,grade_level_id,name")
      .order("name"),
    supabase
      .from("learners")
      .select("id,lrn,first_name,middle_name,last_name,extension_name,status")
      .order("last_name"),
    supabase
      .from("learner_enrollments")
      .select(
        "id,learner_id,school_year_id,grade_level_id,section_id,enrollment_status",
      ),
    supabase
      .from("attendance_dates")
      .select("id,school_year_id,section_id,attendance_on"),
    supabase
      .from("attendance_records")
      .select("id,attendance_date_id,enrollment_id,am_status,pm_status"),
    supabase.from("subjects").select("id,code,name").order("code"),
    supabase.from("grade_periods").select("id,code,name").order("sort_order"),
    supabase
      .from("grades")
      .select("id,enrollment_id,subject_id,grade_period_id,numeric_grade"),
    supabase
      .from("literacy_numeracy_records")
      .select("id,enrollment_id,literacy_rating,numeracy_rating"),
    supabase
      .from("interventions")
      .select(
        "id,learner_id,enrollment_id,category,status,started_on,follow_up_on",
      ),
  ]);

  const firstError =
    yearResult.error ??
    gradeLevelResult.error ??
    sectionResult.error ??
    learnerResult.error ??
    enrollmentResult.error ??
    attendanceDateResult.error ??
    attendanceResult.error ??
    subjectResult.error ??
    gradePeriodResult.error ??
    gradeResult.error ??
    literacyResult.error ??
    interventionResult.error;

  if (firstError) {
    throw new Error(firstError.message);
  }

  return {
    years: (yearResult.data ?? []) as SchoolYear[],
    gradeLevels: (gradeLevelResult.data ?? []) as GradeLevel[],
    sections: (sectionResult.data ?? []) as Section[],
    learners: (learnerResult.data ?? []) as Learner[],
    enrollments: (enrollmentResult.data ?? []) as LearnerEnrollment[],
    attendanceDates: (attendanceDateResult.data ?? []) as AttendanceDate[],
    attendanceRecords: (attendanceResult.data ?? []) as AttendanceRecord[],
    subjects: (subjectResult.data ?? []) as Subject[],
    gradePeriods: (gradePeriodResult.data ?? []) as GradePeriod[],
    grades: (gradeResult.data ?? []) as GradeRecord[],
    literacyRecords: (literacyResult.data ?? []) as LiteracyRecord[],
    interventions: (interventionResult.data ?? []) as Intervention[],
  };
}

function scopeData(
  data: ReportData,
  scope: {
    schoolYearId?: string;
    sectionId?: string;
    learnerId?: string;
  },
): ScopedData {
  const scopedEnrollments = data.enrollments.filter((enrollment) => {
    const matchesYear = scope.schoolYearId
      ? enrollment.school_year_id === scope.schoolYearId
      : true;
    const matchesSection = scope.sectionId
      ? enrollment.section_id === scope.sectionId
      : true;
    const matchesLearner = scope.learnerId
      ? enrollment.learner_id === scope.learnerId
      : true;

    return matchesYear && matchesSection && matchesLearner;
  });
  const scopedEnrollmentIds = new Set(
    scopedEnrollments.map((enrollment) => enrollment.id),
  );
  const scopedLearnerIds = new Set(
    scopedEnrollments.map((enrollment) => enrollment.learner_id),
  );
  const scopedAttendanceDates = data.attendanceDates.filter((date) => {
    const matchesYear = scope.schoolYearId
      ? date.school_year_id === scope.schoolYearId
      : true;
    const matchesSection = scope.sectionId
      ? date.section_id === scope.sectionId
      : true;

    return matchesYear && matchesSection;
  });
  const scopedAttendanceDateIds = new Set(
    scopedAttendanceDates.map((date) => date.id),
  );

  return {
    ...data,
    scopedEnrollments,
    scopedAttendanceDates,
    scopedAttendanceRecords: data.attendanceRecords.filter(
      (record) =>
        scopedEnrollmentIds.has(record.enrollment_id) &&
        scopedAttendanceDateIds.has(record.attendance_date_id),
    ),
    scopedGrades: data.grades.filter((grade) =>
      scopedEnrollmentIds.has(grade.enrollment_id),
    ),
    scopedLiteracyRecords: data.literacyRecords.filter((record) =>
      scopedEnrollmentIds.has(record.enrollment_id),
    ),
    scopedInterventions: data.interventions.filter(
      (intervention) =>
        scopedLearnerIds.has(intervention.learner_id) ||
        (intervention.enrollment_id
          ? scopedEnrollmentIds.has(intervention.enrollment_id)
          : false),
    ),
  };
}

function attendanceLines(data: ScopedData) {
  const earned = data.scopedAttendanceRecords.reduce(
    (sum, record) =>
      sum +
      attendanceValue(record.am_status) +
      attendanceValue(record.pm_status),
    0,
  );
  const rate = data.scopedAttendanceRecords.length
    ? (earned / (data.scopedAttendanceRecords.length * 2)) * 100
    : null;
  const amCounts = statusCounts(
    data.scopedAttendanceRecords.map((record) => record.am_status),
  );
  const pmCounts = statusCounts(
    data.scopedAttendanceRecords.map((record) => record.pm_status),
  );

  return [
    `Enrollments in scope: ${data.scopedEnrollments.length}`,
    `Attendance dates in scope: ${data.scopedAttendanceDates.length}`,
    `Attendance records encoded: ${data.scopedAttendanceRecords.length}`,
    `Overall attendance rate: ${formatPercent(rate)}`,
    `AM present: ${amCounts.get("present") ?? 0}, absent: ${amCounts.get("absent") ?? 0}, late: ${amCounts.get("late") ?? 0}, excused: ${amCounts.get("excused") ?? 0}`,
    `PM present: ${pmCounts.get("present") ?? 0}, absent: ${pmCounts.get("absent") ?? 0}, late: ${pmCounts.get("late") ?? 0}, excused: ${pmCounts.get("excused") ?? 0}`,
  ];
}

function gradeLines(data: ScopedData) {
  const subjectById = mapById(data.subjects);
  const averageGrade = average(
    data.scopedGrades.map((grade) => Number(grade.numeric_grade)),
  );
  const subjectSummaries = data.subjects
    .map((subject) => {
      const subjectGrades = data.scopedGrades.filter(
        (grade) => grade.subject_id === subject.id,
      );
      const subjectAverage = average(
        subjectGrades.map((grade) => Number(grade.numeric_grade)),
      );

      return subjectGrades.length
        ? `${subject.code}: ${formatNumber(subjectAverage)} average across ${subjectGrades.length} grades`
        : null;
    })
    .filter((line): line is string => Boolean(line))
    .slice(0, 12);

  return [
    `Enrollments in scope: ${data.scopedEnrollments.length}`,
    `Grade records encoded: ${data.scopedGrades.length}`,
    `Overall grade average: ${formatNumber(averageGrade)}`,
    `Grades below 75: ${
      data.scopedGrades.filter((grade) => Number(grade.numeric_grade) < 75)
        .length
    }`,
    ...subjectSummaries,
    data.scopedGrades.length
      ? `Highest subject volume: ${
          subjectById.get(data.scopedGrades[0].subject_id)?.code ?? "Subject"
        } records are included in the scoped export.`
      : "No grade records were found for this scope.",
  ];
}

function literacyLines(data: ScopedData) {
  const literacyCounts = statusCounts(
    data.scopedLiteracyRecords.map((record) => record.literacy_rating),
  );
  const numeracyCounts = statusCounts(
    data.scopedLiteracyRecords.map((record) => record.numeracy_rating),
  );

  return [
    `Literacy/numeracy records encoded: ${data.scopedLiteracyRecords.length}`,
    `Literacy - beginning: ${literacyCounts.get("beginning") ?? 0}, developing: ${literacyCounts.get("developing") ?? 0}, proficient: ${literacyCounts.get("proficient") ?? 0}, advanced: ${literacyCounts.get("advanced") ?? 0}`,
    `Numeracy - beginning: ${numeracyCounts.get("beginning") ?? 0}, developing: ${numeracyCounts.get("developing") ?? 0}, proficient: ${numeracyCounts.get("proficient") ?? 0}, advanced: ${numeracyCounts.get("advanced") ?? 0}`,
    `Learners needing close support: ${
      data.scopedLiteracyRecords.filter(
        (record) =>
          record.literacy_rating === "beginning" ||
          record.numeracy_rating === "beginning",
      ).length
    }`,
  ];
}

function interventionLines(data: ScopedData) {
  const counts = statusCounts(
    data.scopedInterventions.map((intervention) => intervention.status),
  );
  const today = new Date().toISOString().slice(0, 10);

  return [
    `Intervention records: ${data.scopedInterventions.length}`,
    `Planned: ${counts.get("planned") ?? 0}`,
    `Ongoing: ${counts.get("ongoing") ?? 0}`,
    `Completed: ${counts.get("completed") ?? 0}`,
    `Cancelled: ${counts.get("cancelled") ?? 0}`,
    `Follow-ups due: ${
      data.scopedInterventions.filter(
        (intervention) =>
          intervention.follow_up_on && intervention.follow_up_on <= today,
      ).length
    }`,
  ];
}

function promotionLines(data: ScopedData) {
  const gradeById = new Map(data.gradeLevels.map((grade) => [grade.id, grade]));
  const grouped = data.gradeLevels
    .map((grade) => {
      const count = data.scopedEnrollments.filter(
        (enrollment) => enrollment.grade_level_id === grade.id,
      ).length;

      return count
        ? `${grade.label}: ${count} learner(s) ready for end-of-year review`
        : null;
    })
    .filter((line): line is string => Boolean(line));

  return [
    `Promotion source enrollments: ${data.scopedEnrollments.length}`,
    `Active/enrolled records: ${
      data.scopedEnrollments.filter(
        (enrollment) => enrollment.enrollment_status === "enrolled",
      ).length
    }`,
    ...grouped,
    data.scopedEnrollments.length
      ? `Highest grade level in scope: ${
          gradeById.get(
            Math.max(
              ...data.scopedEnrollments.map(
                (enrollment) => enrollment.grade_level_id,
              ),
            ),
          )?.label ?? "Grade"
        }`
      : "No promotion source records found for this scope.",
  ];
}

function learnerProfileLines(data: ScopedData, learnerId?: string) {
  const learnerById = mapById(data.learners);
  const enrollmentById = mapById(data.scopedEnrollments);
  const learners = learnerId
    ? data.learners.filter((learner) => learner.id === learnerId)
    : data.scopedEnrollments
        .map((enrollment) => learnerById.get(enrollment.learner_id))
        .filter((learner): learner is Learner => Boolean(learner))
        .slice(0, 10);

  if (!learners.length) {
    return ["No learner profile records were found for this scope."];
  }

  return learners.flatMap((learner) => {
    const learnerEnrollments = data.scopedEnrollments.filter(
      (enrollment) => enrollment.learner_id === learner.id,
    );
    const enrollmentIds = new Set(
      learnerEnrollments.map((enrollment) => enrollment.id),
    );
    const learnerGrades = data.scopedGrades.filter((grade) =>
      enrollmentIds.has(grade.enrollment_id),
    );
    const learnerAttendance = data.scopedAttendanceRecords.filter((record) =>
      enrollmentIds.has(record.enrollment_id),
    );
    const attendanceEarned = learnerAttendance.reduce(
      (sum, record) =>
        sum +
        attendanceValue(record.am_status) +
        attendanceValue(record.pm_status),
      0,
    );
    const attendanceRate = learnerAttendance.length
      ? (attendanceEarned / (learnerAttendance.length * 2)) * 100
      : null;
    const latestEnrollment = learnerEnrollments[0];

    return [
      `${learnerName(learner)} (LRN ${learner.lrn})`,
      `Status: ${learner.status}`,
      `Enrollment records in scope: ${learnerEnrollments.length}`,
      `Current enrollment status: ${
        latestEnrollment
          ? enrollmentById.get(latestEnrollment.id)?.enrollment_status
          : "No enrollment"
      }`,
      `Attendance rate: ${formatPercent(attendanceRate)}`,
      `Grade average: ${formatNumber(
        average(learnerGrades.map((grade) => Number(grade.numeric_grade))),
      )}`,
      `Interventions: ${
        data.scopedInterventions.filter(
          (intervention) => intervention.learner_id === learner.id,
        ).length
      }`,
      "",
    ];
  });
}

function summaryLines(data: ScopedData) {
  return [
    `Visible school years: ${data.years.length}`,
    `Visible sections: ${data.sections.length}`,
    `Enrollments in scope: ${data.scopedEnrollments.length}`,
    `Attendance records: ${data.scopedAttendanceRecords.length}`,
    `Grade records: ${data.scopedGrades.length}`,
    `Literacy/numeracy records: ${data.scopedLiteracyRecords.length}`,
    `Interventions: ${data.scopedInterventions.length}`,
    `Overall attendance rate: ${formatPercent(
      data.scopedAttendanceRecords.length
        ? (data.scopedAttendanceRecords.reduce(
            (sum, record) =>
              sum +
              attendanceValue(record.am_status) +
              attendanceValue(record.pm_status),
            0,
          ) /
            (data.scopedAttendanceRecords.length * 2)) *
            100
        : null,
    )}`,
    `Overall grade average: ${formatNumber(
      average(data.scopedGrades.map((grade) => Number(grade.numeric_grade))),
    )}`,
  ];
}

function buildReportLines(
  reportType: ReportType,
  data: ScopedData,
  learnerId?: string,
) {
  if (reportType === "attendance") return attendanceLines(data);
  if (reportType === "grades") return gradeLines(data);
  if (reportType === "literacy_numeracy") return literacyLines(data);
  if (reportType === "interventions") return interventionLines(data);
  if (reportType === "promotion") return promotionLines(data);
  if (reportType === "learner_profile") {
    return learnerProfileLines(data, learnerId);
  }

  return summaryLines(data);
}

export async function GET(request: Request) {
  const session = await getSessionProfile();

  if (session.kind === "unconfigured") {
    return Response.json(
      { error: "Supabase must be configured before reports can be exported." },
      { status: 503 },
    );
  }

  if (session.kind === "anonymous") {
    return Response.json(
      { error: "Authentication required." },
      { status: 401 },
    );
  }

  const searchParams = new URL(request.url).searchParams;
  const parsed = reportExportFormSchema.safeParse({
    reportType: searchParams.get("reportType"),
    schoolYearId: optionalQueryValue(searchParams.get("schoolYearId")),
    sectionId: optionalQueryValue(searchParams.get("sectionId")),
    learnerId: optionalQueryValue(searchParams.get("learnerId")),
  });

  if (!parsed.success) {
    return Response.json(
      { error: "Choose a valid report type and filter scope." },
      { status: 400 },
    );
  }

  const supabase = await createSupabaseServerClient();
  const data = await loadReportData();
  const scope = {
    schoolYearId: parsed.data.schoolYearId ?? null,
    sectionId: parsed.data.sectionId ?? null,
    learnerId: parsed.data.learnerId ?? null,
  };
  const scoped = scopeData(data, {
    schoolYearId: parsed.data.schoolYearId,
    sectionId: parsed.data.sectionId,
    learnerId: parsed.data.learnerId,
  });
  const title = reportTitles[parsed.data.reportType];
  const lines = buildReportLines(
    parsed.data.reportType,
    scoped,
    parsed.data.learnerId,
  );
  const pdf = await createSimplePdfReport({
    title,
    subtitle: `${scopeLabel(data, {
      schoolYearId: parsed.data.schoolYearId,
      sectionId: parsed.data.sectionId,
      learnerId: parsed.data.learnerId,
    })} | Generated ${new Date().toLocaleString("en")}`,
    lines,
  });

  const { data: exportRecord, error: exportError } = await supabase
    .from("report_exports")
    .insert({
      report_type: parsed.data.reportType,
      scope: scope satisfies Json,
      file_path: null,
      exported_by: session.profile.userId,
    })
    .select("id")
    .single();

  if (exportError) {
    return Response.json({ error: exportError.message }, { status: 500 });
  }

  await logAuditEvent(supabase, {
    actorId: session.profile.userId,
    action: "report_exported",
    entityTable: "report_exports",
    entityId: exportRecord.id,
    metadata: {
      reportType: parsed.data.reportType,
      scope,
      lineCount: lines.length,
    },
  });

  return new Response(new Uint8Array(pdf), {
    headers: {
      "Content-Disposition": `attachment; filename="oratrack-${safeFilename(title)}.pdf"`,
      "Content-Type": "application/pdf",
    },
  });
}
