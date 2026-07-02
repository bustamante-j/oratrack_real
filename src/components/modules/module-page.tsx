import { notFound } from "next/navigation";
import { CheckCircle2 } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { EmptyState } from "@/components/ui/empty-state";
import type { ModuleDefinition } from "@/types/domain";

export function ModulePage({
  module,
}: {
  module: ModuleDefinition | undefined;
}) {
  if (!module) notFound();

  return (
    <div className="space-y-4">
      <div>
        <h1 className="font-display text-2xl font-extrabold text-navy-950">
          {module.title}
        </h1>
        <details className="mt-3 max-w-3xl">
          <summary className="cursor-pointer text-xs font-bold uppercase text-slate-400 transition hover:text-navy-900">
            More
          </summary>
          <p className="mt-2 text-sm leading-7 text-slate-600">
            {module.summary}
          </p>
        </details>
      </div>

      <div className="grid gap-4">
        <section className="rounded-lg border border-slate-200 bg-white p-4 shadow-soft">
          <h2 className="font-display font-extrabold text-navy-950">
            Expected workflow
          </h2>
          <div className="mt-5 grid gap-3">
            {module.capabilities.map((capability) => (
              <div className="flex gap-3" key={capability}>
                <CheckCircle2
                  className="mt-0.5 shrink-0 text-skybrand-600"
                  size={18}
                />
                <p className="text-sm leading-6 text-slate-700">{capability}</p>
              </div>
            ))}
          </div>
        </section>
        <section className="rounded-lg border border-slate-200 bg-white p-4 shadow-soft">
          <h2 className="font-display font-extrabold text-navy-950">
            Audit coverage
          </h2>
          <div className="mt-4 flex flex-wrap gap-2">
            {module.auditEvents.map((event) => (
              <Badge key={event} tone="slate">
                {event}
              </Badge>
            ))}
          </div>
          <details className="mt-5">
            <summary className="cursor-pointer text-xs font-bold uppercase text-slate-400 transition hover:text-navy-900">
              More
            </summary>
            <p className="mt-2 text-sm leading-6 text-slate-600">
              Sensitive actions in this module should insert rows into
              `audit_logs` after authorization succeeds.
            </p>
          </details>
        </section>
      </div>

      <EmptyState message={module.emptyState} title="Empty production state" />
    </div>
  );
}
