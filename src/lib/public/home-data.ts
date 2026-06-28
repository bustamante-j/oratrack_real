import "server-only";

import { createSupabaseAdminClient } from "@/lib/supabase/admin";

export type HomeAnnouncement = {
  id: string;
  title: string;
  body: string;
  published_at: string | null;
};

export type HomeEvent = {
  id: string;
  title: string;
  body: string | null;
  starts_at: string;
  ends_at: string | null;
  published_at: string | null;
};

export type HomeMetrics = {
  activeLearners: number;
  activeStaff: number;
  attendanceRate: number | null;
  activeGradeLevels: number;
};

export type HomePageData = {
  announcements: HomeAnnouncement[];
  events: HomeEvent[];
  metrics: HomeMetrics;
};

type SchoolYear = {
  id: string;
  status: "draft" | "active" | "closed";
};

type Enrollment = {
  id: string;
  learner_id: string;
  school_year_id: string;
  grade_level_id: number;
  enrollment_status: string;
};

type AttendanceDate = {
  id: string;
  school_year_id: string;
};

type AttendanceRecord = {
  attendance_date_id: string;
  enrollment_id: string;
  am_status: string;
  pm_status: string;
};

function emptyHomeData(): HomePageData {
  return {
    announcements: [],
    events: [],
    metrics: {
      activeLearners: 0,
      activeStaff: 0,
      attendanceRate: null,
      activeGradeLevels: 0,
    },
  };
}

function attendanceValue(status: string) {
  if (status === "absent") return 0;
  if (status === "half_day") return 0.5;
  return 1;
}

function computeAttendanceRate(
  attendanceDates: AttendanceDate[],
  attendanceRecords: AttendanceRecord[],
  activeEnrollmentIds: Set<string>,
  activeYearId?: string,
) {
  const activeAttendanceDateIds = new Set(
    attendanceDates
      .filter((date) =>
        activeYearId ? date.school_year_id === activeYearId : true,
      )
      .map((date) => date.id),
  );
  const scopedRecords = attendanceRecords.filter(
    (record) =>
      activeAttendanceDateIds.has(record.attendance_date_id) &&
      activeEnrollmentIds.has(record.enrollment_id),
  );

  if (!scopedRecords.length) return null;

  const earned = scopedRecords.reduce(
    (sum, record) =>
      sum +
      attendanceValue(record.am_status) +
      attendanceValue(record.pm_status),
    0,
  );

  return (earned / (scopedRecords.length * 2)) * 100;
}

export async function getHomePageData(): Promise<HomePageData> {
  try {
    const supabase = createSupabaseAdminClient();
    const [
      announcementResult,
      eventResult,
      schoolYearResult,
      enrollmentResult,
      staffResult,
      attendanceDateResult,
      attendanceRecordResult,
    ] = await Promise.all([
      supabase
        .from("public_announcements")
        .select("id,title,body,published_at")
        .not("published_at", "is", null)
        .order("published_at", { ascending: false })
        .limit(5),
      supabase
        .from("public_events")
        .select("id,title,body,starts_at,ends_at,published_at")
        .not("published_at", "is", null)
        .order("starts_at", { ascending: true })
        .limit(12),
      supabase.from("school_years").select("id,status"),
      supabase
        .from("learner_enrollments")
        .select("id,learner_id,school_year_id,grade_level_id,enrollment_status")
        .eq("enrollment_status", "enrolled")
        .limit(10000),
      supabase
        .from("profiles")
        .select("user_id,status")
        .eq("status", "active")
        .limit(10000),
      supabase
        .from("attendance_dates")
        .select("id,school_year_id")
        .limit(10000),
      supabase
        .from("attendance_records")
        .select("attendance_date_id,enrollment_id,am_status,pm_status")
        .limit(10000),
    ]);

    const firstError =
      announcementResult.error ??
      eventResult.error ??
      schoolYearResult.error ??
      enrollmentResult.error ??
      staffResult.error ??
      attendanceDateResult.error ??
      attendanceRecordResult.error;

    if (firstError) {
      console.error(firstError.message);
      return emptyHomeData();
    }

    const schoolYears = (schoolYearResult.data ?? []) as SchoolYear[];
    const activeYear =
      schoolYears.find((year) => year.status === "active") ?? schoolYears[0];
    const enrollments = (enrollmentResult.data ?? []) as Enrollment[];
    const activeEnrollments = activeYear
      ? enrollments.filter(
          (enrollment) => enrollment.school_year_id === activeYear.id,
        )
      : enrollments;
    const activeEnrollmentIds = new Set(
      activeEnrollments.map((enrollment) => enrollment.id),
    );
    const activeLearnerIds = new Set(
      activeEnrollments.map((enrollment) => enrollment.learner_id),
    );
    const activeGradeLevels = new Set(
      activeEnrollments.map((enrollment) => enrollment.grade_level_id),
    );
    const attendanceRate = computeAttendanceRate(
      (attendanceDateResult.data ?? []) as AttendanceDate[],
      (attendanceRecordResult.data ?? []) as AttendanceRecord[],
      activeEnrollmentIds,
      activeYear?.id,
    );

    return {
      announcements: (announcementResult.data ?? []) as HomeAnnouncement[],
      events: (eventResult.data ?? []) as HomeEvent[],
      metrics: {
        activeLearners: activeLearnerIds.size,
        activeStaff: staffResult.data?.length ?? 0,
        attendanceRate,
        activeGradeLevels: activeGradeLevels.size,
      },
    };
  } catch (error) {
    console.error(error);
    return emptyHomeData();
  }
}
