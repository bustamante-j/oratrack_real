import type { ReactNode } from "react";

type MetricStripItem = {
  label: ReactNode;
  value: ReactNode;
};

type MetricStripProps = {
  columns?: "three" | "four";
  items: MetricStripItem[];
};

export function MetricStrip({ columns = "four", items }: MetricStripProps) {
  const columnClass =
    columns === "three" ? "sm:grid-cols-3" : "sm:grid-cols-2 xl:grid-cols-4";
  const numericItems = items
    .map((item) => {
      const value =
        typeof item.value === "number"
          ? item.value
          : typeof item.value === "string"
            ? Number.parseFloat(item.value.replace(/[^\d.-]/g, ""))
            : Number.NaN;

      return {
        ...item,
        numericValue: Number.isFinite(value) ? value : null,
      };
    })
    .filter((item) => item.numericValue !== null);
  const maxValue = Math.max(
    1,
    ...numericItems.map((item) => item.numericValue ?? 0),
  );

  return (
    <section className="rounded-lg border border-slate-200 bg-white px-3 py-2 shadow-soft">
      <dl
        className={`grid divide-y divide-slate-100 sm:divide-y-0 ${columnClass}`}
      >
        {items.map((item, index) => (
          <div
            className="flex min-h-12 items-center justify-between gap-3 px-3 py-2"
            key={index}
          >
            <dt className="text-xs font-bold uppercase text-slate-500">
              {item.label}
            </dt>
            <dd className="text-xl font-extrabold text-navy-950">
              {item.value}
            </dd>
          </div>
        ))}
      </dl>
      {numericItems.length ? (
        <details className="border-t border-slate-100 px-3 py-2">
          <summary className="cursor-pointer text-xs font-bold uppercase text-slate-500">
            Show analytics
          </summary>
          <div className="mt-3 grid gap-2">
            {numericItems.map((item, index) => {
              const width = `${Math.max(
                4,
                Math.min(100, ((item.numericValue ?? 0) / maxValue) * 100),
              )}%`;

              return (
                <div
                  className="grid gap-2 sm:grid-cols-[9rem_minmax(0,1fr)_4rem] sm:items-center"
                  key={index}
                >
                  <p className="truncate text-xs font-bold uppercase text-slate-500">
                    {item.label}
                  </p>
                  <div className="h-2 rounded-full bg-slate-100">
                    <div
                      className="h-2 rounded-full bg-skybrand-500"
                      style={{ width }}
                    />
                  </div>
                  <p className="text-right text-xs font-bold text-navy-950">
                    {item.value}
                  </p>
                </div>
              );
            })}
          </div>
        </details>
      ) : null}
    </section>
  );
}
