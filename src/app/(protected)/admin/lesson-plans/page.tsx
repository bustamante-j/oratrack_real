import { Archive, CheckCircle2, Download, FileText } from "lucide-react";

import { EmptyState } from "@/components/ui/empty-state";
import { MetricStrip } from "@/components/ui/metric-strip";
import { SubmitButton } from "@/components/ui/submit-button";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import type { LessonPlanStatus } from "@/types/domain";

import { reviewLessonPlanAction } from "./actions";

export const metadata = {
  title: "Lesson Plans",
};

type StaffProfile = {
  user_id: string;
  email: string | null;
  full_name: string | null;
};

type SchoolYear = {
  id: string;
  name: string;
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
  byte_size: number;
};

type LessonPlan = {
  id: string;
  school_year_id: string;
  grade_level_id: number | null;
  subject_id: string | null;
  teacher_id: string;
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

function staffName(profile: StaffProfile | undefined) {
  return profile?.full_name || profile?.email || "Staff";
}

export default async function AdminLessonPlansPage() {
  const supabase = await createSupabaseServerClient();
  const [
    planResult,
    fileResult,
    profileResult,
    yearResult,
    gradeResult,
    subjectResult,
  ] = await Promise.all([
    supabase
      .from("lesson_plans")
      .select(
        "id,school_year_id,grade_level_id,subject_id,teacher_id,title,file_id,status,reviewed_at,created_at,updated_at",
      )
      .order("updated_at", { ascending: false }),
    supabase
      .from("uploaded_files")
      .select("id,original_filename,byte_size")
      .order("created_at", { ascending: false }),
    supabase.from("profiles").select("user_id,email,full_name"),
    supabase
      .from("school_years")
      .select("id,name")
      .order("starts_on", { ascending: false }),
    supabase.from("grade_levels").select("id,label").order("id"),
    supabase.from("subjects").select("id,code,name").order("code"),
  ]);

  const firstError =
    planResult.error ??
    fileResult.error ??
    profileResult.error ??
    yearResult.error ??
    gradeResult.error ??
    subjectResult.error;

  if (firstError) {
    throw new Error(firstError.message);
  }

  const lessonPlans = (planResult.data ?? []) as LessonPlan[];
  const files = (fileResult.data ?? []) as UploadedFile[];
  const profiles = (profileResult.data ?? []) as StaffProfile[];
  const years = (yearResult.data ?? []) as SchoolYear[];
  const grades = (gradeResult.data ?? []) as GradeLevel[];
  const subjects = (subjectResult.data ?? []) as Subject[];
  const fileById = new Map(files.map((file) => [file.id, file]));
  const profileById = new Map(
    profiles.map((profile) => [profile.user_id, profile]),
  );
  const yearById = new Map(years.map((year) => [year.id, year]));
  const gradeById = new Map(grades.map((grade) => [grade.id, grade]));
  const subjectById = new Map(subjects.map((subject) => [subject.id, subject]));
  const pendingCount = lessonPlans.filter(
    (plan) => plan.status === "uploaded" || plan.status === "replaced",
  ).length;
  const reviewedCount = lessonPlans.filter(
    (plan) => plan.status === "reviewed",
  ).length;
  const archivedCount = lessonPlans.filter(
    (plan) => plan.status === "archived",
  ).length;

  return (
    <div className="space-y-4">
      <div>
        <h1 className="font-display text-2xl font-extrabold text-navy-950">
          Lesson plan review
        </h1>
        <details className="mt-3 max-w-3xl text-sm leading-7 text-slate-600">
          <summary className="cursor-pointer text-sm font-bold text-navy-950">
            More
          </summary>
          Review teacher lesson-plan uploads, download private files by signed
          URL, and archive old submissions.
        </details>
      </div>

      <MetricStrip
        items={[
          { label: "Submissions", value: lessonPlans.length },
          { label: "Pending", value: pendingCount },
          { label: "Reviewed", value: reviewedCount },
          { label: "Archived", value: archivedCount },
        ]}
      />

      <section className="rounded-lg border border-slate-200 bg-white p-4 shadow-soft">
        <div className="flex items-start gap-3">
          <span className="grid size-12 place-items-center rounded-lg bg-skybrand-50 text-skybrand-600">
            <FileText size={24} />
          </span>
          <div>
            <h2 className="font-display text-xl font-extrabold text-navy-950">
              Submitted lesson plans
            </h2>
          </div>
        </div>

        {lessonPlans.length ? (
          <div className="mt-4 grid gap-4">
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
                      <div className="flex flex-wrap gap-2">
                        <span
                          className={`rounded-full px-3 py-1 text-xs font-bold capitalize ${statusTone(plan.status)}`}
                        >
                          {statusLabel(plan.status)}
                        </span>
                        <span className="rounded-full bg-white px-3 py-1 text-xs font-bold text-slate-600">
                          {staffName(profileById.get(plan.teacher_id))}
                        </span>
                      </div>
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
                      Submitted {formatDateTime(plan.created_at)} - Updated{" "}
                      {formatDateTime(plan.updated_at)}
                    </p>
                  </div>

                  <details className="mt-4 rounded-lg border border-slate-200 bg-white p-4">
                    <summary className="inline-flex cursor-pointer items-center gap-2 text-sm font-bold text-navy-950">
                      <CheckCircle2 size={17} />
                      Review
                    </summary>
                    <form
                      action={reviewLessonPlanAction}
                      className="mt-4 grid gap-3 sm:grid-cols-[1fr_auto]"
                    >
                      <input
                        name="lessonPlanId"
                        type="hidden"
                        value={plan.id}
                      />
                      <label>
                        <span className="label">Review status</span>
                        <select
                          className="input"
                          defaultValue={plan.status}
                          name="status"
                        >
                          <option value="uploaded">Needs review</option>
                          <option value="reviewed">Reviewed</option>
                          <option value="archived">Archived</option>
                        </select>
                      </label>
                      <div className="flex items-end">
                        <SubmitButton pendingLabel="Saving review...">
                          {plan.status === "archived" ? (
                            <Archive size={17} />
                          ) : (
                            <CheckCircle2 size={17} />
                          )}
                          Save review
                        </SubmitButton>
                      </div>
                    </form>
                  </details>
                </article>
              );
            })}
          </div>
        ) : (
          <div className="mt-4">
            <EmptyState
              message="Teacher uploads will appear here after lesson plans are submitted."
              title="No lesson plans submitted"
            />
          </div>
        )}
      </section>
    </div>
  );
}
