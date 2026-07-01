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
      <h2 className="font-display text-lg font-extrabold text-navy-950">
        {title}
      </h2>
      <p className="mx-auto mt-2 max-w-2xl text-sm leading-6 text-slate-500">
        {message}
      </p>
      {action ? <div className="mt-4">{action}</div> : null}
    </div>
  );
}
