"use server";

import ExcelJS from "exceljs";
import { revalidatePath } from "next/cache";

import { logAuditEvent } from "@/lib/audit";
import { requireAuthenticatedProfile } from "@/lib/auth/session";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import {
  gradeImportFormSchema,
  gradeImportRowSchema,
  gradeRecordFormSchema,
} from "@/lib/validation/domain";
import type { Json } from "@/types/database";

type SupabaseServerClient = Awaited<
  ReturnType<typeof createSupabaseServerClient>
>;

type GradeAssignmentContext = {
  assignment: {
    id: string;
    section_id: string;
    subject_id: string;
    teacher_id: string | null;
  };
  section: {
    id: string;
    school_year_id: string;
    grade_level_id: number;
  };
  subject: {
    id: string;
    code: string;
    name: string;
  };
};

type ExcelWorkbookLoader = {
  load(buffer: ArrayBuffer): Promise<ExcelJS.Workbook>;
};

function optionalFormValue(value: FormDataEntryValue | null) {
  if (typeof value !== "string") return undefined;

  const trimmed = value.trim();
  return trimmed.length ? trimmed : undefined;
}

function cellText(row: ExcelJS.Row, index: number) {
  const value = row.getCell(index).value;

  if (value === null || value === undefined) return "";
  if (typeof value === "object" && "text" in value) return String(value.text);

  return String(value).trim();
}

function revalidateGradeViews() {
  revalidatePath("/teacher/grades");
  revalidatePath("/teacher/learners");
  revalidatePath("/teacher/reports");
  revalidatePath("/admin/analytics");
  revalidatePath("/admin/reports");
  revalidatePath("/teacher/ai");
  revalidatePath("/admin/ai");
}

async function getGradeAssignmentContext(
  supabase: SupabaseServerClient,
  assignmentId: string,
  userId: string,
  role: string,
): Promise<GradeAssignmentContext> {
  const { data: assignment, error: assignmentError } = await supabase
    .from("section_subjects")
    .select("id,section_id,subject_id,teacher_id")
    .eq("id", assignmentId)
    .single();

  if (assignmentError) {
    throw new Error(assignmentError.message);
  }

  if (role !== "admin_principal" && assignment.teacher_id !== userId) {
    throw new Error("Only the assigned subject teacher can encode grades.");
  }

  const [sectionResult, subjectResult] = await Promise.all([
    supabase
      .from("sections")
      .select("id,school_year_id,grade_level_id")
      .eq("id", assignment.section_id)
      .single(),
    supabase
      .from("subjects")
      .select("id,code,name")
      .eq("id", assignment.subject_id)
      .single(),
  ]);

  if (sectionResult.error) {
    throw new Error(sectionResult.error.message);
  }

  if (subjectResult.error) {
    throw new Error(subjectResult.error.message);
  }

  return {
    assignment,
    section: sectionResult.data,
    subject: subjectResult.data,
  };
}

async function assertGradePeriodMatchesSection(
  supabase: SupabaseServerClient,
  gradePeriodId: string,
  schoolYearId: string,
) {
  const { data: gradePeriod, error } = await supabase
    .from("grade_periods")
    .select("id,school_year_id,code,name")
    .eq("id", gradePeriodId)
    .single();

  if (error) {
    throw new Error(error.message);
  }

  if (gradePeriod.school_year_id !== schoolYearId) {
    throw new Error("Grade period does not match the selected section year.");
  }

  return gradePeriod;
}

async function assertEnrollmentsBelongToSection(
  supabase: SupabaseServerClient,
  enrollmentIds: string[],
  sectionId: string,
) {
  const { data: enrollments, error } = await supabase
    .from("learner_enrollments")
    .select("id,section_id,enrollment_status")
    .in("id", enrollmentIds);

  if (error) {
    throw new Error(error.message);
  }

  const enrollmentsById = new Map(
    (enrollments ?? []).map((enrollment) => [enrollment.id, enrollment]),
  );

  for (const enrollmentId of enrollmentIds) {
    const enrollment = enrollmentsById.get(enrollmentId);

    if (
      !enrollment ||
      enrollment.section_id !== sectionId ||
      enrollment.enrollment_status !== "enrolled"
    ) {
      throw new Error("Grades include a learner outside this section.");
    }
  }
}

export async function saveGradeRecordsAction(formData: FormData) {
  const profile = await requireAuthenticatedProfile();
  const assignmentId = formData.get("assignmentId");
  const gradePeriodId = formData.get("gradePeriodId");
  const enrollmentIds = formData
    .getAll("enrollmentId")
    .filter((value): value is string => typeof value === "string");

  const parsed = gradeRecordFormSchema.parse({
    assignmentId,
    gradePeriodId,
    records: enrollmentIds.map((enrollmentId) => ({
      enrollmentId,
      numericGrade: formData.get(`numericGrade-${enrollmentId}`),
      remarks: optionalFormValue(formData.get(`remarks-${enrollmentId}`)),
    })),
  });
  const supabase = await createSupabaseServerClient();
  const context = await getGradeAssignmentContext(
    supabase,
    parsed.assignmentId,
    profile.userId,
    profile.role,
  );
  await assertGradePeriodMatchesSection(
    supabase,
    parsed.gradePeriodId,
    context.section.school_year_id,
  );
  await assertEnrollmentsBelongToSection(
    supabase,
    parsed.records.map((record) => record.enrollmentId),
    context.section.id,
  );

  const { data: savedGrades, error } = await supabase
    .from("grades")
    .upsert(
      parsed.records.map((record) => ({
        enrollment_id: record.enrollmentId,
        subject_id: context.assignment.subject_id,
        grade_period_id: parsed.gradePeriodId,
        numeric_grade: record.numericGrade,
        remarks: record.remarks ?? null,
        encoded_by: profile.userId,
      })),
      { onConflict: "enrollment_id,subject_id,grade_period_id" },
    )
    .select("id");

  if (error) {
    throw new Error(error.message);
  }

  await logAuditEvent(supabase, {
    actorId: profile.userId,
    action: "grade_changed",
    entityTable: "grades",
    metadata: {
      assignmentId: parsed.assignmentId,
      sectionId: context.section.id,
      subjectId: context.assignment.subject_id,
      gradePeriodId: parsed.gradePeriodId,
      recordCount: savedGrades?.length ?? 0,
    },
  });

  revalidateGradeViews();
}

export async function importGradeWorkbookAction(formData: FormData) {
  const profile = await requireAuthenticatedProfile();
  const parsed = gradeImportFormSchema.parse({
    assignmentId: formData.get("assignmentId"),
  });
  const file = formData.get("gradeFile");

  if (!(file instanceof File) || file.size === 0) {
    throw new Error("Upload a filled grade import workbook.");
  }

  const supabase = await createSupabaseServerClient();
  const context = await getGradeAssignmentContext(
    supabase,
    parsed.assignmentId,
    profile.userId,
    profile.role,
  );
  const workbook = new ExcelJS.Workbook();
  await (workbook.xlsx as unknown as ExcelWorkbookLoader).load(
    await file.arrayBuffer(),
  );

  const sheet = workbook.getWorksheet("Grades") ?? workbook.worksheets[0];

  if (!sheet) {
    throw new Error("Workbook does not contain a Grades sheet.");
  }

  const { data: gradePeriods, error: gradePeriodsError } = await supabase
    .from("grade_periods")
    .select("id,school_year_id,code,name")
    .eq("school_year_id", context.section.school_year_id);

  if (gradePeriodsError) {
    throw new Error(gradePeriodsError.message);
  }

  const periodByCode = new Map(
    (gradePeriods ?? []).map((period) => [period.code.toUpperCase(), period]),
  );
  const { data: sectionEnrollments, error: enrollmentError } = await supabase
    .from("learner_enrollments")
    .select("id,learner_id,section_id,enrollment_status")
    .eq("section_id", context.section.id)
    .eq("enrollment_status", "enrolled");

  if (enrollmentError) {
    throw new Error(enrollmentError.message);
  }

  const learnerIds = (sectionEnrollments ?? []).map(
    (enrollment) => enrollment.learner_id,
  );
  const { data: learners, error: learnerError } = learnerIds.length
    ? await supabase
        .from("learners")
        .select("id,lrn,status")
        .in("id", learnerIds)
    : { data: [], error: null };

  if (learnerError) {
    throw new Error(learnerError.message);
  }

  const enrollmentByLearnerId = new Map(
    (sectionEnrollments ?? []).map((enrollment) => [
      enrollment.learner_id,
      enrollment,
    ]),
  );
  const enrollmentByLrn = new Map<string, string>();

  for (const learner of learners ?? []) {
    if (learner.status !== "active") continue;

    const enrollmentId = enrollmentByLearnerId.get(learner.id)?.id;

    if (enrollmentId) {
      enrollmentByLrn.set(learner.lrn, enrollmentId);
    }
  }
  const errors: string[] = [];
  const rows: Array<{
    enrollmentId: string;
    gradePeriodId: string;
    numericGrade: number;
    remarks?: string;
  }> = [];

  sheet.eachRow((row, rowNumber) => {
    if (rowNumber === 1) return;

    const raw = {
      lrn: cellText(row, 1),
      subjectCode: cellText(row, 2),
      periodCode: cellText(row, 3),
      grade: cellText(row, 4),
      remarks: cellText(row, 5) || undefined,
    };

    if (
      !raw.lrn &&
      !raw.subjectCode &&
      !raw.periodCode &&
      !raw.grade &&
      !raw.remarks
    ) {
      return;
    }

    const parsedRow = gradeImportRowSchema.safeParse(raw);

    if (!parsedRow.success) {
      errors.push(`Row ${rowNumber}: invalid row values.`);
      return;
    }

    const subjectCode = parsedRow.data.subjectCode.toUpperCase();
    const periodCode = parsedRow.data.periodCode.toUpperCase();
    const enrollmentId = enrollmentByLrn.get(parsedRow.data.lrn);
    const gradePeriod = periodByCode.get(periodCode);

    if (!enrollmentId) {
      errors.push(`Row ${rowNumber}: LRN is not enrolled in this section.`);
      return;
    }

    if (subjectCode !== context.subject.code.toUpperCase()) {
      errors.push(`Row ${rowNumber}: subject code does not match assignment.`);
      return;
    }

    if (!gradePeriod) {
      errors.push(`Row ${rowNumber}: period code is not configured.`);
      return;
    }

    rows.push({
      enrollmentId,
      gradePeriodId: gradePeriod.id,
      numericGrade: parsedRow.data.grade,
      remarks: parsedRow.data.remarks,
    });
  });

  if (errors.length) {
    throw new Error(errors.slice(0, 5).join(" "));
  }

  if (!rows.length) {
    throw new Error("No grade rows were found in the workbook.");
  }

  const { data: batch, error: batchError } = await supabase
    .from("grade_import_batches")
    .insert({
      school_year_id: context.section.school_year_id,
      section_id: context.section.id,
      subject_id: context.assignment.subject_id,
      imported_by: profile.userId,
      source_file_path: file.name,
      status: "imported",
      row_count: rows.length,
      error_count: 0,
    })
    .select("id")
    .single();

  if (batchError) {
    throw new Error(batchError.message);
  }

  const { data: savedGrades, error: gradeError } = await supabase
    .from("grades")
    .upsert(
      rows.map((row) => ({
        enrollment_id: row.enrollmentId,
        subject_id: context.assignment.subject_id,
        grade_period_id: row.gradePeriodId,
        numeric_grade: row.numericGrade,
        remarks: row.remarks ?? null,
        encoded_by: profile.userId,
        batch_id: batch.id,
      })),
      { onConflict: "enrollment_id,subject_id,grade_period_id" },
    )
    .select("id");

  if (gradeError) {
    throw new Error(gradeError.message);
  }

  await logAuditEvent(supabase, {
    actorId: profile.userId,
    action: "grade_imported",
    entityTable: "grade_import_batches",
    entityId: batch.id,
    metadata: {
      assignmentId: parsed.assignmentId,
      sectionId: context.section.id,
      subjectId: context.assignment.subject_id,
      sourceFileName: file.name,
      rowCount: rows.length,
      savedGradeCount: savedGrades?.length ?? 0,
    } satisfies Json,
  });

  revalidateGradeViews();
}
