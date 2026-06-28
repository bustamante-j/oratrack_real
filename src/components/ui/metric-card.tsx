import type { ReactNode } from "react";

export function MetricCard({
  label,
  value,
  detail,
  icon,
}: {
  label: string;
  value: string;
  detail: string;
  icon?: ReactNode;
}) {
  return (
    <div className="min-w-0 rounded-[1.35rem] border border-slate-200 bg-white p-4 shadow-soft transition hover:-translate-y-1 hover:border-skybrand-300 hover:shadow-glow sm:p-5">
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <p className="text-sm font-semibold text-slate-500">{label}</p>
          <p className="mt-2 break-words font-display text-2xl font-extrabold text-navy-950">
            {value}
          </p>
        </div>
        {icon ? <div className="text-skybrand-600">{icon}</div> : null}
      </div>
      <p className="mt-3 text-sm text-slate-600">{detail}</p>
    </div>
  );
}
