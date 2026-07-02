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
const graphModes = [
  { id: "area", label: "Area" },
  { id: "bar", label: "Bars" },
  { id: "table", label: "Table" },
] as const;

type GraphMode = (typeof graphModes)[number]["id"];

const tooltipStyle = {
  border: "1px solid #e2e8f0",
  borderRadius: 8,
  boxShadow: "0 4px 14px rgba(15, 55, 95, .08)",
  fontSize: 12,
};

function ChartCard({
  title,
  children,
}: {
  title: string;
  children: ReactNode;
}) {
  return (
    <section className="min-w-0 rounded-lg border border-slate-200 bg-white p-4 shadow-soft">
      <div className="mb-3 flex items-start justify-between gap-4">
        <div>
          <h2 className="font-display text-base font-bold text-navy-950">
            {title}
          </h2>
        </div>
      </div>
      <div className="h-56 w-full">{children}</div>
    </section>
  );
}

function EmptyGraph() {
  return (
    <div className="flex h-full flex-col items-center justify-center rounded-lg border border-dashed border-slate-200 bg-slate-50 text-center">
      <ChartLineUp size={28} weight="duotone" className="text-slate-300" />
    </div>
  );
}

function hasData(data: DashboardGraphDatum[]) {
  return data.some((item) => item.value > 0);
}

function BarGraph({ data }: { data: DashboardGraphDatum[] }) {
  return hasData(data) ? (
    <ResponsiveContainer width="100%" height="100%">
      <BarChart data={data} margin={{ left: -24 }}>
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
  );
}

function TableGraph({ data }: { data: DashboardGraphDatum[] }) {
  return hasData(data) ? (
    <div className="h-full overflow-auto rounded-lg border border-slate-200">
      <table className="min-w-full text-left text-sm">
        <thead className="bg-slate-50 text-xs font-bold uppercase text-slate-500">
          <tr>
            <th className="px-4 py-3">Label</th>
            <th className="px-4 py-3 text-right">Value</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-slate-100">
          {data.map((item) => (
            <tr key={item.name}>
              <td className="px-4 py-3 font-semibold text-navy-950">
                {item.name}
              </td>
              <td className="px-4 py-3 text-right font-bold text-slate-700">
                {item.value}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  ) : (
    <EmptyGraph />
  );
}

export function DashboardGraphs({ data }: { data: DashboardGraphData }) {
  const [visible, setVisible] = useState(true);
  const [mode, setMode] = useState<GraphMode>("area");

  return (
    <div className="space-y-4">
      <div className="flex flex-col justify-between gap-3 border-b border-slate-200 pb-3 sm:flex-row sm:items-center">
        <div>
          <p className="font-display text-sm font-extrabold text-navy-950">
            Analytics
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          {visible ? (
            <div className="inline-flex rounded-lg border border-slate-200 bg-white p-0.5">
              {graphModes.map((item) => (
                <button
                  aria-pressed={mode === item.id}
                  className={`rounded-md px-2.5 py-1 text-xs font-bold transition ${
                    mode === item.id
                      ? "bg-navy-900 text-white"
                      : "text-slate-600 hover:bg-slate-50 hover:text-navy-900"
                  }`}
                  key={item.id}
                  onClick={() => setMode(item.id)}
                  type="button"
                >
                  {item.label}
                </button>
              ))}
            </div>
          ) : null}
          <button
            className="inline-flex w-fit items-center gap-2 rounded-lg border border-slate-200 bg-white px-2.5 py-1.5 text-xs font-bold text-slate-700 transition hover:border-slate-300 hover:bg-slate-50 hover:text-navy-900"
            onClick={() => setVisible((current) => !current)}
            type="button"
          >
            {visible ? (
              <>
                <EyeSlash size={16} weight="duotone" />
                Hide
              </>
            ) : (
              <>
                <Eye size={16} weight="duotone" />
                Show
              </>
            )}
          </button>
        </div>
      </div>

      {visible ? (
        <div className="grid gap-4">
          <ChartCard title="Module coverage">
            {mode === "table" ? (
              <TableGraph data={data.phaseTrend} />
            ) : mode === "bar" ? (
              <BarGraph data={data.phaseTrend} />
            ) : hasData(data.phaseTrend) ? (
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

          <ChartCard title="Operational focus">
            {mode === "table" ? (
              <TableGraph data={data.operationalFocus} />
            ) : (
              <BarGraph data={data.operationalFocus} />
            )}
          </ChartCard>

          <ChartCard title="Support mix">
            {mode === "table" ? (
              <TableGraph data={data.supportMix} />
            ) : mode === "bar" ? (
              <BarGraph data={data.supportMix} />
            ) : hasData(data.supportMix) ? (
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
