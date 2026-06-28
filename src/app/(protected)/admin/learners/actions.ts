"use server";

import ExcelJS from "exceljs";
import { revalidatePath } from "next/cache";

import { logAuditEvent } from "@/lib/audit";
import { requireAdminProfile } from "@/lib/auth/session";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import {
  learnerCreateFormSchema,
  learnerEnrollmentFormSchema,
  learnerGuardianFormSchema,
  learnerImportRowSchema,
  learnerStatusFormSchema,
  learnerUpdateFormSchema,
} from "@/lib/validation/domain";

type ExcelWorkbookLoader = {
  load(buffer: ArrayBuffer): Promise<ExcelJS.Workbook>;
};

type SchoolYear = {
  id: string;
  name: string;
};

type GradeLevel = {
  id: number;
  label: string;
  grade_number: number;
};

type Section = {
  id: string;
  school_year_id: string;
  grade_level_id: number;
  name: string;
};

function optionalFormValue(value: FormDataEntryValue | null) {
  if (typeof value !== "string") return undefined;

  const trimmed = value.trim();
  return trimmed.length ? trimmed : undefined;
}

function nullableText(value: string | undefined) {
  return value?.trim() || null;
}

function cellText(row: ExcelJS.Row, index: number) {
  const value = row.getCell(index).value;

  if (value === null || value === undefined) return "";
  if (value instanceof Date) return value.toISOString().slice(0, 10);
  if (typeof value === "object") {
    if ("text" in value) return String(value.text).trim();
    if ("result" in value) return String(value.result ?? "").trim();
    if ("richText" in value && Array.isArray(value.richText)) {
      return value.richText
        .map((part) => part.text)
        .join("")
        .trim();
    }
  }

  return String(value).trim();
}

function revalidateLearnerViews() {
  revalidatePath("/admin/learners");
  revalidatePath("/teacher/learners");
  revalidatePath("/admin/analytics");
  revalidatePath("/teacher/ai");
  revalidatePath("/admin/ai");
  revalidatePath("/");
}

function findGradeLevel(value: string, gradeLevels: GradeLevel[]) {
  const normalized = value.trim().toLowerCase();
  const gradeNumberMatch = normalized.match(/\d+/);
  const gradeNumber = gradeNumberMatch ? Number(gradeNumberMatch[0]) : null;

  return (
    gradeLevels.find((grade) => grade.label.toLowerCase() === normalized) ??
    gradeLevels.find((grade) => String(grade.grade_number) === normalized) ??
    gradeLevels.find((grade) => grade.grade_number === gradeNumber)
  );
}

function findSection(
  value: string | undefined,
  input: {
    schoolYearId: string;
    gradeLevelId: number;
    sections: Section[];
  },
) {
  if (!value) return null;

  const normalized = value.trim().toLowerCase();
  return (
    input.sections.find(
      (section) =>
        section.school_year_id === input.schoolYearId &&
        section.grade_level_id === input.gradeLevelId &&
        section.name.toLowerCase() === normalized,
    ) ?? null
  );
}

export async function createLearnerAction(formData: FormData) {
  const admin = await requireAdminProfile();
  const parsed = learnerCreateFormSchema.parse({
    lrn: formData.get("lrn"),
    firstName: formData.get("firstName"),
    middleName: optionalFormValue(formData.get("middleName")),
    lastName: formData.get("lastName"),
    extensionName: optionalFormValue(formData.get("extensionName")),
    sex: formData.get("sex"),
    birthDate: formData.get("birthDate"),
    address: optionalFormValue(formData.get("address")),
    guardianFullName: optionalFormValue(formData.get("guardianFullName")),
    guardianRelationship: optionalFormValue(
      formData.get("guardianRelationship"),
    ),
    guardianPhone: optionalFormValue(formData.get("guardianPhone")),
    guardianEmail: optionalFormValue(formData.get("guardianEmail")),
    guardianAddress: optionalFormValue(formData.get("guardianAddress")),
  });
  const supabase = await createSupabaseServerClient();

  const { data: learner, error } = await supabase
    .from("learners")
    .insert({
      lrn: parsed.lrn,
      first_name: parsed.firstName,
      middle_name: nullableText(parsed.middleName),
      last_name: parsed.lastName,
      extension_name: nullableText(parsed.extensionName),
      sex: parsed.sex,
      birth_date: parsed.birthDate,
      address: nullableText(parsed.address),
      status: "active",
      created_by: admin.userId,
    })
    .select("id")
    .single();

  if (error) {
    throw new Error(error.message);
  }

  if (parsed.guardianFullName) {
    const { error: guardianError } = await supabase
      .from("learner_guardians")
      .insert({
        learner_id: learner.id,
        full_name: parsed.guardianFullName,
        relationship: parsed.guardianRelationship ?? "Guardian",
        phone: nullableText(parsed.guardianPhone),
        email: nullableText(parsed.guardianEmail),
        address: nullableText(parsed.guardianAddress),
        is_primary: true,
      });

    if (guardianError) {
      await supabase.from("learners").delete().eq("id", learner.id);
      throw new Error(guardianError.message);
    }
  }

  await logAuditEvent(supabase, {
    actorId: admin.userId,
    action: "learner_created",
    entityTable: "learners",
    entityId: learner.id,
    metadata: { lrn: parsed.lrn },
  });

  revalidateLearnerViews();
}

export async function updateLearnerAction(formData: FormData) {
  const admin = await requireAdminProfile();
  const parsed = learnerUpdateFormSchema.parse({
    id: formData.get("id"),
    lrn: formData.get("lrn"),
    firstName: formData.get("firstName"),
    middleName: optionalFormValue(formData.get("middleName")),
    lastName: formData.get("lastName"),
    extensionName: optionalFormValue(formData.get("extensionName")),
    sex: formData.get("sex"),
    birthDate: formData.get("birthDate"),
    address: optionalFormValue(formData.get("address")),
  });
  const supabase = await createSupabaseServerClient();

  const { error } = await supabase
    .from("learners")
    .update({
      lrn: parsed.lrn,
      first_name: parsed.firstName,
      middle_name: nullableText(parsed.middleName),
      last_name: parsed.lastName,
      extension_name: nullableText(parsed.extensionName),
      sex: parsed.sex,
      birth_date: parsed.birthDate,
      address: nullableText(parsed.address),
    })
    .eq("id", parsed.id);

  if (error) {
    throw new Error(error.message);
  }

  await logAuditEvent(supabase, {
    actorId: admin.userId,
    action: "learner_updated",
    entityTable: "learners",
    entityId: parsed.id,
    metadata: { lrn: parsed.lrn },
  });

  revalidateLearnerViews();
}

export async function setLearnerStatusAction(formData: FormData) {
  const admin = await requireAdminProfile();
  const parsed = learnerStatusFormSchema.parse({
    id: formData.get("id"),
    status: formData.get("status"),
  });
  const supabase = await createSupabaseServerClient();
  const { error } = await supabase
    .from("learners")
    .update({
      status: parsed.status,
      archived_at:
        parsed.status === "archived" ? new Date().toISOString() : null,
    })
    .eq("id", parsed.id);

  if (error) {
    throw new Error(error.message);
  }

  await logAuditEvent(supabase, {
    actorId: admin.userId,
    action:
      parsed.status === "archived" ? "learner_archived" : "learner_updated",
    entityTable: "learners",
    entityId: parsed.id,
    metadata: { status: parsed.status },
  });

  revalidateLearnerViews();
}

export async function upsertLearnerEnrollmentAction(formData: FormData) {
  const admin = await requireAdminProfile();
  const parsed = learnerEnrollmentFormSchema.parse({
    learnerId: formData.get("learnerId"),
    schoolYearId: formData.get("schoolYearId"),
    gradeLevelId: formData.get("gradeLevelId"),
    sectionId: optionalFormValue(formData.get("sectionId")),
    enrollmentStatus: formData.get("enrollmentStatus") || "enrolled",
    enrolledOn: optionalFormValue(formData.get("enrolledOn")),
  });
  const supabase = await createSupabaseServerClient();

  if (parsed.sectionId) {
    const { data: section, error: sectionError } = await supabase
      .from("sections")
      .select("school_year_id,grade_level_id")
      .eq("id", parsed.sectionId)
      .single();

    if (sectionError) {
      throw new Error(sectionError.message);
    }

    if (
      section.school_year_id !== parsed.schoolYearId ||
      section.grade_level_id !== parsed.gradeLevelId
    ) {
      throw new Error("Section does not match the selected school year/grade.");
    }
  }

  const { data: existingEnrollment, error: existingEnrollmentError } =
    await supabase
      .from("learner_enrollments")
      .select("id")
      .eq("learner_id", parsed.learnerId)
      .eq("school_year_id", parsed.schoolYearId)
      .maybeSingle();

  if (existingEnrollmentError) {
    throw new Error(existingEnrollmentError.message);
  }

  const enrollmentPayload = {
    learner_id: parsed.learnerId,
    school_year_id: parsed.schoolYearId,
    grade_level_id: parsed.gradeLevelId,
    section_id: parsed.sectionId ?? null,
    enrollment_status: parsed.enrollmentStatus,
    enrolled_on: parsed.enrolledOn ?? new Date().toISOString().slice(0, 10),
  };

  const mutation = existingEnrollment
    ? supabase
        .from("learner_enrollments")
        .update(enrollmentPayload)
        .eq("id", existingEnrollment.id)
        .select("id")
        .single()
    : supabase
        .from("learner_enrollments")
        .insert({
          ...enrollmentPayload,
          created_by: admin.userId,
        })
        .select("id")
        .single();

  const { data: enrollment, error } = await mutation;

  if (error) {
    throw new Error(error.message);
  }

  await logAuditEvent(supabase, {
    actorId: admin.userId,
    action: existingEnrollment
      ? "learner_enrollment_updated"
      : "learner_enrolled",
    entityTable: "learner_enrollments",
    entityId: enrollment.id,
    metadata: {
      learnerId: parsed.learnerId,
      schoolYearId: parsed.schoolYearId,
      gradeLevelId: parsed.gradeLevelId,
      sectionId: parsed.sectionId ?? null,
    },
  });

  revalidateLearnerViews();
}

export async function upsertPrimaryGuardianAction(formData: FormData) {
  const admin = await requireAdminProfile();
  const parsed = learnerGuardianFormSchema.parse({
    learnerId: formData.get("learnerId"),
    fullName: formData.get("fullName"),
    relationship: formData.get("relationship"),
    phone: optionalFormValue(formData.get("phone")),
    email: optionalFormValue(formData.get("email")),
    address: optionalFormValue(formData.get("address")),
  });
  const supabase = await createSupabaseServerClient();
  const { data: existingGuardian, error: existingGuardianError } =
    await supabase
      .from("learner_guardians")
      .select("id")
      .eq("learner_id", parsed.learnerId)
      .eq("is_primary", true)
      .maybeSingle();

  if (existingGuardianError) {
    throw new Error(existingGuardianError.message);
  }

  const guardianPayload = {
    learner_id: parsed.learnerId,
    full_name: parsed.fullName,
    relationship: parsed.relationship,
    phone: nullableText(parsed.phone),
    email: nullableText(parsed.email),
    address: nullableText(parsed.address),
    is_primary: true,
  };

  const mutation = existingGuardian
    ? supabase
        .from("learner_guardians")
        .update(guardianPayload)
        .eq("id", existingGuardian.id)
        .select("id")
        .single()
    : supabase
        .from("learner_guardians")
        .insert(guardianPayload)
        .select("id")
        .single();

  const { data: guardian, error } = await mutation;

  if (error) {
    throw new Error(error.message);
  }

  await logAuditEvent(supabase, {
    actorId: admin.userId,
    action: "learner_guardian_updated",
    entityTable: "learner_guardians",
    entityId: guardian.id,
    metadata: { learnerId: parsed.learnerId },
  });

  revalidateLearnerViews();
}

export async function importLearnersWorkbookAction(formData: FormData) {
  const admin = await requireAdminProfile();
  const file = formData.get("learnerFile");

  if (!(file instanceof File) || file.size === 0) {
    throw new Error("Upload a filled learner import workbook.");
  }

  const workbook = new ExcelJS.Workbook();
  await (workbook.xlsx as unknown as ExcelWorkbookLoader).load(
    await file.arrayBuffer(),
  );
  const sheet = workbook.getWorksheet("Learners") ?? workbook.worksheets[0];

  if (!sheet) {
    throw new Error("Workbook does not contain a Learners sheet.");
  }

  const supabase = await createSupabaseServerClient();
  const [schoolYearResult, gradeLevelResult, sectionResult] = await Promise.all(
    [
      supabase.from("school_years").select("id,name"),
      supabase.from("grade_levels").select("id,label,grade_number"),
      supabase.from("sections").select("id,school_year_id,grade_level_id,name"),
    ],
  );
  const firstSetupError =
    schoolYearResult.error ?? gradeLevelResult.error ?? sectionResult.error;

  if (firstSetupError) {
    throw new Error(firstSetupError.message);
  }

  const schoolYears = (schoolYearResult.data ?? []) as SchoolYear[];
  const gradeLevels = (gradeLevelResult.data ?? []) as GradeLevel[];
  const sections = (sectionResult.data ?? []) as Section[];
  const rows: Array<{
    rowNumber: number;
    learner: ReturnType<typeof learnerImportRowSchema.parse>;
    schoolYearId: string;
    gradeLevelId: number;
    sectionId: string | null;
  }> = [];
  const errors: string[] = [];

  sheet.eachRow((row, rowNumber) => {
    if (rowNumber === 1) return;

    const raw = {
      lrn: cellText(row, 1),
      firstName: cellText(row, 2),
      middleName: cellText(row, 3) || undefined,
      lastName: cellText(row, 4),
      extensionName: cellText(row, 5) || undefined,
      sex: cellText(row, 6).toLowerCase(),
      birthDate: cellText(row, 7),
      address: cellText(row, 8) || undefined,
      schoolYear: cellText(row, 9),
      gradeLevel: cellText(row, 10),
      section: cellText(row, 11) || undefined,
      enrolledOn: cellText(row, 12) || undefined,
      guardianFullName: cellText(row, 13) || undefined,
      guardianRelationship: cellText(row, 14) || undefined,
      guardianPhone: cellText(row, 15) || undefined,
      guardianEmail: cellText(row, 16) || undefined,
      guardianAddress: cellText(row, 17) || undefined,
    };

    if (!Object.values(raw).some(Boolean)) return;

    const parsed = learnerImportRowSchema.safeParse(raw);
    if (!parsed.success) {
      errors.push(`Row ${rowNumber}: ${parsed.error.issues[0]?.message}`);
      return;
    }

    const schoolYear = schoolYears.find(
      (year) =>
        year.name.toLowerCase() === parsed.data.schoolYear.toLowerCase(),
    );
    if (!schoolYear) {
      errors.push(`Row ${rowNumber}: School year was not found.`);
      return;
    }

    const gradeLevel = findGradeLevel(parsed.data.gradeLevel, gradeLevels);
    if (!gradeLevel) {
      errors.push(`Row ${rowNumber}: Grade level was not found.`);
      return;
    }

    const section = findSection(parsed.data.section, {
      schoolYearId: schoolYear.id,
      gradeLevelId: gradeLevel.id,
      sections,
    });
    if (parsed.data.section && !section) {
      errors.push(
        `Row ${rowNumber}: Section does not match the selected school year and grade level.`,
      );
      return;
    }

    rows.push({
      rowNumber,
      learner: parsed.data,
      schoolYearId: schoolYear.id,
      gradeLevelId: gradeLevel.id,
      sectionId: section?.id ?? null,
    });
  });

  if (errors.length) {
    throw new Error(errors.slice(0, 8).join(" "));
  }

  if (!rows.length) {
    throw new Error("The workbook does not contain learner rows to import.");
  }

  const importedLearnerIds: string[] = [];

  for (const row of rows) {
    const { data: learner, error } = await supabase
      .from("learners")
      .upsert(
        {
          lrn: row.learner.lrn,
          first_name: row.learner.firstName,
          middle_name: nullableText(row.learner.middleName),
          last_name: row.learner.lastName,
          extension_name: nullableText(row.learner.extensionName),
          sex: row.learner.sex,
          birth_date: row.learner.birthDate,
          address: nullableText(row.learner.address),
          status: "active",
          created_by: admin.userId,
        },
        { onConflict: "lrn" },
      )
      .select("id")
      .single();

    if (error) {
      throw new Error(`Row ${row.rowNumber}: ${error.message}`);
    }

    importedLearnerIds.push(learner.id);

    const { error: enrollmentError } = await supabase
      .from("learner_enrollments")
      .upsert(
        {
          learner_id: learner.id,
          school_year_id: row.schoolYearId,
          grade_level_id: row.gradeLevelId,
          section_id: row.sectionId,
          enrollment_status: "enrolled",
          enrolled_on:
            row.learner.enrolledOn ?? new Date().toISOString().slice(0, 10),
          created_by: admin.userId,
        },
        { onConflict: "learner_id,school_year_id" },
      );

    if (enrollmentError) {
      throw new Error(`Row ${row.rowNumber}: ${enrollmentError.message}`);
    }

    if (row.learner.guardianFullName) {
      const { data: existingGuardian, error: existingGuardianError } =
        await supabase
          .from("learner_guardians")
          .select("id")
          .eq("learner_id", learner.id)
          .eq("is_primary", true)
          .maybeSingle();

      if (existingGuardianError) {
        throw new Error(
          `Row ${row.rowNumber}: ${existingGuardianError.message}`,
        );
      }

      const guardianPayload = {
        learner_id: learner.id,
        full_name: row.learner.guardianFullName,
        relationship: row.learner.guardianRelationship ?? "Guardian",
        phone: nullableText(row.learner.guardianPhone),
        email: nullableText(row.learner.guardianEmail),
        address: nullableText(row.learner.guardianAddress),
        is_primary: true,
      };
      const guardianMutation = existingGuardian
        ? supabase
            .from("learner_guardians")
            .update(guardianPayload)
            .eq("id", existingGuardian.id)
        : supabase.from("learner_guardians").insert(guardianPayload);
      const { error: guardianError } = await guardianMutation;

      if (guardianError) {
        throw new Error(`Row ${row.rowNumber}: ${guardianError.message}`);
      }
    }
  }

  await logAuditEvent(supabase, {
    actorId: admin.userId,
    action: "learners_imported",
    entityTable: "learners",
    metadata: {
      rowCount: rows.length,
      learnerIds: importedLearnerIds,
      sourceFilename: file.name,
    },
  });

  revalidateLearnerViews();
}
