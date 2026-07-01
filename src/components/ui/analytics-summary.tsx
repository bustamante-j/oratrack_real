type AnalyticsItem = {
  label: string;
  value: number;
  total?: number;
};

export function AnalyticsSummary({
  items,
  title = "Analytics",
}: {
  items: AnalyticsItem[];
  title?: string;
}) {
  const maxValue = Math.max(
    1,
    ...items.map((item) => item.total ?? item.value),
  );

  return (
    <div>
      <h3 className="font-display text-sm font-extrabold text-navy-950">
        {title}
      </h3>
      <div className="mt-3 grid gap-3">
        {items.map((item) => {
          const denominator = item.total ?? maxValue;
          const width = `${Math.max(
            item.value ? 4 : 0,
            Math.min(100, (item.value / Math.max(1, denominator)) * 100),
          )}%`;

          return (
            <div className="grid gap-2" key={item.label}>
              <div className="flex items-center justify-between gap-3">
                <p className="text-xs font-bold uppercase text-slate-500">
                  {item.label}
                </p>
                <p className="text-xs font-bold text-navy-950">
                  {item.value}
                  {item.total ? ` / ${item.total}` : ""}
                </p>
              </div>
              <div className="h-2 rounded-full bg-white">
                <div
                  className="h-2 rounded-full bg-skybrand-500"
                  style={{ width }}
                />
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
