"use client";

import Image from "next/image";
import Link from "next/link";
import { useState } from "react";
import { ArrowRight, X } from "@phosphor-icons/react";

import type { AppRole } from "@/types/domain";

export function FloatingAiLauncher({ role }: { role: AppRole }) {
  const [open, setOpen] = useState(false);
  const href = role === "admin_principal" ? "/admin/ai" : "/teacher/ai";
  const abilities = [
    "Summarize visible records",
    "Draft safe narratives",
    "Review before posting",
  ];

  return (
    <>
      <button
        aria-label="Open ORA AI drawer"
        className={`group fixed bottom-5 right-5 z-40 grid size-16 place-items-center rounded-2xl bg-white p-1.5 shadow-[0_18px_55px_rgba(7,27,51,.28)] ring-1 ring-slate-200 transition hover:-translate-y-1 hover:shadow-[0_22px_60px_rgba(44,167,237,.22)] focus-visible:outline focus-visible:outline-4 focus-visible:outline-skybrand-200 sm:bottom-7 sm:right-7 ${open ? "pointer-events-none scale-90 opacity-0" : ""}`}
        onClick={() => setOpen(true)}
        type="button"
      >
        <span className="relative grid size-full place-items-center overflow-hidden rounded-xl bg-white">
          <Image
            alt=""
            className="h-full w-full object-cover"
            height={64}
            src="/assets/ora-ai-logo.png"
            width={64}
          />
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
            <div className="relative overflow-hidden border-b border-slate-100 bg-navy-950 px-5 py-5 text-white">
              <div className="relative flex items-center gap-3">
                <div className="relative grid size-12 place-items-center overflow-hidden rounded-2xl bg-white shadow-lg">
                  <Image
                    alt=""
                    className="h-full w-full object-cover"
                    height={64}
                    src="/assets/ora-ai-logo.png"
                    width={64}
                  />
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
            </div>

            <div className="scroll-soft flex-1 overflow-y-auto bg-slate-50/70 p-4">
              <div className="grid gap-3">
                {abilities.map((title, index) => (
                  <article
                    className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm"
                    key={title}
                  >
                    <div className="flex items-center gap-3">
                      <span className="text-xs font-extrabold text-skybrand-600">
                        0{index + 1}
                      </span>
                      <h2 className="font-display text-sm font-extrabold text-navy-950">
                        {title}
                      </h2>
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
