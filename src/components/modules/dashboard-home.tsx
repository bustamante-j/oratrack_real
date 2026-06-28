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
    <div className="space-y-8">
      <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-end">
        <div>
          <p className="mb-2 flex items-center gap-2 text-xs font-bold uppercase tracking-[0.18em] text-skybrand-600">
            <span className="h-px w-6 bg-skybrand-400" />
            School overview
          </p>
          <h1 className="text-balance font-display text-2xl font-extrabold tracking-tight text-navy-950 sm:text-3xl">
            {title}
          </h1>
          <p className="mt-1 max-w-2xl text-sm leading-6 text-slate-500">
            {description}
          </p>
        </div>
        {reportModule ? (
          <Link
            className="inline-flex w-fit items-center gap-2 rounded-xl bg-navy-900 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-navy-800"
            href={reportModule.href}
          >
            View reports
            <ArrowUpRight size={16} weight="bold" />
          </Link>
        ) : null}
      </div>

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-6">
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

      <section className="card min-w-0 p-5">
        <div className="mb-4 flex items-start justify-between gap-4">
          <div>
            <h2 className="font-display text-lg font-bold text-navy-950">
              AI school insights
            </h2>
            <p className="mt-1 text-sm text-slate-500">
              Signals from visible dashboard records.
            </p>
          </div>
          <Sparkle
            className="shrink-0 text-skybrand-500"
            size={19}
            weight="fill"
          />
        </div>
        <div className="space-y-3">
          {insights.map((insight) => (
            <article
              className="rounded-2xl border border-skybrand-200 bg-gradient-to-br from-skybrand-50 to-white p-4"
              key={insight.title}
            >
              <div className="flex gap-3">
                <span className="grid size-9 shrink-0 place-items-center rounded-xl bg-navy-900 text-white">
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
      </section>

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
        {modules.map((module) => (
          <Link
            className="shine-card card min-w-0 p-5 transition hover:-translate-y-1 hover:border-skybrand-300 hover:shadow-glow"
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
