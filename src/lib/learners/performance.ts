import "server-only";

import { createSupabaseServerClient } from "@/lib/supabase/server";
import type { AttendanceStatus } from "@/types/domain";

type SupabaseServerClient = Awaited<
  ReturnType<typeof createSupabaseServerClient>
>;

export type LearnerPerformanceData = {
  learner: {
    id: string;
    lrn: string;
    first_name: string;
    middle_name: string | null;
    last_name: string;
    extension_name: string | null;
    sex: "female" | "male";
    birth_date: string;
    address: string | null;
    status: "active" | "inactive" | "archived" | "transferred";
  };
  guardians: Array<{
    id: string;
    full_name: string;
    relationship: string;
    phone: string | null;
    email: string | null;
    is_primary: boolean;
  }>;
  enrollments: Array<{
    id: string;
    school_year_id: string;
    grade_level_id: number;
    section_id: string | null;
    enrollment_status: string;
    enrolled_on: string;
  }>;
  schoolYears: Array<{ id: string; name: string; status: string }>;
  gradeLevels: Array<{ id: number; label: string }>;
  sections: Array<{ id: string; name: string }>;
  attendance: Array<{
    id: string;
    attendance_date_id: string;
    enrollment_id: string;
    am_status: AttendanceStatus;
    pm_status: AttendanceStatus;
    remarks: string | null;
  }>;
  attendanceDates: Array<{ id: string; attendance_on: string }>;
  grades: Array<{
    id: string;
    enrollment_id: string;
    subject_id: string;
    grade_period_id: string;
    numeric_grade: number;
    remarks: string | null;
  }>;
  subjects: Array<{ id: string; code: string; name: string }>;
  periods: Array<{
    id: string;
    code: string;
    name: string;
    sort_order: number;
  }>;
  literacy: Array<{
    id: string;
    enrollment_id: string;
    literacy_rating: string;
    numeracy_rating: string;
    remarks: string | null;
  }>;
  awards: Array<{
    id: string;
    certificate_template_id: string | null;
    enrollment_id: string;
    certificate_type: "recognition" | "completion";
    generated_at: string;
  }>;
  certificateTemplates: Array<{
    id: string;
    name: string;
  }>;
};

export async function getLearnerPerformanceData(
  supabase: SupabaseServerClient,
  learnerId: string,
) {
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
        "id,lrn,first_name,middle_name,last_name,extension_name,sex,birth_date,address,status",
      )
      .eq("id", learnerId)
      .single(),
    supabase
      .from("learner_guardians")
      .select("id,full_name,relationship,phone,email,is_primary")
      .eq("learner_id", learnerId),
    supabase
      .from("learner_enrollments")
      .select(
        "id,school_year_id,grade_level_id,section_id,enrollment_status,enrolled_on",
      )
      .eq("learner_id", learnerId)
      .order("enrolled_on", { ascending: false }),
    supabase.from("school_years").select("id,name,status"),
    supabase.from("grade_levels").select("id,label"),
    supabase.from("sections").select("id,name"),
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

  const enrollments = enrollmentResult.data ?? [];
  const enrollmentIds = enrollments.map((enrollment) => enrollment.id);
  const [attendanceResult, gradeResult, literacyResult, awardResult] =
    enrollmentIds.length
      ? await Promise.all([
          supabase
            .from("attendance_records")
            .select(
              "id,attendance_date_id,enrollment_id,am_status,pm_status,remarks",
            )
            .in("enrollment_id", enrollmentIds),
          supabase
            .from("grades")
            .select(
              "id,enrollment_id,subject_id,grade_period_id,numeric_grade,remarks",
            )
            .in("enrollment_id", enrollmentIds),
          supabase
            .from("literacy_numeracy_records")
            .select("id,enrollment_id,literacy_rating,numeracy_rating,remarks")
            .in("enrollment_id", enrollmentIds),
          supabase
            .from("generated_certificates")
            .select(
              "id,certificate_template_id,enrollment_id,certificate_type,generated_at",
            )
            .in("enrollment_id", enrollmentIds)
            .order("generated_at", { ascending: false }),
        ])
      : [
          { data: [], error: null },
          { data: [], error: null },
          { data: [], error: null },
          { data: [], error: null },
        ];

  const secondError =
    attendanceResult.error ??
    gradeResult.error ??
    literacyResult.error ??
    awardResult.error;

  if (secondError) {
    throw new Error(secondError.message);
  }

  const attendanceDateIds = [
    ...new Set(
      (attendanceResult.data ?? []).map((record) => record.attendance_date_id),
    ),
  ];
  const subjectIds = [
    ...new Set((gradeResult.data ?? []).map((grade) => grade.subject_id)),
  ];
  const periodIds = [
    ...new Set((gradeResult.data ?? []).map((grade) => grade.grade_period_id)),
  ];
  const templateIds = [
    ...new Set(
      (awardResult.data ?? [])
        .map((award) => award.certificate_template_id)
        .filter((id): id is string => Boolean(id)),
    ),
  ];
  const [
    attendanceDateResult,
    subjectResult,
    periodResult,
    certificateTemplateResult,
  ] = await Promise.all([
    attendanceDateIds.length
      ? supabase
          .from("attendance_dates")
          .select("id,attendance_on")
          .in("id", attendanceDateIds)
      : { data: [], error: null },
    subjectIds.length
      ? supabase.from("subjects").select("id,code,name").in("id", subjectIds)
      : { data: [], error: null },
    periodIds.length
      ? supabase
          .from("grade_periods")
          .select("id,code,name,sort_order")
          .in("id", periodIds)
      : { data: [], error: null },
    templateIds.length
      ? supabase
          .from("certificate_templates")
          .select("id,name")
          .in("id", templateIds)
      : { data: [], error: null },
  ]);

  const thirdError =
    attendanceDateResult.error ??
    subjectResult.error ??
    periodResult.error ??
    certificateTemplateResult.error;

  if (thirdError) {
    throw new Error(thirdError.message);
  }

  return {
    learner: learnerResult.data,
    guardians: guardianResult.data ?? [],
    enrollments,
    schoolYears: schoolYearResult.data ?? [],
    gradeLevels: gradeLevelResult.data ?? [],
    sections: sectionResult.data ?? [],
    attendance: attendanceResult.data ?? [],
    attendanceDates: attendanceDateResult.data ?? [],
    grades: gradeResult.data ?? [],
    subjects: subjectResult.data ?? [],
    periods: periodResult.data ?? [],
    literacy: literacyResult.data ?? [],
    awards: awardResult.data ?? [],
    certificateTemplates: certificateTemplateResult.data ?? [],
  } as LearnerPerformanceData;
}
