import {
  CalendarClock,
  CheckCircle2,
  ClipboardPlus,
  MessageSquarePlus,
  Search,
  ShieldAlert,
  UserRoundCheck,
} from "lucide-react";

import { EmptyState } from "@/components/ui/empty-state";
import { SubmitButton } from "@/components/ui/submit-button";
import { requireAuthenticatedProfile } from "@/lib/auth/session";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { interventionStatuses, type InterventionStatus } from "@/types/domain";

import {
  addInterventionUpdateAction,
  createInterventionAction,
} from "./actions";

export const metadata = {
  title: "Interventions",
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
};

type Intervention = {
  id: string;
  learner_id: string;
  enrollment_id: string | null;
  teacher_id: string;
  category: string;
  status: InterventionStatus;
  started_on: string;
  follow_up_on: string | null;
  notes: string;
  created_at: string;
};

type InterventionUpdate = {
  id: string;
  intervention_id: string;
  status: InterventionStatus | null;
  notes: string;
  follow_up_on: string | null;
  created_at: string;
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

function formatDateTime(value: string) {
  return new Intl.DateTimeFormat("en", {
    month: "short",
    day: "numeric",
    year: "numeric",
    hour: "numeric",
    minute: "2-digit",
  }).format(new Date(value));
}

function gradeLabel(gradeById: Map<number, GradeLevel>, gradeId: number) {
  return gradeById.get(gradeId)?.label ?? "Grade";
}

function statusLabel(status: InterventionStatus) {
  return status[0].toUpperCase() + status.slice(1);
}

function statusTone(status: InterventionStatus) {
  if (status === "completed") return "bg-emerald-50 text-emerald-700";
  if (status === "ongoing") return "bg-skybrand-50 text-navy-900";
  if (status === "cancelled") return "bg-slate-100 text-slate-600";
  return "bg-amber-50 text-amber-700";
}

export default async function InterventionsPage({
  searchParams,
}: {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}) {
  const profile = await requireAuthenticatedProfile();
  const params = await searchParams;
  const query = firstSearchValue(params.q)?.trim().toLowerCase() ?? "";
  const statusFilter = firstSearchValue(params.status) ?? "";
  const supabase = await createSupabaseServerClient();
  const [
    schoolYearResult,
    gradeLevelResult,
    sectionResult,
    learnerResult,
    enrollmentResult,
    interventionResult,
    updateResult,
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
      .select("id,school_year_id,grade_level_id,name")
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
      .from("interventions")
      .select(
        "id,learner_id,enrollment_id,teacher_id,category,status,started_on,follow_up_on,notes,created_at",
      )
      .order("created_at", { ascending: false }),
    supabase
      .from("intervention_updates")
      .select("id,intervention_id,status,notes,follow_up_on,created_at")
      .order("created_at", { ascending: false }),
  ]);

  const firstError =
    schoolYearResult.error ??
    gradeLevelResult.error ??
    sectionResult.error ??
    learnerResult.error ??
    enrollmentResult.error ??
    interventionResult.error ??
    updateResult.error;

  if (firstError) {
    throw new Error(firstError.message);
  }

  const schoolYears = (schoolYearResult.data ?? []) as SchoolYear[];
  const gradeLevels = (gradeLevelResult.data ?? []) as GradeLevel[];
  const sections = (sectionResult.data ?? []) as Section[];
  const learners = (learnerResult.data ?? []) as Learner[];
  const enrollments = (enrollmentResult.data ?? []) as LearnerEnrollment[];
  const interventions = (interventionResult.data ?? []) as Intervention[];
  const updates = (updateResult.data ?? []) as InterventionUpdate[];

  const gradeById = new Map(gradeLevels.map((grade) => [grade.id, grade]));
  const yearById = new Map(schoolYears.map((year) => [year.id, year]));
  const sectionById = new Map(sections.map((section) => [section.id, section]));
  const learnerById = new Map(learners.map((learner) => [learner.id, learner]));
  const updatesByIntervention = updates.reduce((map, update) => {
    const current = map.get(update.intervention_id) ?? [];
    current.push(update);
    map.set(update.intervention_id, current);
    return map;
  }, new Map<string, InterventionUpdate[]>());
  const availableEnrollments = enrollments.filter((enrollment) => {
    const learner = learnerById.get(enrollment.learner_id);
    return (
      enrollment.enrollment_status === "enrolled" &&
      learner?.status === "active"
    );
  });
  const filteredInterventions = interventions.filter((intervention) => {
    const learner = learnerById.get(intervention.learner_id);
    const searchText = `${learner?.lrn ?? ""} ${
      learner ? learnerName(learner) : ""
    } ${intervention.category} ${intervention.notes}`.toLowerCase();
    const matchesQuery = query ? searchText.includes(query) : true;
    const matchesStatus = statusFilter
      ? intervention.status === statusFilter
      : true;

    return matchesQuery && matchesStatus;
  });
  const activeInterventions = interventions.filter(
    (intervention) =>
      intervention.status === "planned" || intervention.status === "ongoing",
  );
  const dueToday = todayDateValue();
  const dueFollowUps = activeInterventions.filter(
    (intervention) =>
      intervention.follow_up_on && intervention.follow_up_on <= dueToday,
  );
  const ownedInterventions = interventions.filter(
    (intervention) => intervention.teacher_id === profile.userId,
  );

  return (
    <div className="space-y-8">
      <div>
        <p className="text-xs font-bold uppercase text-skybrand-600">
          Phase 11
        </p>
        <h1 className="mt-3 font-display text-3xl font-extrabold text-navy-950">
          Interventions
        </h1>
        <p className="mt-3 max-w-3xl text-sm leading-7 text-slate-600">
          Record learner support actions, follow-up dates, and progress updates
          for the learners visible to your account.
        </p>
      </div>

      <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
        {[
          ["Visible learners", availableEnrollments.length],
          ["Active plans", activeInterventions.length],
          ["Due follow-ups", dueFollowUps.length],
          ["My records", ownedInterventions.length],
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

      <div className="grid gap-6 xl:grid-cols-[0.82fr_1.18fr]">
        <section className="rounded-[1.5rem] border border-slate-200 bg-white p-6 shadow-soft">
          <div className="flex items-start gap-3">
            <span className="grid size-12 place-items-center rounded-2xl bg-skybrand-50 text-skybrand-600">
              <ClipboardPlus size={24} />
            </span>
            <div>
              <h2 className="font-display text-xl font-extrabold text-navy-950">
                Add intervention
              </h2>
              <p className="mt-1 text-sm text-slate-500">
                Create a support record for one assigned learner.
              </p>
            </div>
          </div>

          {availableEnrollments.length ? (
            <form action={createInterventionAction} className="mt-6 grid gap-4">
              <label>
                <span className="label">Learner</span>
                <select className="input" name="enrollmentId" required>
                  {availableEnrollments.map((enrollment) => {
                    const learner = learnerById.get(enrollment.learner_id);
                    const section = enrollment.section_id
                      ? sectionById.get(enrollment.section_id)
                      : null;

                    return (
                      <option key={enrollment.id} value={enrollment.id}>
                        {learner ? learnerName(learner) : "Learner"} -{" "}
                        {section
                          ? `${gradeLabel(gradeById, section.grade_level_id)} ${section.name}`
                          : "No section"}
                      </option>
                    );
                  })}
                </select>
              </label>
              <div className="grid gap-4 sm:grid-cols-2">
                <label>
                  <span className="label">Category</span>
                  <input
                    className="input"
                    name="category"
                    placeholder="Reading support"
                    required
                  />
                </label>
                <label>
                  <span className="label">Status</span>
                  <select className="input" name="status" required>
                    {interventionStatuses.map((status) => (
                      <option key={status} value={status}>
                        {statusLabel(status)}
                      </option>
                    ))}
                  </select>
                </label>
              </div>
              <div className="grid gap-4 sm:grid-cols-2">
                <label>
                  <span className="label">Started on</span>
                  <input
                    className="input"
                    defaultValue={todayDateValue()}
                    name="startedOn"
                    required
                    type="date"
                  />
                </label>
                <label>
                  <span className="label">Follow-up on</span>
                  <input className="input" name="followUpOn" type="date" />
                </label>
              </div>
              <label>
                <span className="label">Notes</span>
                <textarea
                  className="input min-h-32"
                  name="notes"
                  required
                  placeholder="Action plan, observation, or parent coordination note"
                />
              </label>
              <SubmitButton pendingLabel="Creating intervention...">
                Create intervention
              </SubmitButton>
            </form>
          ) : (
            <div className="mt-6">
              <EmptyState
                message="Learners become available here once they are assigned to sections or subjects visible to your account."
                title="No visible learners"
              />
            </div>
          )}
        </section>

        <section className="rounded-[1.5rem] border border-slate-200 bg-white p-6 shadow-soft">
          <div className="flex flex-col gap-4 xl:flex-row xl:items-end xl:justify-between">
            <div className="flex items-start gap-3">
              <span className="grid size-12 place-items-center rounded-2xl bg-skybrand-50 text-skybrand-600">
                <ShieldAlert size={24} />
              </span>
              <div>
                <h2 className="font-display text-xl font-extrabold text-navy-950">
                  Intervention records
                </h2>
                <p className="mt-1 text-sm text-slate-500">
                  Review active and completed support actions.
                </p>
              </div>
            </div>

            <form className="grid gap-3 sm:grid-cols-[minmax(12rem,1fr)_10rem_auto]">
              <label>
                <span className="label">Search</span>
                <span className="relative block">
                  <Search
                    className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
                    size={17}
                  />
                  <input
                    className="input input-icon-left"
                    defaultValue={firstSearchValue(params.q) ?? ""}
                    name="q"
                    placeholder="LRN, name, category"
                  />
                </span>
              </label>
              <label>
                <span className="label">Status</span>
                <select
                  className="input"
                  defaultValue={statusFilter}
                  name="status"
                >
                  <option value="">All</option>
                  {interventionStatuses.map((status) => (
                    <option key={status} value={status}>
                      {statusLabel(status)}
                    </option>
                  ))}
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
          </div>

          {filteredInterventions.length ? (
            <div className="mt-6 grid gap-4">
              {filteredInterventions.map((intervention) => {
                const learner = learnerById.get(intervention.learner_id);
                const enrollment = intervention.enrollment_id
                  ? enrollments.find(
                      (item) => item.id === intervention.enrollment_id,
                    )
                  : null;
                const section = enrollment?.section_id
                  ? sectionById.get(enrollment.section_id)
                  : null;
                const interventionUpdates =
                  updatesByIntervention.get(intervention.id) ?? [];
                const canUpdate =
                  profile.role === "admin_principal" ||
                  intervention.teacher_id === profile.userId;

                return (
                  <article
                    className="rounded-[1.25rem] border border-slate-200 bg-slate-50 p-5"
                    key={intervention.id}
                  >
                    <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
                      <div>
                        <div className="flex flex-wrap gap-2">
                          <span
                            className={`rounded-full px-3 py-1 text-xs font-bold ${statusTone(intervention.status)}`}
                          >
                            {statusLabel(intervention.status)}
                          </span>
                          <span className="rounded-full bg-white px-3 py-1 text-xs font-bold text-slate-600">
                            {intervention.category}
                          </span>
                        </div>
                        <h3 className="mt-4 font-display text-xl font-extrabold text-navy-950">
                          {learner ? learnerName(learner) : "Learner"}
                        </h3>
                        <p className="mt-1 text-sm text-slate-500">
                          {learner?.lrn ? `LRN ${learner.lrn}` : "No LRN"} ·{" "}
                          {section
                            ? `${yearById.get(section.school_year_id)?.name ?? "School year"} - ${gradeLabel(gradeById, section.grade_level_id)} ${section.name}`
                            : "No section"}
                        </p>
                      </div>
                      <div className="grid gap-2 text-sm text-slate-600">
                        <span className="inline-flex items-center gap-2">
                          <CalendarClock size={16} />
                          Started {formatDate(intervention.started_on)}
                        </span>
                        <span className="inline-flex items-center gap-2">
                          <UserRoundCheck size={16} />
                          Follow-up{" "}
                          {intervention.follow_up_on
                            ? formatDate(intervention.follow_up_on)
                            : "unscheduled"}
                        </span>
                      </div>
                    </div>

                    <p className="mt-4 rounded-2xl bg-white p-4 text-sm leading-6 text-slate-700">
                      {intervention.notes}
                    </p>

                    <details className="mt-4 rounded-2xl border border-slate-200 bg-white p-4">
                      <summary className="cursor-pointer text-sm font-bold text-navy-950">
                        Updates ({interventionUpdates.length})
                      </summary>
                      {interventionUpdates.length ? (
                        <div className="mt-4 grid gap-3">
                          {interventionUpdates.slice(0, 4).map((update) => (
                            <div
                              className="rounded-xl bg-slate-50 p-3 text-sm text-slate-600"
                              key={update.id}
                            >
                              <div className="flex flex-wrap items-center gap-2">
                                {update.status ? (
                                  <span
                                    className={`rounded-full px-3 py-1 text-xs font-bold ${statusTone(update.status)}`}
                                  >
                                    {statusLabel(update.status)}
                                  </span>
                                ) : null}
                                <span className="text-xs font-bold uppercase text-slate-500">
                                  {formatDateTime(update.created_at)}
                                </span>
                              </div>
                              <p className="mt-2 leading-6">{update.notes}</p>
                            </div>
                          ))}
                        </div>
                      ) : (
                        <p className="mt-4 text-sm text-slate-500">
                          No updates yet.
                        </p>
                      )}
                    </details>

                    {canUpdate ? (
                      <details className="mt-4 rounded-2xl border border-slate-200 bg-white p-4">
                        <summary className="inline-flex cursor-pointer items-center gap-2 text-sm font-bold text-navy-950">
                          <MessageSquarePlus size={17} />
                          Add progress update
                        </summary>
                        <form
                          action={addInterventionUpdateAction}
                          className="mt-4 grid gap-4"
                        >
                          <input
                            name="interventionId"
                            type="hidden"
                            value={intervention.id}
                          />
                          <div className="grid gap-4 sm:grid-cols-2">
                            <label>
                              <span className="label">Status</span>
                              <select
                                className="input"
                                defaultValue={intervention.status}
                                name="status"
                                required
                              >
                                {interventionStatuses.map((status) => (
                                  <option key={status} value={status}>
                                    {statusLabel(status)}
                                  </option>
                                ))}
                              </select>
                            </label>
                            <label>
                              <span className="label">Follow-up on</span>
                              <input
                                className="input"
                                defaultValue={intervention.follow_up_on ?? ""}
                                name="followUpOn"
                                type="date"
                              />
                            </label>
                          </div>
                          <label>
                            <span className="label">Update notes</span>
                            <textarea
                              className="input min-h-28"
                              name="notes"
                              required
                            />
                          </label>
                          <SubmitButton pendingLabel="Saving update...">
                            <CheckCircle2 size={17} />
                            Save update
                          </SubmitButton>
                        </form>
                      </details>
                    ) : null}
                  </article>
                );
              })}
            </div>
          ) : (
            <div className="mt-6">
              <EmptyState
                message="No intervention records match the current filter."
                title="No interventions found"
              />
            </div>
          )}
        </section>
      </div>
    </div>
  );
}
