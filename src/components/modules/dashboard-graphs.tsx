"use client";

import { useState } from "react";
import type { ReactNode } from "react";
import {
  Area,
  AreaChart,
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { ChartLineUp, Eye, EyeSlash } from "@phosphor-icons/react";

import type {
  DashboardGraphData,
  DashboardGraphDatum,
} from "@/types/dashboard";

const colors = ["#2ca7ed", "#0b2447", "#10b981", "#f59e0b", "#8b5cf6"];

const tooltipStyle = {
  border: "1px solid #e2e8f0",
  borderRadius: 14,
  boxShadow: "0 12px 30px rgba(15, 55, 95, .12)",
  fontSize: 12,
};

function ChartCard({
  title,
  description,
  children,
}: {
  title: string;
  description: string;
  children: ReactNode;
}) {
  return (
    <section className="card min-w-0 p-5">
      <div className="mb-4 flex items-start justify-between gap-4">
        <div>
          <h2 className="font-display text-lg font-bold text-navy-950">
            {title}
          </h2>
          <p className="mt-1 text-sm leading-6 text-slate-500">{description}</p>
        </div>
      </div>
      <div className="h-64 w-full">{children}</div>
    </section>
  );
}

function EmptyGraph() {
  return (
    <div className="flex h-full flex-col items-center justify-center rounded-2xl border border-dashed border-slate-200 bg-slate-50 text-center">
      <ChartLineUp size={28} weight="duotone" className="text-slate-300" />
      <p className="mt-3 text-sm font-semibold text-slate-500">
        No graph data yet
      </p>
    </div>
  );
}

function hasData(data: DashboardGraphDatum[]) {
  return data.some((item) => item.value > 0);
}

export function DashboardGraphs({ data }: { data: DashboardGraphData }) {
  const [visible, setVisible] = useState(true);

  return (
    <div className="space-y-4">
      <div className="flex flex-col justify-between gap-3 rounded-2xl border border-slate-200 bg-white/80 p-3 shadow-sm sm:flex-row sm:items-center">
        <div>
          <p className="font-display text-sm font-extrabold text-navy-950">
            Dashboard graphs
          </p>
          <p className="text-xs text-slate-500">
            Toggle charts on or off when you need a cleaner working view.
          </p>
        </div>
        <button
          className="inline-flex w-fit items-center gap-2 rounded-xl border border-slate-200 bg-white px-3 py-2 text-xs font-bold text-slate-700 transition hover:border-skybrand-300 hover:bg-skybrand-50 hover:text-navy-900"
          onClick={() => setVisible((current) => !current)}
          type="button"
        >
          {visible ? (
            <>
              <EyeSlash size={16} weight="duotone" />
              Hide graphs
            </>
          ) : (
            <>
              <Eye size={16} weight="duotone" />
              Show graphs
            </>
          )}
        </button>
      </div>

      {visible ? (
        <div className="grid gap-6 xl:grid-cols-[1.25fr_.75fr] 2xl:grid-cols-3">
          <ChartCard
            description="Cumulative module availability by build phase."
            title="Phase coverage"
          >
            {hasData(data.phaseTrend) ? (
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={data.phaseTrend} margin={{ left: -20 }}>
                  <defs>
                    <linearGradient
                      id="phaseTrendFill"
                      x1="0"
                      x2="0"
                      y1="0"
                      y2="1"
                    >
                      <stop
                        offset="5%"
                        stopColor="#2ca7ed"
                        stopOpacity={0.32}
                      />
                      <stop offset="95%" stopColor="#2ca7ed" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid
                    stroke="#e8eef5"
                    strokeDasharray="3 3"
                    vertical={false}
                  />
                  <XAxis
                    axisLine={false}
                    dataKey="name"
                    tick={{ fontSize: 11, fill: "#64748b" }}
                    tickLine={false}
                  />
                  <YAxis
                    allowDecimals={false}
                    axisLine={false}
                    tick={{ fontSize: 11, fill: "#64748b" }}
                    tickLine={false}
                  />
                  <Tooltip contentStyle={tooltipStyle} />
                  <Area
                    dataKey="value"
                    fill="url(#phaseTrendFill)"
                    name="Modules"
                    stroke="#1687ca"
                    strokeWidth={3}
                    type="monotone"
                  />
                </AreaChart>
              </ResponsiveContainer>
            ) : (
              <EmptyGraph />
            )}
          </ChartCard>

          <ChartCard
            description="Current volume from visible operational records."
            title="Operational focus"
          >
            {hasData(data.operationalFocus) ? (
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={data.operationalFocus} margin={{ left: -24 }}>
                  <CartesianGrid
                    stroke="#e8eef5"
                    strokeDasharray="3 3"
                    vertical={false}
                  />
                  <XAxis
                    axisLine={false}
                    dataKey="name"
                    tick={{ fontSize: 10, fill: "#64748b" }}
                    tickLine={false}
                  />
                  <YAxis
                    allowDecimals={false}
                    axisLine={false}
                    tick={{ fontSize: 11, fill: "#64748b" }}
                    tickLine={false}
                  />
                  <Tooltip contentStyle={tooltipStyle} />
                  <Bar dataKey="value" fill="#2ca7ed" radius={[7, 7, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            ) : (
              <EmptyGraph />
            )}
          </ChartCard>

          <ChartCard
            description="Support, risk, and follow-up load by visible category."
            title="Support mix"
          >
            {hasData(data.supportMix) ? (
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={data.supportMix}
                    dataKey="value"
                    innerRadius={58}
                    nameKey="name"
                    outerRadius={88}
                    paddingAngle={4}
                  >
                    {data.supportMix.map((entry, index) => (
                      <Cell
                        fill={colors[index % colors.length]}
                        key={entry.name}
                      />
                    ))}
                  </Pie>
                  <Tooltip contentStyle={tooltipStyle} />
                </PieChart>
              </ResponsiveContainer>
            ) : (
              <EmptyGraph />
            )}
          </ChartCard>
        </div>
      ) : null}
    </div>
  );
}
