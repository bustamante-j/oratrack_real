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
    <div className="min-w-0 py-3">
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <p className="text-[11px] font-bold uppercase text-slate-500">
            {label}
          </p>
          <p className="mt-1 break-words font-display text-xl font-extrabold leading-tight text-navy-950">
            {value}
          </p>
          <p className="mt-1 line-clamp-2 text-xs leading-5 text-slate-500">
            {detail}
          </p>
        </div>
        {icon ? (
          <div
            className={`relative grid size-8 shrink-0 place-items-center rounded-lg bg-slate-50 ${tones[tone]}`}
          >
            {icon}
          </div>
        ) : null}
      </div>
    </div>
  );
}
