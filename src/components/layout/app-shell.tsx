import Link from "next/link";
import type { ReactNode } from "react";
import { ArrowUpRight } from "lucide-react";

import { FloatingAiLauncher } from "@/components/ai/floating-ai-launcher";
import { BrandLogo } from "@/components/brand-logo";
import { PortalNavLinks } from "@/components/layout/portal-nav";
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

  return (
    <div className="min-h-screen min-w-0 overflow-x-hidden bg-[#f4f8fc]">
      <aside className="fixed inset-y-0 left-0 hidden w-72 border-r border-white/10 bg-navy-950 text-white lg:flex lg:flex-col">
        <div className="border-b border-white/10 p-5">
          <Link className="flex items-center gap-3" href="/">
            <BrandLogo compact inverse />
          </Link>
          <p className="mt-3 text-xs font-semibold text-skybrand-300">
            {title}
          </p>
        </div>
        <div className="flex-1 overflow-y-auto p-3">
          <PortalNavLinks navItems={navItems} />
        </div>
        <div className="border-t border-white/10 p-4">
          <p className="text-sm font-semibold text-white">{profile.fullName}</p>
          <p className="mt-1 text-xs text-slate-400">{profile.email}</p>
          <p className="mt-2 text-xs font-bold text-skybrand-300">
            {roleLabels[profile.role]}
          </p>
        </div>
      </aside>
      <div className="lg:pl-72">
        <header className="sticky top-0 z-20 border-b border-slate-200 bg-white/90 px-4 py-3 shadow-[0_10px_35px_rgba(7,27,51,.06)] backdrop-blur sm:px-6 lg:px-8">
          <div className="flex items-center justify-between gap-4">
            <div className="flex min-w-0 items-center gap-3 lg:hidden">
              <Link className="shrink-0 lg:hidden" href="/">
                <BrandLogo compact />
              </Link>
              <div className="min-w-0">
                <p className="truncate text-xs font-bold uppercase text-skybrand-600">
                  {school.platform}
                </p>
                <p className="truncate text-sm font-semibold text-navy-950">
                  {title}
                </p>
              </div>
            </div>
            <div className="hidden min-w-0 lg:block">
              <p className="text-xs font-bold uppercase text-skybrand-600">
                {school.platform}
              </p>
              <p className="text-sm font-semibold text-navy-950">{title}</p>
            </div>
            <Link
              className="inline-flex shrink-0 items-center gap-2 rounded-xl border border-slate-200 px-3 py-2 text-sm font-bold text-slate-700 transition hover:border-skybrand-300 hover:bg-skybrand-50 hover:text-navy-900"
              href="/"
            >
              <span className="hidden sm:inline">Public site</span>
              <span className="sm:hidden">Site</span>
              <ArrowUpRight size={15} />
            </Link>
          </div>
        </header>
        <div className="sticky top-[4.25rem] z-10 border-b border-slate-200 bg-[#f4f8fc]/95 shadow-[0_12px_28px_rgba(7,27,51,.05)] backdrop-blur lg:hidden">
          <PortalNavLinks navItems={navItems} orientation="horizontal" />
        </div>
        {session.kind === "unconfigured" ? (
          <div className="border-b border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-950 sm:px-6 lg:px-8">
            Supabase is not connected yet. Routes are visible for build-out, but
            live auth, RLS, storage, and data operations need project
            credentials in `.env.local`.
          </div>
        ) : null}
        <main className="portal-shell min-h-[calc(100vh-4.5rem)] px-4 py-8 sm:px-6 lg:px-8">
          <div className="mx-auto w-full max-w-[96rem] min-w-0">{children}</div>
        </main>
        {session.kind === "authenticated" ? (
          <FloatingAiLauncher role={session.profile.role} />
        ) : null}
      </div>
    </div>
  );
}
