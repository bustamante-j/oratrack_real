import { CalendarDays, CheckCircle2, Circle, Lock } from "lucide-react";

import { EmptyState } from "@/components/ui/empty-state";
import { SubmitButton } from "@/components/ui/submit-button";
import { createSupabaseServerClient } from "@/lib/supabase/server";

import {
  createSchoolYearAction,
  updateSchoolYearStatusAction,
} from "./actions";

export const metadata = {
  title: "School Years",
};

export default async function SchoolYearsPage() {
  const supabase = await createSupabaseServerClient();
  const { data, error } = await supabase
    .from("school_years")
    .select("id,name,starts_on,ends_on,status,created_at")
    .order("starts_on", { ascending: false });

  if (error) {
    throw new Error(error.message);
  }

  const schoolYears = data ?? [];
  const activeYear = schoolYears.find((year) => year.status === "active");

  return (
    <div className="space-y-8">
      <div>
        <p className="text-xs font-bold uppercase text-skybrand-600">Phase 4</p>
        <h1 className="mt-3 font-display text-3xl font-extrabold text-navy-950">
          School years
        </h1>
        <p className="mt-3 max-w-3xl text-sm leading-7 text-slate-600">
          Create the school-year containers used by learner enrollments,
          sections, attendance, grades, reports, and promotion history.
        </p>
      </div>

      <div className="grid gap-6 lg:grid-cols-[0.82fr_1.18fr]">
        <form
          action={createSchoolYearAction}
          className="rounded-[1.5rem] border border-slate-200 bg-white p-6 shadow-soft"
        >
          <div className="flex items-start gap-3">
            <span className="grid size-12 place-items-center rounded-2xl bg-skybrand-50 text-skybrand-600">
              <CalendarDays size={23} />
            </span>
            <div>
              <h2 className="font-display text-xl font-extrabold text-navy-950">
                Add school year
              </h2>
              <p className="mt-1 text-sm text-slate-500">
                New years start as draft. Activate after sections are ready.
              </p>
            </div>
          </div>

          <div className="mt-6 grid gap-4">
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
          </div>

          <div className="mt-6">
            <SubmitButton>Create school year</SubmitButton>
          </div>
        </form>

        <section className="rounded-[1.5rem] border border-slate-200 bg-white p-6 shadow-soft">
          <h2 className="font-display text-xl font-extrabold text-navy-950">
            Current setup
          </h2>
          {activeYear ? (
            <div className="mt-5 rounded-2xl border border-skybrand-200 bg-skybrand-50 p-5">
              <p className="text-xs font-bold uppercase text-skybrand-600">
                Active school year
              </p>
              <p className="mt-2 font-display text-2xl font-extrabold text-navy-950">
                {activeYear.name}
              </p>
              <p className="mt-1 text-sm text-slate-600">
                {activeYear.starts_on} to {activeYear.ends_on}
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

      <section className="rounded-[1.5rem] border border-slate-200 bg-white p-6 shadow-soft">
        <h2 className="font-display text-xl font-extrabold text-navy-950">
          School-year list
        </h2>
        {schoolYears.length ? (
          <div className="mt-5 overflow-hidden rounded-2xl border border-slate-200">
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
                      <div className="flex flex-wrap gap-2">
                        {(["active", "draft", "closed"] as const).map(
                          (status) => (
                            <form
                              action={updateSchoolYearStatusAction}
                              key={status}
                            >
                              <input name="id" type="hidden" value={year.id} />
                              <input
                                name="status"
                                type="hidden"
                                value={status}
                              />
                              <button
                                className="rounded-xl border border-slate-200 px-3 py-2 text-xs font-bold text-slate-600 transition hover:border-skybrand-300 hover:bg-skybrand-50 hover:text-navy-900 disabled:cursor-not-allowed disabled:opacity-45"
                                disabled={year.status === status}
                                type="submit"
                              >
                                Mark {status}
                              </button>
                            </form>
                          ),
                        )}
                      </div>
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
    </div>
  );
}
