import type { ReactNode } from "react";
import { ChevronDown } from "lucide-react";

type ActionDisclosureProps = {
  children: ReactNode;
  className?: string;
  icon?: ReactNode;
  meta?: ReactNode;
  title: string;
};

export function ActionDisclosure({
  children,
  className = "",
  icon,
  meta,
  title,
}: ActionDisclosureProps) {
  return (
    <details
      className={`group rounded-lg border border-slate-200 bg-white px-3 py-2 shadow-soft transition open:border-skybrand-200 ${className}`}
    >
      <summary className="flex cursor-pointer list-none flex-wrap items-center justify-between gap-3 [&::-webkit-details-marker]:hidden">
        <span className="inline-flex min-h-9 items-center justify-center gap-2 rounded-lg border border-slate-200 bg-slate-50 px-3 py-1.5 text-sm font-bold text-navy-950 transition group-open:border-navy-900 group-open:bg-navy-900 group-open:text-white">
          {icon}
          {title}
        </span>
        <span className="ml-auto inline-flex items-center gap-3">
          {meta ? (
            <span className="text-xs font-bold uppercase text-slate-500">
              {meta}
            </span>
          ) : null}
          <ChevronDown
            className="text-slate-400 transition group-open:rotate-180 group-open:text-navy-900"
            size={18}
          />
        </span>
      </summary>
      <div className="mt-3 border-t border-slate-100 pt-4">{children}</div>
    </details>
  );
}
