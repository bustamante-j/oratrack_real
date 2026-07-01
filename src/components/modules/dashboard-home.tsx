"use client";

import Link from "next/link";
import {
  ArrowUpRight,
  BookOpenText,
  CalendarCheck,
  CalendarDots,
  ChalkboardTeacher,
  ChartLineUp,
  Database,
  FlagBanner,
  Rows,
  ShieldCheck,
  Sparkle,
  SquaresFour,
  UsersThree,
} from "@phosphor-icons/react";

import { DashboardGraphs } from "@/components/modules/dashboard-graphs";
import { MetricCard } from "@/components/ui/metric-card";
import type { DashboardSummary } from "@/types/dashboard";
import type { ModuleDefinition } from "@/types/domain";

const iconMap = {
  BookOpenText,
  CalendarCheck,
  CalendarDots,
  ChalkboardTeacher,
  ChartLineUp,
  Database,
  FlagBanner,
  Rows,
  ShieldCheck,
  SquaresFour,
  UsersThree,
};

export function DashboardHome({
  modules,
  title,
  description,
  summary,
}: {
  modules: ModuleDefinition[];
  title: string;
  description: string;
  summary?: DashboardSummary;
}) {
  const reportModule = modules.find((module) => module.id === "reports");
  const stats =
    summary?.stats ??
    modules.slice(0, 4).map((module) => ({
      label: module.title,
      value: module.phase,
      detail: module.summary,
      icon: "SquaresFour",
      tone: "sky" as const,
    }));
  const graphs = summary?.graphs ?? {
    phaseTrend: modules.map((module, index) => ({
      name: module.phase.replace("Phase ", "P"),
      value: index + 1,
    })),
    operationalFocus: modules.slice(0, 5).map((module) => ({
      name: module.title.split(" ")[0],
      value: module.capabilities.length,
    })),
    supportMix: modules.slice(0, 4).map((module) => ({
      name: module.id,
      value: module.auditEvents.length || 1,
    })),
  };
  const insights =
    summary?.insights ??
    modules.slice(0, 3).map((module) => ({
      title: module.title,
      text: module.summary,
      action: "Open module",
    }));

  return (
    <div className="space-y-6">
      <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-end">
        <div>
          <p className="mb-2 flex items-center gap-2 text-xs font-bold uppercase tracking-[0.18em] text-skybrand-600">
            <span className="h-px w-6 bg-skybrand-400" />
            School overview
          </p>
          <h1 className="text-balance font-display text-2xl font-extrabold tracking-tight text-navy-950 sm:text-3xl">
            {title}
          </h1>
          <details className="mt-2 max-w-2xl text-sm leading-6 text-slate-500">
            <summary className="cursor-pointer text-xs font-bold uppercase tracking-wide text-slate-500">
              Dashboard details
            </summary>
            <p className="mt-2">{description}</p>
          </details>
        </div>
        {reportModule ? (
          <Link
            className="inline-flex w-fit items-center gap-2 rounded-lg border border-slate-200 bg-white px-3 py-1.5 text-sm font-semibold text-navy-950 transition hover:border-slate-300 hover:bg-slate-50"
            href={reportModule.href}
          >
            View reports
            <ArrowUpRight size={16} weight="bold" />
          </Link>
        ) : null}
      </div>

      <div className="grid gap-x-5 rounded-lg border border-slate-200 bg-white px-4 shadow-soft sm:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-6">
        {stats.map((stat) => {
          const Icon =
            iconMap[stat.icon as keyof typeof iconMap] ?? SquaresFour;

          return (
            <MetricCard
              detail={stat.detail}
              icon={<Icon size={20} weight="duotone" />}
              key={stat.label}
              label={stat.label}
              tone={stat.tone}
              value={stat.value}
            />
          );
        })}
      </div>

      <DashboardGraphs data={graphs} />

      <details className="min-w-0 rounded-lg border border-slate-200 bg-white p-4 shadow-soft">
        <summary className="flex cursor-pointer list-none items-center justify-between gap-4">
          <div>
            <h2 className="font-display text-lg font-bold text-navy-950">
              Insights
            </h2>
          </div>
          <Sparkle
            className="shrink-0 text-skybrand-500"
            size={19}
            weight="fill"
          />
        </summary>
        <div className="mt-4 divide-y divide-slate-100 border-t border-slate-100">
          {insights.map((insight) => (
            <article className="py-3" key={insight.title}>
              <div className="flex gap-3">
                <span className="grid size-8 shrink-0 place-items-center text-skybrand-600">
                  <Sparkle size={16} weight="fill" />
                </span>
                <div className="min-w-0">
                  <h3 className="text-xs font-bold uppercase tracking-wide text-skybrand-600">
                    {insight.title}
                  </h3>
                  <p className="mt-1 text-sm leading-6 text-slate-700">
                    {insight.text}
                  </p>
                  <p className="mt-2 flex items-center gap-1 text-xs font-semibold text-navy-800">
                    {insight.action}
                    <ArrowUpRight size={13} />
                  </p>
                </div>
              </div>
            </article>
          ))}
        </div>
      </details>

      <div className="overflow-hidden rounded-lg border border-slate-200 bg-white shadow-soft">
        {modules.map((module) => (
          <article
            className="grid min-w-0 gap-3 border-t border-slate-100 p-4 first:border-t-0 sm:grid-cols-[8rem_minmax(0,1fr)_auto] sm:items-center"
            key={module.href}
          >
            <p className="text-xs font-bold uppercase text-skybrand-600">
              {module.phase}
            </p>
            <h2 className="text-balance font-display text-sm font-extrabold text-navy-950">
              {module.title}
            </h2>
            <div className="flex flex-wrap items-center gap-2 sm:justify-end">
              <Link
                className="inline-flex items-center gap-2 rounded-lg border border-slate-200 bg-white px-2.5 py-1.5 text-xs font-bold text-navy-950 transition hover:border-slate-300 hover:bg-slate-50"
                href={module.href}
              >
                Open
                <ArrowUpRight size={13} />
              </Link>
              <details className="rounded-lg border border-slate-200 bg-white px-2.5 py-1.5 text-xs text-slate-600">
                <summary className="cursor-pointer font-bold text-slate-700">
                  More
                </summary>
                <p className="mt-2 leading-5">{module.summary}</p>
                <ul className="mt-2 space-y-1">
                  {module.capabilities.slice(0, 3).map((capability) => (
                    <li key={capability}>{capability}</li>
                  ))}
                </ul>
              </details>
            </div>
          </article>
        ))}
      </div>
    </div>
  );
}
