import {
  BookOpenCheck,
  CalendarDays,
  CheckCircle2,
  Circle,
  Lock,
} from "lucide-react";

import { EmptyState } from "@/components/ui/empty-state";
import { ActionDisclosure } from "@/components/ui/action-disclosure";
import { SubmitButton } from "@/components/ui/submit-button";
import { createSupabaseServerClient } from "@/lib/supabase/server";

import {
  createStandardGradePeriodsAction,
  createSchoolYearAction,
  updateSchoolYearStatusAction,
} from "./actions";

export const metadata = {
  title: "School Years",
};

type SchoolYear = {
  id: string;
  name: string;
  starts_on: string;
  ends_on: string;
  status: "draft" | "active" | "closed";
  created_at: string;
};

type GradePeriod = {
  id: string;
  school_year_id: string | null;
  code: string;
  name: string;
  sort_order: number;
};

export default async function SchoolYearsPage() {
  const supabase = await createSupabaseServerClient();
  const [schoolYearResult, gradePeriodResult] = await Promise.all([
    supabase
      .from("school_years")
      .select("id,name,starts_on,ends_on,status,created_at")
      .order("starts_on", { ascending: false }),
    supabase
      .from("grade_periods")
      .select("id,school_year_id,code,name,sort_order")
      .order("sort_order", { ascending: true }),
  ]);

  const firstError = schoolYearResult.error ?? gradePeriodResult.error;

  if (firstError) {
    throw new Error(firstError.message);
  }

  const schoolYears = (schoolYearResult.data ?? []) as SchoolYear[];
  const gradePeriods = (gradePeriodResult.data ?? []) as GradePeriod[];
  const activeYear = schoolYears.find((year) => year.status === "active");
  const periodsByYear = gradePeriods.reduce((map, period) => {
    if (!period.school_year_id) return map;

    const current = map.get(period.school_year_id) ?? [];
    current.push(period);
    map.set(period.school_year_id, current);
    return map;
  }, new Map<string, GradePeriod[]>());

  return (
    <div className="space-y-6">
      <div>
        <p className="text-xs font-bold uppercase text-skybrand-600">Phase 4</p>
        <h1 className="mt-3 font-display text-3xl font-extrabold text-navy-950">
          School years
        </h1>
        <details className="mt-3 max-w-3xl text-sm leading-7 text-slate-600">
          <summary className="cursor-pointer text-sm font-bold text-navy-950">
            More
          </summary>
          Create the school-year containers used by learner enrollments,
          sections, attendance, grades, reports, and promotion history.
        </details>
      </div>

      <div className="grid gap-6 lg:grid-cols-[0.82fr_1.18fr]">
        <ActionDisclosure
          icon={<CalendarDays size={17} />}
          meta="Name and dates"
          title="Add school year"
        >
          <form action={createSchoolYearAction} className="grid gap-4">
            <label>
              <span className="label">Name</span>
              <input
                className="input"
                name="name"
                placeholder="SY 2026-2027"
                required
              />
            </label>
            <div className="grid gap-4 sm:grid-cols-2">
              <label>
                <span className="label">Starts on</span>
                <input className="input" name="startsOn" required type="date" />
              </label>
              <label>
                <span className="label">Ends on</span>
                <input className="input" name="endsOn" required type="date" />
              </label>
            </div>
            <div>
              <SubmitButton>Create school year</SubmitButton>
            </div>
          </form>
        </ActionDisclosure>

        <section className="rounded-lg border border-slate-200 bg-white p-4 shadow-soft">
          <h2 className="font-display text-xl font-extrabold text-navy-950">
            Current setup
          </h2>
          {activeYear ? (
            <div className="mt-5 rounded-lg border border-skybrand-200 bg-skybrand-50 p-4">
              <p className="text-xs font-bold uppercase text-skybrand-600">
                Active school year
              </p>
              <p className="mt-2 font-display text-2xl font-extrabold text-navy-950">
                {activeYear.name}
              </p>
              <p className="mt-1 text-sm text-slate-600">
                {activeYear.starts_on} to {activeYear.ends_on}
              </p>
              <p className="mt-3 text-sm font-semibold text-navy-950">
                {(periodsByYear.get(activeYear.id) ?? []).length} grade periods
                configured
              </p>
            </div>
          ) : (
            <div className="mt-5">
              <EmptyState
                message="Create a school year, then mark it active before creating sections."
                title="No active school year"
              />
            </div>
          )}
        </section>
      </div>

      <section className="rounded-lg border border-slate-200 bg-white p-4 shadow-soft">
        <h2 className="font-display text-xl font-extrabold text-navy-950">
          School-year list
        </h2>
        {schoolYears.length ? (
          <div className="mt-5 overflow-hidden rounded-lg border border-slate-200">
            <table className="min-w-full text-left text-sm">
              <thead className="bg-slate-50 text-xs font-bold uppercase text-slate-500">
                <tr>
                  <th className="px-4 py-3">Name</th>
                  <th className="px-4 py-3">Dates</th>
                  <th className="px-4 py-3">Status</th>
                  <th className="px-4 py-3">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {schoolYears.map((year) => (
                  <tr key={year.id}>
                    <td className="px-4 py-4 font-semibold text-navy-950">
                      {year.name}
                    </td>
                    <td className="px-4 py-4 text-slate-600">
                      {year.starts_on} to {year.ends_on}
                    </td>
                    <td className="px-4 py-4">
                      <span className="inline-flex items-center gap-2 rounded-full bg-slate-100 px-3 py-1 text-xs font-bold text-slate-700">
                        {year.status === "active" ? (
                          <CheckCircle2
                            size={14}
                            className="text-skybrand-600"
                          />
                        ) : year.status === "closed" ? (
                          <Lock size={14} className="text-slate-500" />
                        ) : (
                          <Circle size={14} className="text-amber-500" />
                        )}
                        {year.status}
                      </span>
                    </td>
                    <td className="px-4 py-4">
                      <details className="group w-fit rounded-lg border border-slate-200 bg-white px-3 py-2">
                        <summary className="cursor-pointer list-none text-xs font-bold text-slate-600 [&::-webkit-details-marker]:hidden">
                          Change status
                        </summary>
                        <div className="mt-3 flex flex-wrap gap-2">
                          {(["active", "draft", "closed"] as const).map(
                            (status) => (
                              <form
                                action={updateSchoolYearStatusAction}
                                key={status}
                              >
                                <input
                                  name="id"
                                  type="hidden"
                                  value={year.id}
                                />
                                <input
                                  name="status"
                                  type="hidden"
                                  value={status}
                                />
                                <button
                                  className="rounded-lg border border-slate-200 px-3 py-2 text-xs font-bold text-slate-600 transition hover:border-skybrand-300 hover:bg-skybrand-50 hover:text-navy-900 disabled:cursor-not-allowed disabled:opacity-45"
                                  disabled={year.status === status}
                                  type="submit"
                                >
                                  Mark {status}
                                </button>
                              </form>
                            ),
                          )}
                        </div>
                      </details>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="mt-5">
            <EmptyState
              message="Production starts empty. Add the first school year to unlock section setup."
              title="No school years yet"
            />
          </div>
        )}
      </section>

      <section className="rounded-lg border border-slate-200 bg-white p-4 shadow-soft">
        <div className="flex items-start gap-3">
          <span className="grid size-12 place-items-center rounded-lg bg-skybrand-50 text-skybrand-600">
            <BookOpenCheck size={24} />
          </span>
          <div>
            <h2 className="font-display text-xl font-extrabold text-navy-950">
              Grade periods
            </h2>
          </div>
        </div>

        {schoolYears.length ? (
          <div className="mt-5 grid gap-4 lg:grid-cols-[0.8fr_1.2fr]">
            <ActionDisclosure
              className="bg-slate-50 shadow-none"
              icon={<BookOpenCheck size={17} />}
              meta="Quarter setup"
              title="Create quarters"
            >
              <form
                action={createStandardGradePeriodsAction}
                className="grid gap-4"
              >
                <label>
                  <span className="label">School year</span>
                  <select
                    className="input"
                    defaultValue={activeYear?.id ?? schoolYears[0]?.id}
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
                <div>
                  <SubmitButton>Create standard quarters</SubmitButton>
                </div>
              </form>
            </ActionDisclosure>

            <div className="overflow-hidden rounded-lg border border-slate-200">
              <table className="min-w-full text-left text-sm">
                <thead className="bg-slate-50 text-xs font-bold uppercase text-slate-500">
                  <tr>
                    <th className="px-4 py-3">School year</th>
                    <th className="px-4 py-3">Periods</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {schoolYears.map((year) => {
                    const periods = periodsByYear.get(year.id) ?? [];

                    return (
                      <tr key={year.id}>
                        <td className="px-4 py-4 font-semibold text-navy-950">
                          {year.name}
                        </td>
                        <td className="px-4 py-4">
                          {periods.length ? (
                            <div className="flex flex-wrap gap-2">
                              {periods.map((period) => (
                                <span
                                  className="rounded-full bg-skybrand-50 px-3 py-1 text-xs font-bold text-navy-900"
                                  key={period.id}
                                >
                                  {period.code} - {period.name}
                                </span>
                              ))}
                            </div>
                          ) : (
                            <span className="text-slate-500">
                              No periods yet
                            </span>
                          )}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        ) : (
          <div className="mt-5">
            <EmptyState
              message="Create a school year before adding grade periods."
              title="No school years yet"
            />
          </div>
        )}
      </section>
    </div>
  );
}
