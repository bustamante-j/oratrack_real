import type { ReactNode } from "react";

type MetricTone = "amber" | "green" | "navy" | "purple" | "red" | "sky";

const tones: Record<MetricTone, string> = {
  amber: "text-amber-600",
  green: "text-emerald-600",
  navy: "text-navy-900",
  purple: "text-violet-600",
  red: "text-rose-600",
  sky: "text-skybrand-600",
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
    <div className="min-w-0 border-b border-slate-200 py-3">
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <p className="text-xs font-semibold uppercase text-slate-500">
            {label}
          </p>
          <p className="mt-1 break-words font-display text-xl font-extrabold text-navy-950">
            {value}
          </p>
          <p className="mt-1 text-xs text-slate-500">{detail}</p>
        </div>
        {icon ? (
          <div className={`relative shrink-0 p-1 ${tones[tone]}`}>{icon}</div>
        ) : null}
      </div>
    </div>
  );
}
