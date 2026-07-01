"use client";

import type { ReactNode } from "react";
import { useState } from "react";
import { BarChart3, LayoutGrid, List, RotateCw, Table2 } from "lucide-react";

const modes = [
  { id: "cards", label: "Cards", icon: LayoutGrid },
  { id: "table", label: "Table", icon: Table2 },
  { id: "compact", label: "Compact", icon: List },
] as const;

type ViewMode = (typeof modes)[number]["id"];

export function ViewModePanel({
  analytics,
  cards,
  compact,
  label = "View",
  table,
}: {
  analytics?: ReactNode;
  cards: ReactNode;
  compact: ReactNode;
  label?: string;
  table: ReactNode;
}) {
  const [mode, setMode] = useState<ViewMode>("cards");
  const [analyticsOpen, setAnalyticsOpen] = useState(false);
  const modeIndex = modes.findIndex((item) => item.id === mode);

  return (
    <div className="space-y-3">
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-200 pb-3">
        <p className="text-[11px] font-bold uppercase text-slate-500">
          {modes[modeIndex]?.label ?? label}
        </p>
        <div className="scroll-soft flex max-w-full flex-wrap items-center gap-2 overflow-x-auto">
          <div
            aria-label={`${label} display mode`}
            className="inline-flex rounded-lg border border-slate-200 bg-white p-0.5 shadow-soft"
            role="group"
          >
            {modes.map(({ icon: Icon, id, label: modeLabel }) => (
              <button
                aria-pressed={mode === id}
                className={`inline-flex items-center gap-1 rounded-md px-2.5 py-1 text-xs font-bold transition ${
                  mode === id
                    ? "bg-navy-900 text-white"
                    : "text-slate-600 hover:bg-slate-50 hover:text-navy-900"
                }`}
                key={id}
                onClick={() => setMode(id)}
                type="button"
              >
                <Icon size={14} />
                {modeLabel}
              </button>
            ))}
          </div>
          <button
            aria-label="Cycle display mode"
            className="inline-flex items-center gap-2 rounded-lg border border-slate-200 bg-white px-2.5 py-1.5 text-xs font-bold text-slate-700 shadow-soft transition hover:border-slate-300 hover:bg-slate-50 hover:text-navy-900"
            onClick={() => setMode(modes[(modeIndex + 1) % modes.length].id)}
            type="button"
          >
            <RotateCw size={14} />
            Cycle
          </button>
          {analytics ? (
            <button
              aria-pressed={analyticsOpen}
              className={`inline-flex items-center gap-2 rounded-lg border px-2.5 py-1.5 text-xs font-bold transition ${
                analyticsOpen
                  ? "border-navy-900 bg-navy-900 text-white shadow-sm"
                  : "border-slate-200 bg-white text-slate-700 shadow-soft hover:border-slate-300 hover:bg-slate-50 hover:text-navy-900"
              }`}
              onClick={() => setAnalyticsOpen((current) => !current)}
              type="button"
            >
              <BarChart3 size={14} />
              Analytics
            </button>
          ) : null}
        </div>
      </div>
      {analyticsOpen && analytics ? (
        <div className="rounded-lg border border-slate-200 bg-white p-4 shadow-soft">
          {analytics}
        </div>
      ) : null}
      {mode === "cards" ? cards : mode === "table" ? table : compact}
    </div>
  );
}
