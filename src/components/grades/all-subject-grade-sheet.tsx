"use client";

import { useMemo, useState } from "react";
import { Download, Save } from "lucide-react";

import { SubmitButton } from "@/components/ui/submit-button";

export type AllSubjectGradePeriod = {
  id: string;
  code: string;
  name: string;
};

export type AllSubjectGradeRow = {
  key: string;
  assignmentId: string;
  enrollmentId: string;
  learnerName: string;
  lrn: string;
  subjectCode: string;
  subjectName: string;
  grades: Record<string, number | null>;
};

function average(values: Array<number | null>) {
  const numeric = values.filter(
    (value): value is number => typeof value === "number",
  );

  if (!numeric.length) return null;

  return numeric.reduce((sum, value) => sum + value, 0) / numeric.length;
}

function formatAverage(value: number | null) {
  return value === null ? "N/A" : value.toFixed(2);
}

function valueKey(rowKey: string, periodId: string) {
  return `${rowKey}:${periodId}`;
}

export function AllSubjectGradeSheet({
  action,
  downloadHref,
  periods,
  rows,
}: {
  action: (formData: FormData) => void | Promise<void>;
  downloadHref: string;
  periods: AllSubjectGradePeriod[];
  rows: AllSubjectGradeRow[];
}) {
  const [values, setValues] = useState<Record<string, string>>(() => {
    const initial: Record<string, string> = {};

    for (const row of rows) {
      for (const period of periods) {
        const value = row.grades[period.id];
        initial[valueKey(row.key, period.id)] =
          typeof value === "number" ? String(value) : "";
      }
    }

    return initial;
  });
  const encodedCount = useMemo(
    () => Object.values(values).filter((value) => value.trim()).length,
    [values],
  );
  const classAverage = useMemo(() => {
    const numericValues = Object.values(values)
      .map((value) => (value.trim() ? Number(value) : null))
      .filter(
        (value): value is number =>
          typeof value === "number" && Number.isFinite(value),
      );

    return average(numericValues);
  }, [values]);

  if (!rows.length || !periods.length) {
    return (
      <div className="rounded-lg border border-dashed border-slate-300 bg-slate-50 p-4 text-sm text-slate-500">
        All-subject encoding appears after section assignments, grade periods,
        and enrolled learners are available.
      </div>
    );
  }

  return (
    <form
      action={action}
      className="overflow-hidden rounded-lg border border-slate-200 bg-white"
    >
      {periods.map((period) => (
        <input
          key={period.id}
          name="gradePeriodId"
          type="hidden"
          value={period.id}
        />
      ))}
      <div className="grid gap-4 border-b border-slate-200 bg-navy-950 px-4 py-4 text-white sm:grid-cols-[1fr_auto] sm:items-center">
        <div>
          <p className="text-[10px] font-extrabold uppercase tracking-[0.18em] text-skybrand-300">
            Class record
          </p>
          <h3 className="mt-1 font-display text-xl font-extrabold uppercase leading-tight">
            All-subject grade sheet
          </h3>
        </div>
        <div className="flex flex-wrap gap-2">
          <span className="border border-white/20 px-3 py-1.5 text-xs font-bold text-white">
            {encodedCount} encoded
          </span>
          <span className="border border-white/20 px-3 py-1.5 text-xs font-bold text-white">
            Avg {formatAverage(classAverage)}
          </span>
          <a
            className="inline-flex min-h-8 w-fit items-center justify-center gap-2 bg-white px-3 py-1.5 text-xs font-extrabold uppercase tracking-[0.12em] text-navy-950 transition hover:bg-skybrand-100"
            href={downloadHref}
          >
            <Download size={15} />
            Download grades
          </a>
        </div>
      </div>

      <div className="table-scroll scroll-soft">
        <table className="min-w-[980px] text-left text-sm">
          <thead className="bg-slate-50 text-xs font-bold uppercase text-slate-500">
            <tr>
              <th className="sticky left-0 z-10 bg-slate-50 px-4 py-3">
                Learner
              </th>
              <th className="px-4 py-3">Learning area</th>
              {periods.map((period) => (
                <th className="px-3 py-3 text-center" key={period.id}>
                  {period.code}
                </th>
              ))}
              <th className="px-4 py-3 text-center">Final</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 bg-white">
            {rows.map((row) => {
              const rowValues = periods.map((period) => {
                const value = values[valueKey(row.key, period.id)];
                return value?.trim() ? Number(value) : null;
              });
              const rowAverage = average(
                rowValues.filter(
                  (value): value is number =>
                    typeof value === "number" && Number.isFinite(value),
                ),
              );

              return (
                <tr key={row.key}>
                  <td className="sticky left-0 z-[1] bg-white px-4 py-3 shadow-[1px_0_0_#e2e8f0]">
                    <input name="rowKey" type="hidden" value={row.key} />
                    <input
                      name={`assignmentId-${row.key}`}
                      type="hidden"
                      value={row.assignmentId}
                    />
                    <input
                      name={`enrollmentId-${row.key}`}
                      type="hidden"
                      value={row.enrollmentId}
                    />
                    <p className="font-semibold text-navy-950">
                      {row.learnerName}
                    </p>
                    <p className="text-xs font-bold uppercase text-slate-500">
                      LRN {row.lrn}
                    </p>
                  </td>
                  <td className="px-4 py-3">
                    <p className="font-semibold text-navy-950">
                      {row.subjectCode}
                    </p>
                    <p className="text-xs text-slate-500">{row.subjectName}</p>
                  </td>
                  {periods.map((period) => {
                    const key = valueKey(row.key, period.id);

                    return (
                      <td className="px-3 py-3 text-center" key={period.id}>
                        <input
                          className="input mx-auto w-24 text-center font-semibold"
                          max="100"
                          min="0"
                          name={`grade-${row.key}-${period.id}`}
                          onChange={(event) =>
                            setValues((current) => ({
                              ...current,
                              [key]: event.target.value,
                            }))
                          }
                          step="0.01"
                          type="number"
                          value={values[key] ?? ""}
                        />
                      </td>
                    );
                  })}
                  <td className="px-4 py-3 text-center">
                    <span className="rounded-full bg-skybrand-50 px-3 py-1 text-xs font-bold text-navy-900">
                      {formatAverage(rowAverage)}
                    </span>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      <div className="flex justify-end border-t border-slate-200 bg-slate-50 p-4">
        <SubmitButton pendingLabel="Saving sheet...">
          <Save size={17} />
          Save sheet
        </SubmitButton>
      </div>
    </form>
  );
}
