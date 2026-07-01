import type { ReactNode } from "react";

export function EmptyState({
  title,
  message,
  action,
}: {
  title: string;
  message: string;
  action?: ReactNode;
}) {
  return (
    <div className="rounded-lg border border-dashed border-slate-200 bg-white p-4 text-center">
      <h2 className="font-display text-base font-extrabold text-navy-950">
        {title}
      </h2>
      <details className="mx-auto mt-2 max-w-2xl">
        <summary className="cursor-pointer text-xs font-bold uppercase text-slate-400 transition hover:text-navy-900">
          More
        </summary>
        <p className="mt-2 text-sm leading-6 text-slate-500">{message}</p>
      </details>
      {action ? <div className="mt-4">{action}</div> : null}
    </div>
  );
}
