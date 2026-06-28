import Link from "next/link";

import { MetricCard } from "@/components/ui/metric-card";
import type { ModuleDefinition } from "@/types/domain";

export function DashboardHome({
  modules,
  title,
  description,
}: {
  modules: ModuleDefinition[];
  title: string;
  description: string;
}) {
  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-balance font-display text-2xl font-extrabold text-navy-950 sm:text-3xl">
          {title}
        </h1>
        <p className="mt-3 max-w-3xl text-sm leading-7 text-slate-600">
          {description}
        </p>
      </div>
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
        <MetricCard
          detail="No learner, grade, or attendance records are seeded by default."
          label="Production data"
          value="Empty"
        />
        <MetricCard
          detail="Each module documents the sensitive events it must audit."
          label="Audit posture"
          value="Designed"
        />
        <MetricCard
          detail="Supabase credentials are the next required intervention."
          label="Integration"
          value="Pending"
        />
      </div>
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
        {modules.map((module) => (
          <Link
            className="shine-card min-w-0 rounded-[1.5rem] border border-slate-200 bg-white p-5 shadow-soft transition hover:-translate-y-1 hover:border-skybrand-300 hover:shadow-glow"
            href={module.href}
            key={module.href}
          >
            <p className="text-xs font-bold uppercase text-skybrand-600">
              {module.phase}
            </p>
            <h2 className="mt-3 text-balance font-display font-extrabold text-navy-950">
              {module.title}
            </h2>
            <p className="mt-2 text-sm leading-6 text-slate-600">
              {module.summary}
            </p>
          </Link>
        ))}
      </div>
    </div>
  );
}
