"use client";

import Link from "next/link";
import type { ReactNode } from "react";
import {
  ArrowSquareOut,
  Bell,
  House,
  SignOut,
  UserCircle,
} from "@phosphor-icons/react";

import { FloatingAiLauncher } from "@/components/ai/floating-ai-launcher";
import { BrandLogo } from "@/components/brand-logo";
import { PortalNavLinks } from "@/components/layout/portal-nav";
import { logoutAction } from "@/lib/auth/actions";
import type { SessionState } from "@/lib/auth/session";
import { roleLabels, school } from "@/lib/constants";
import type { NavItem } from "@/types/domain";

export function AppShell({
  children,
  navItems,
  session,
  title,
}: {
  children: ReactNode;
  navItems: NavItem[];
  session: SessionState;
  title: string;
}) {
  const profile =
    session.kind === "authenticated"
      ? session.profile
      : {
          fullName: "Setup mode",
          email: "Supabase not connected",
          role: "admin_principal" as const,
        };
  const today = new Intl.DateTimeFormat("en-PH", {
    weekday: "short",
    month: "long",
    day: "numeric",
    year: "numeric",
  }).format(new Date());
  const initials = profile.fullName
    .split(" ")
    .filter(Boolean)
    .map((part) => part[0])
    .slice(0, 2)
    .join("")
    .toUpperCase();

  return (
    <div className="min-h-screen min-w-0 overflow-x-hidden bg-[#f7fafc]">
      <aside className="fixed inset-y-0 left-0 z-50 hidden w-64 overflow-hidden bg-navy-950 text-white lg:flex lg:flex-col">
        <div className="flex h-16 items-center border-b border-white/10 px-5">
          <Link className="flex items-center gap-3" href="/">
            <BrandLogo compact inverse />
          </Link>
        </div>
        <div className="border-b border-white/10 px-5 py-3">
          <p className="text-[11px] font-bold uppercase tracking-[0.14em] text-skybrand-300">
            {school.platform}
          </p>
          <p className="mt-1 font-display text-sm font-extrabold text-white">
            {title}
          </p>
        </div>
        <div className="scroll-soft flex-1 overflow-y-auto px-3 py-4">
          <PortalNavLinks navItems={navItems} />
        </div>
        <div className="border-t border-white/10 p-3">
          <div className="flex items-center gap-3 border-b border-white/10 pb-3">
            <span className="grid size-9 shrink-0 place-items-center rounded-lg bg-white text-xs font-extrabold text-navy-950">
              {initials || <UserCircle size={20} weight="duotone" />}
            </span>
            <div className="min-w-0">
              <p className="truncate text-sm font-semibold text-white">
                {profile.fullName}
              </p>
              <p className="truncate text-[11px] text-slate-300">
                {profile.email}
              </p>
              <p className="mt-1 text-[10px] font-bold uppercase tracking-wide text-skybrand-300">
                {roleLabels[profile.role]}
              </p>
            </div>
          </div>
          <form action={logoutAction} className="mt-3">
            <button
              className="flex w-full items-center justify-center gap-2 rounded-lg border border-white/10 px-3 py-2 text-xs font-bold text-slate-300 transition hover:bg-white/10 hover:text-white"
              type="submit"
            >
              <SignOut size={17} weight="duotone" />
              Log out
            </button>
          </form>
        </div>
      </aside>
      <div className="lg:pl-64">
        <header className="sticky top-0 z-20 flex h-16 items-center border-b border-slate-200 bg-white/95 px-4 backdrop-blur sm:px-6 lg:px-8">
          <div className="flex w-full items-center justify-between gap-4">
            <div className="flex min-w-0 items-center gap-3">
              <Link className="shrink-0 lg:hidden" href="/">
                <BrandLogo compact />
              </Link>
              <div className="min-w-0">
                <p className="hidden truncate text-xs text-slate-500 sm:block">
                  {today}
                </p>
                <p className="truncate font-display text-sm font-bold text-navy-950">
                  {title}
                </p>
              </div>
            </div>
            <div className="flex shrink-0 items-center gap-2 sm:gap-3">
              <button
                aria-label="Notifications"
                className="relative grid size-9 place-items-center rounded-lg text-slate-500 transition hover:bg-slate-100"
                type="button"
              >
                <Bell size={20} weight="duotone" />
                <span className="absolute right-2 top-2 size-2 rounded-full bg-rose-500 ring-2 ring-white" />
              </button>
              <Link
                className="inline-flex items-center gap-2 rounded-lg border border-slate-200 bg-white px-3 py-1.5 text-sm font-bold text-slate-700 transition hover:border-slate-300 hover:bg-slate-50 hover:text-navy-900"
                href="/"
              >
                <House size={17} weight="duotone" />
                <span className="hidden sm:inline">Public site</span>
                <ArrowSquareOut className="hidden sm:block" size={15} />
              </Link>
              <form action={logoutAction}>
                <button
                  className="inline-flex items-center gap-2 rounded-lg border border-slate-200 bg-white px-3 py-1.5 text-sm font-bold text-rose-600 transition hover:border-rose-200 hover:bg-rose-50"
                  type="submit"
                >
                  <SignOut size={17} weight="duotone" />
                  <span className="hidden sm:inline">Log out</span>
                </button>
              </form>
            </div>
          </div>
        </header>
        <div className="sticky top-16 z-10 border-b border-slate-200 bg-[#f7fafc]/95 backdrop-blur lg:hidden">
          <PortalNavLinks navItems={navItems} orientation="horizontal" />
        </div>
        {session.kind === "unconfigured" ? (
          <div className="border-b border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-950 sm:px-6 lg:px-8">
            Supabase is not connected yet. Routes are visible for build-out, but
            live auth, RLS, storage, and data operations need project
            credentials in `.env.local`.
          </div>
        ) : null}
        <main className="portal-shell min-h-[calc(100vh-4rem)] px-4 py-6 sm:px-6 lg:px-8">
          <div className="mx-auto w-full max-w-[96rem] min-w-0">{children}</div>
        </main>
        {session.kind === "authenticated" ? (
          <FloatingAiLauncher role={session.profile.role} />
        ) : null}
      </div>
    </div>
  );
}
