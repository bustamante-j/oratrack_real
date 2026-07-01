import { Download, FileText, RefreshCcw, Upload } from "lucide-react";

import { ActionDisclosure } from "@/components/ui/action-disclosure";
import { EmptyState } from "@/components/ui/empty-state";
import { MetricStrip } from "@/components/ui/metric-strip";
import { SubmitButton } from "@/components/ui/submit-button";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import type { LessonPlanStatus } from "@/types/domain";

import { replaceLessonPlanFileAction, uploadLessonPlanAction } from "./actions";

export const metadata = {
  title: "Lesson Plans",
};

type SchoolYear = {
  id: string;
  name: string;
  status: "draft" | "active" | "closed";
};

type GradeLevel = {
  id: number;
  label: string;
};

type Subject = {
  id: string;
  code: string;
  name: string;
};

type UploadedFile = {
  id: string;
  original_filename: string;
  mime_type: string;
  byte_size: number;
  created_at: string;
};

type LessonPlan = {
  id: string;
  school_year_id: string;
  grade_level_id: number | null;
  subject_id: string | null;
  title: string;
  file_id: string | null;
  status: LessonPlanStatus;
  reviewed_at: string | null;
  created_at: string;
  updated_at: string;
};

function formatDateTime(value: string) {
  return new Intl.DateTimeFormat("en", {
    month: "short",
    day: "numeric",
    year: "numeric",
    hour: "numeric",
    minute: "2-digit",
  }).format(new Date(value));
}

function formatBytes(value: number) {
  if (value < 1024 * 1024) return `${Math.max(1, Math.round(value / 1024))} KB`;

  return `${(value / 1024 / 1024).toFixed(1)} MB`;
}

function statusLabel(status: LessonPlanStatus) {
  return status.replaceAll("_", " ");
}

function statusTone(status: LessonPlanStatus) {
  if (status === "reviewed") return "bg-emerald-50 text-emerald-700";
  if (status === "archived") return "bg-slate-100 text-slate-600";
  if (status === "replaced") return "bg-amber-50 text-amber-700";
  return "bg-skybrand-50 text-navy-900";
}

export default async function TeacherLessonPlansPage() {
  const supabase = await createSupabaseServerClient();
  const [yearResult, gradeResult, subjectResult, planResult, fileResult] =
    await Promise.all([
      supabase
        .from("school_years")
        .select("id,name,status")
        .order("starts_on", { ascending: false }),
      supabase.from("grade_levels").select("id,label").order("id"),
      supabase.from("subjects").select("id,code,name").order("code"),
      supabase
        .from("lesson_plans")
        .select(
          "id,school_year_id,grade_level_id,subject_id,title,file_id,status,reviewed_at,created_at,updated_at",
        )
        .order("updated_at", { ascending: false }),
      supabase
        .from("uploaded_files")
        .select("id,original_filename,mime_type,byte_size,created_at")
        .order("created_at", { ascending: false }),
    ]);

  const firstError =
    yearResult.error ??
    gradeResult.error ??
    subjectResult.error ??
    planResult.error ??
    fileResult.error;

  if (firstError) {
    throw new Error(firstError.message);
  }

  const years = (yearResult.data ?? []) as SchoolYear[];
  const grades = (gradeResult.data ?? []) as GradeLevel[];
  const subjects = (subjectResult.data ?? []) as Subject[];
  const lessonPlans = (planResult.data ?? []) as LessonPlan[];
  const files = (fileResult.data ?? []) as UploadedFile[];
  const yearById = new Map(years.map((year) => [year.id, year]));
  const gradeById = new Map(grades.map((grade) => [grade.id, grade]));
  const subjectById = new Map(subjects.map((subject) => [subject.id, subject]));
  const fileById = new Map(files.map((file) => [file.id, file]));
  const reviewedCount = lessonPlans.filter(
    (plan) => plan.status === "reviewed",
  ).length;
  const pendingCount = lessonPlans.filter(
    (plan) => plan.status === "uploaded" || plan.status === "replaced",
  ).length;

  return (
    <div className="space-y-6">
      <div>
        <p className="text-xs font-bold uppercase text-skybrand-600">
          Phase 14
        </p>
        <h1 className="mt-3 font-display text-3xl font-extrabold text-navy-950">
          Lesson plans
        </h1>
        <details className="mt-3 max-w-3xl text-sm leading-7 text-slate-600">
          <summary className="cursor-pointer text-sm font-bold text-navy-950">
            Page details
          </summary>
          Upload private lesson-plan files, replace drafts, and download your
          submitted files through short-lived signed links.
        </details>
      </div>

      <MetricStrip
        columns="three"
        items={[
          { label: "Uploaded", value: lessonPlans.length },
          { label: "Pending review", value: pendingCount },
          { label: "Reviewed", value: reviewedCount },
        ]}
      />

      <ActionDisclosure
        icon={<Upload size={17} />}
        meta="PDF, DOC, DOCX"
        title="Upload lesson plan"
      >
        {years.length ? (
          <form action={uploadLessonPlanAction} className="grid gap-4">
            <div className="grid gap-4 lg:grid-cols-3">
              <label>
                <span className="label">School year</span>
                <select className="input" name="schoolYearId" required>
                  {years.map((year) => (
                    <option key={year.id} value={year.id}>
                      {year.name} ({year.status})
                    </option>
                  ))}
                </select>
              </label>
              <label>
                <span className="label">Grade level</span>
                <select className="input" name="gradeLevelId">
                  <option value="">General</option>
                  {grades.map((grade) => (
                    <option key={grade.id} value={grade.id}>
                      {grade.label}
                    </option>
                  ))}
                </select>
              </label>
              <label>
                <span className="label">Subject</span>
                <select className="input" name="subjectId">
                  <option value="">General</option>
                  {subjects.map((subject) => (
                    <option key={subject.id} value={subject.id}>
                      {subject.code} - {subject.name}
                    </option>
                  ))}
                </select>
              </label>
            </div>
            <label>
              <span className="label">Title</span>
              <input
                className="input"
                name="title"
                placeholder="Week 1 reading intervention lesson plan"
                required
              />
            </label>
            <label>
              <span className="label">File</span>
              <input
                accept=".pdf,.doc,.docx,application/pdf,application/msword,application/vnd.openxmlformats-officedocument.wordprocessingml.document"
                className="input"
                name="lessonFile"
                required
                type="file"
              />
            </label>
            <SubmitButton pendingLabel="Uploading lesson plan...">
              Upload lesson plan
            </SubmitButton>
          </form>
        ) : (
          <EmptyState
            message="A school year must be configured before lesson plans can be uploaded."
            title="No school years yet"
          />
        )}
      </ActionDisclosure>

      <section className="rounded-lg border border-slate-200 bg-white p-4 shadow-soft">
        <div className="flex items-start gap-3">
          <span className="grid size-12 place-items-center rounded-lg bg-skybrand-50 text-skybrand-600">
            <FileText size={24} />
          </span>
          <div>
            <h2 className="font-display text-xl font-extrabold text-navy-950">
              My lesson plans
            </h2>
            <p className="mt-1 text-sm text-slate-500">
              Replace a file when you need to resubmit after review.
            </p>
          </div>
        </div>

        {lessonPlans.length ? (
          <div className="mt-6 grid gap-4">
            {lessonPlans.map((plan) => {
              const file = plan.file_id ? fileById.get(plan.file_id) : null;
              const subject = plan.subject_id
                ? subjectById.get(plan.subject_id)
                : null;

              return (
                <article
                  className="rounded-lg border border-slate-200 bg-slate-50 p-4"
                  key={plan.id}
                >
                  <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
                    <div>
                      <span
                        className={`rounded-full px-3 py-1 text-xs font-bold capitalize ${statusTone(plan.status)}`}
                      >
                        {statusLabel(plan.status)}
                      </span>
                      <h3 className="mt-4 font-display text-xl font-extrabold text-navy-950">
                        {plan.title}
                      </h3>
                      <p className="mt-1 text-sm text-slate-500">
                        {yearById.get(plan.school_year_id)?.name ??
                          "School year"}{" "}
                        -{" "}
                        {plan.grade_level_id
                          ? gradeById.get(plan.grade_level_id)?.label
                          : "General"}{" "}
                        -{" "}
                        {subject
                          ? `${subject.code} ${subject.name}`
                          : "General"}
                      </p>
                    </div>
                    {file ? (
                      <a
                        className="inline-flex min-h-9 items-center justify-center gap-2 rounded-lg border border-slate-200 bg-white px-3 py-1.5 text-sm font-bold text-navy-950 transition hover:border-slate-300 hover:bg-slate-50"
                        href={`/api/lesson-plans/download?id=${plan.id}`}
                      >
                        <Download size={17} />
                        Download
                      </a>
                    ) : null}
                  </div>

                  <div className="mt-4 rounded-lg bg-white p-4 text-sm text-slate-600">
                    <p>
                      {file?.original_filename ?? "No file"}{" "}
                      {file ? `- ${formatBytes(file.byte_size)}` : ""}
                    </p>
                    <p className="mt-1 text-xs font-bold uppercase text-slate-500">
                      Uploaded {formatDateTime(plan.created_at)} - Updated{" "}
                      {formatDateTime(plan.updated_at)}
                    </p>
                  </div>

                  <details className="mt-4 rounded-lg border border-slate-200 bg-white p-4">
                    <summary className="inline-flex cursor-pointer items-center gap-2 text-sm font-bold text-navy-950">
                      <RefreshCcw size={17} />
                      Replace file
                    </summary>
                    <form
                      action={replaceLessonPlanFileAction}
                      className="mt-4 grid gap-4"
                    >
                      <input
                        name="lessonPlanId"
                        type="hidden"
                        value={plan.id}
                      />
                      <label>
                        <span className="label">Replacement file</span>
                        <input
                          accept=".pdf,.doc,.docx,application/pdf,application/msword,application/vnd.openxmlformats-officedocument.wordprocessingml.document"
                          className="input"
                          name="replacementFile"
                          required
                          type="file"
                        />
                      </label>
                      <SubmitButton pendingLabel="Replacing file...">
                        Replace lesson-plan file
                      </SubmitButton>
                    </form>
                  </details>
                </article>
              );
            })}
          </div>
        ) : (
          <div className="mt-6">
            <EmptyState
              message="Uploaded lesson plans will appear here with review status and download links."
              title="No lesson plans uploaded"
            />
          </div>
        )}
      </section>
    </div>
  );
}
