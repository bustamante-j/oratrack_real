import type { ReactNode } from "react";

type MetricTone = "amber" | "green" | "navy" | "purple" | "red" | "sky";

const tones: Record<MetricTone, string> = {
  amber: "bg-amber-50 text-amber-600",
  green: "bg-emerald-50 text-emerald-600",
  navy: "bg-navy-900 text-white",
  purple: "bg-violet-50 text-violet-600",
  red: "bg-rose-50 text-rose-600",
  sky: "bg-skybrand-50 text-skybrand-600",
};

export function MetricCard({
  label,
  value,
  detail,
  icon,
  tone = "sky",
}: {
  label: string;
  value: string;
  detail: string;
  icon?: ReactNode;
  tone?: MetricTone;
}) {
  return (
    <div className="card group relative min-w-0 overflow-hidden p-4 hover:-translate-y-0.5 hover:border-skybrand-200 hover:shadow-[0_22px_55px_rgba(15,55,95,.12)] sm:p-5">
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">
            {label}
          </p>
          <p className="mt-2 break-words font-display text-2xl font-extrabold text-navy-950">
            {value}
          </p>
          <p className="mt-1 text-xs text-slate-500">{detail}</p>
        </div>
        {icon ? (
          <div
            className={`relative rounded-2xl p-3 shadow-sm transition duration-300 group-hover:-rotate-3 group-hover:scale-110 ${tones[tone]}`}
          >
            {icon}
          </div>
        ) : null}
      </div>
    </div>
  );
}
