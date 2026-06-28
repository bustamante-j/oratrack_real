"use client";

import Link from "next/link";
import { useState } from "react";
import {
  ArrowRight,
  Brain,
  Lightning,
  Robot,
  ShieldCheck,
  Sparkle,
  X,
} from "@phosphor-icons/react";

import type { AppRole } from "@/types/domain";

export function FloatingAiLauncher({ role }: { role: AppRole }) {
  const [open, setOpen] = useState(false);
  const href = role === "admin_principal" ? "/admin/ai" : "/teacher/ai";

  return (
    <>
      <button
        aria-label="Open ORA AI drawer"
        className={`group fixed bottom-5 right-5 z-40 flex items-center gap-3 rounded-2xl bg-gradient-to-r from-navy-950 to-skybrand-600 p-2 pr-4 text-white shadow-[0_18px_55px_rgba(7,27,51,.32)] transition hover:-translate-y-1 hover:shadow-[0_22px_60px_rgba(44,167,237,.32)] focus-visible:outline focus-visible:outline-4 focus-visible:outline-skybrand-200 sm:bottom-7 sm:right-7 ${open ? "pointer-events-none scale-90 opacity-0" : ""}`}
        onClick={() => setOpen(true)}
        type="button"
      >
        <span className="relative grid size-12 place-items-center rounded-xl bg-white text-navy-950">
          <Robot size={27} weight="duotone" />
          <Sparkle
            className="absolute -right-1 -top-1 text-amber-400"
            size={13}
            weight="fill"
          />
        </span>
        <span className="hidden text-left sm:block">
          <span className="block text-xs font-extrabold">Ask ORA</span>
          <span className="block text-[10px] text-skybrand-100">
            AI school agent
          </span>
        </span>
      </button>

      {open ? (
        <>
          <button
            aria-label="Close ORA AI drawer"
            className="fixed inset-0 z-[80] bg-navy-950/35 backdrop-blur-sm"
            onClick={() => setOpen(false)}
            type="button"
          />
          <aside className="fixed inset-y-0 left-0 right-0 z-[90] flex flex-col overflow-hidden bg-white shadow-[-25px_0_70px_rgba(7,27,51,.22)] transition sm:left-auto sm:w-[440px]">
            <button
              aria-label="Close ORA AI drawer"
              className="absolute right-3 top-3 z-10 grid size-9 place-items-center rounded-xl bg-white/10 text-white transition hover:bg-white/20"
              onClick={() => setOpen(false)}
              type="button"
            >
              <X size={19} weight="bold" />
            </button>
            <div className="relative overflow-hidden border-b border-slate-100 bg-gradient-to-br from-navy-950 via-navy-900 to-skybrand-600 px-5 py-5 text-white">
              <div className="relative flex items-center gap-3">
                <div className="relative grid size-12 place-items-center rounded-2xl bg-white text-navy-950 shadow-lg">
                  <Robot size={27} weight="duotone" />
                  <span className="absolute -bottom-1 -right-1 size-3.5 rounded-full border-2 border-navy-900 bg-emerald-400" />
                </div>
                <div className="min-w-0 pr-10">
                  <p className="font-display text-lg font-extrabold">
                    ORA Agent
                  </p>
                  <p className="text-xs text-skybrand-100">
                    Permission-aware school assistant
                  </p>
                </div>
              </div>
              <div className="relative mt-4 flex items-center gap-2 rounded-xl border border-white/10 bg-white/[.08] px-3 py-2 text-[11px] text-slate-200">
                <ShieldCheck
                  className="text-emerald-300"
                  size={16}
                  weight="duotone"
                />
                Drafts are read-only until reviewed in the full assistant.
              </div>
            </div>

            <div className="scroll-soft flex-1 overflow-y-auto bg-slate-50/70 p-4">
              <div className="grid gap-3">
                {[
                  {
                    icon: Brain,
                    title: "Summarize visible records",
                    text: "Ask for learner, class, or school summaries based on permitted data.",
                  },
                  {
                    icon: Lightning,
                    title: "Draft safe narratives",
                    text: "Prepare parent messages, intervention notes, and report language.",
                  },
                  {
                    icon: ShieldCheck,
                    title: "Review first",
                    text: "AI output is logged and kept as a suggestion until a user confirms it.",
                  },
                ].map(({ icon: Icon, title, text }) => (
                  <article
                    className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm"
                    key={title}
                  >
                    <div className="flex gap-3">
                      <span className="grid size-10 shrink-0 place-items-center rounded-xl bg-skybrand-50 text-skybrand-600">
                        <Icon size={20} weight="duotone" />
                      </span>
                      <div>
                        <h2 className="font-display text-sm font-extrabold text-navy-950">
                          {title}
                        </h2>
                        <p className="mt-1 text-sm leading-6 text-slate-600">
                          {text}
                        </p>
                      </div>
                    </div>
                  </article>
                ))}
              </div>
            </div>

            <div className="border-t border-slate-100 bg-white p-4">
              <Link
                className="inline-flex w-full items-center justify-center gap-2 rounded-xl bg-skybrand-500 px-4 py-3 text-sm font-extrabold text-white shadow-sm transition hover:bg-skybrand-600"
                href={href}
                onClick={() => setOpen(false)}
              >
                Open full AI assistant
                <ArrowRight size={17} weight="bold" />
              </Link>
            </div>
          </aside>
        </>
      ) : null}
    </>
  );
}
