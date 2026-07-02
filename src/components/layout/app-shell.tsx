"use client";

import Link from "next/link";
import type { ReactNode } from "react";
import { useState } from "react";
import {
  ArrowSquareOut,
  Bell,
  CaretDown,
  GearSix,
  House,
  SignOut,
  SidebarSimple,
  UserCircle,
} from "@phosphor-icons/react";

import { FloatingAiLauncher } from "@/components/ai/floating-ai-launcher";
import { BrandLogo } from "@/components/brand-logo";
import { PortalNavLinks } from "@/components/layout/portal-nav";
import { logoutAction } from "@/lib/auth/actions";
import type { SessionState } from "@/lib/auth/session";
import { roleLabels, school } from "@/lib/constants";
import type { NavItem, PortalNotification } from "@/types/domain";

function notificationTone(tone: PortalNotification["tone"]) {
  if (tone === "rose") return "bg-rose-500";
  if (tone === "amber") return "bg-amber-500";
  if (tone === "green") return "bg-emerald-500";
  if (tone === "sky") return "bg-skybrand-500";
  return "bg-slate-400";
}

export function AppShell({
  children,
  navItems,
  notifications = [],
  session,
  title,
}: {
  children: ReactNode;
  navItems: NavItem[];
  notifications?: PortalNotification[];
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
          avatarPath: null,
          avatarUrl: null,
        };
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
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
  const profilePath =
    profile.role === "admin_principal" ? "/admin/profile" : "/teacher/profile";
  const sidebarWidth = sidebarCollapsed ? "lg:w-24" : "lg:w-64";
  const contentOffset = sidebarCollapsed ? "lg:pl-24" : "lg:pl-64";
  const notificationCount = notifications.length;

  return (
    <div className="min-h-screen min-w-0 overflow-x-hidden bg-[#f3f7fb]">
      <aside
        className={`fixed inset-y-0 left-0 z-50 hidden overflow-hidden border-r border-white/10 bg-navy-950 text-white shadow-[18px_0_55px_rgba(7,27,51,.18)] transition-[width] duration-200 lg:flex lg:flex-col ${sidebarWidth}`}
      >
        <div
          className={`flex h-14 items-center border-b border-white/10 ${sidebarCollapsed ? "justify-center px-3" : "justify-between gap-2 px-4"}`}
        >
          {sidebarCollapsed ? null : (
            <Link className="flex items-center gap-3" href="/">
              <BrandLogo compact inverse showText />
            </Link>
          )}
          <button
            aria-label={
              sidebarCollapsed ? "Expand sidebar" : "Collapse sidebar"
            }
            className="grid size-9 shrink-0 place-items-center rounded-lg text-slate-300 transition hover:bg-white/10 hover:text-white"
            onClick={() => setSidebarCollapsed((current) => !current)}
            type="button"
          >
            <SidebarSimple size={19} weight="duotone" />
          </button>
        </div>
        {sidebarCollapsed ? null : (
          <div className="border-b border-white/10 bg-white/[.025] px-5 py-2.5">
            <p className="text-[11px] font-bold uppercase tracking-[0.14em] text-skybrand-300">
              {school.platform}
            </p>
            <p className="mt-0.5 truncate font-display text-sm font-extrabold text-white">
              {title}
            </p>
          </div>
        )}
        <div
          className={`scroll-soft flex-1 overflow-y-auto ${sidebarCollapsed ? "px-3 py-3" : "px-3 py-3"}`}
        >
          <PortalNavLinks collapsed={sidebarCollapsed} navItems={navItems} />
        </div>
      </aside>
      <div className={`transition-[padding] duration-200 ${contentOffset}`}>
        <header className="sticky top-0 z-20 flex h-14 items-center border-b border-slate-200/80 bg-white/95 px-4 shadow-[0_10px_30px_rgba(15,55,95,.05)] backdrop-blur-xl sm:px-5 lg:px-6">
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
            <div className="flex shrink-0 items-center gap-2">
              <details className="group/notifications relative">
                <summary
                  aria-label="Notifications"
                  className="relative grid size-9 cursor-pointer list-none place-items-center rounded-lg border border-transparent text-slate-500 transition hover:border-slate-200 hover:bg-slate-50 hover:text-navy-900 [&::-webkit-details-marker]:hidden"
                >
                  <Bell size={20} weight="duotone" />
                  {notificationCount ? (
                    <span className="absolute -right-1 -top-1 grid min-w-5 place-items-center rounded-full bg-rose-500 px-1 text-[10px] font-extrabold leading-5 text-white ring-2 ring-white">
                      {notificationCount}
                    </span>
                  ) : null}
                </summary>
                <div className="absolute right-0 mt-2 w-[min(22rem,calc(100vw-2rem))] rounded-lg border border-slate-200 bg-white p-2 shadow-[0_18px_55px_rgba(15,55,95,.18)]">
                  <div className="flex items-center justify-between gap-3 border-b border-slate-100 px-3 py-2">
                    <p className="text-sm font-extrabold text-navy-950">
                      Notifications
                    </p>
                    <span className="rounded-full bg-slate-100 px-2 py-1 text-[10px] font-extrabold uppercase text-slate-500">
                      {notificationCount ? `${notificationCount} open` : "Clear"}
                    </span>
                  </div>
                  {notificationCount ? (
                    <div className="max-h-80 overflow-y-auto py-1">
                      {notifications.map((notification) => (
                        <Link
                          className="grid grid-cols-[.65rem_1fr] gap-3 rounded-lg px-3 py-3 transition hover:bg-slate-50"
                          href={notification.href}
                          key={notification.id}
                        >
                          <span
                            className={`mt-1.5 size-2 rounded-full ${notificationTone(notification.tone)}`}
                          />
                          <span className="min-w-0">
                            <span className="block text-sm font-bold leading-5 text-navy-950">
                              {notification.title}
                            </span>
                            <span className="mt-1 block text-xs leading-5 text-slate-500">
                              {notification.detail}
                            </span>
                          </span>
                        </Link>
                      ))}
                    </div>
                  ) : (
                    <p className="px-3 py-5 text-sm leading-6 text-slate-500">
                      No pending school items right now.
                    </p>
                  )}
                </div>
              </details>
              <details className="group/profile relative">
                <summary className="flex cursor-pointer list-none items-center gap-2 rounded-lg border border-slate-200 bg-white px-2 py-1.5 transition hover:border-slate-300 hover:bg-slate-50 [&::-webkit-details-marker]:hidden">
                  <span
                    className="grid size-8 shrink-0 place-items-center overflow-hidden rounded-lg bg-navy-900 bg-cover bg-center text-xs font-extrabold text-white"
                    style={
                      profile.avatarUrl
                        ? { backgroundImage: `url(${profile.avatarUrl})` }
                        : undefined
                    }
                  >
                    {profile.avatarUrl
                      ? null
                      : initials || <UserCircle size={18} weight="duotone" />}
                  </span>
                  <span className="hidden min-w-0 text-left sm:block">
                    <span className="block max-w-40 truncate text-xs font-bold text-navy-950">
                      {profile.fullName}
                    </span>
                    <span className="block max-w-40 truncate text-[10px] font-bold uppercase text-slate-500">
                      {roleLabels[profile.role]}
                    </span>
                  </span>
                  <CaretDown
                    className="text-slate-400 transition group-open/profile:rotate-180"
                    size={14}
                    weight="bold"
                  />
                </summary>
                <div className="absolute right-0 mt-2 w-64 rounded-lg border border-slate-200 bg-white p-2 shadow-[0_18px_55px_rgba(15,55,95,.18)]">
                  <div className="border-b border-slate-100 px-3 py-2">
                    <p className="truncate text-sm font-bold text-navy-950">
                      {profile.fullName}
                    </p>
                    <p className="truncate text-xs text-slate-500">
                      {profile.email}
                    </p>
                    <p className="mt-1 text-[10px] font-bold uppercase text-skybrand-600">
                      {roleLabels[profile.role]}
                    </p>
                  </div>
                  <Link
                    className="mt-2 flex items-center gap-2 rounded-lg px-3 py-2 text-sm font-bold text-slate-700 transition hover:bg-slate-50 hover:text-navy-900"
                    href={profilePath}
                  >
                    <GearSix size={17} weight="duotone" />
                    Profile
                  </Link>
                  <Link
                    className="flex items-center gap-2 rounded-lg px-3 py-2 text-sm font-bold text-slate-700 transition hover:bg-slate-50 hover:text-navy-900"
                    href="/"
                  >
                    <House size={17} weight="duotone" />
                    Public site
                    <ArrowSquareOut className="ml-auto" size={14} />
                  </Link>
                  <form
                    action={logoutAction}
                    className="mt-1 border-t border-slate-100 pt-1"
                  >
                    <button
                      className="flex w-full items-center gap-2 rounded-lg px-3 py-2 text-sm font-bold text-rose-600 transition hover:bg-rose-50"
                      type="submit"
                    >
                      <SignOut size={17} weight="duotone" />
                      Log out
                    </button>
                  </form>
                </div>
              </details>
            </div>
          </div>
        </header>
        <div className="sticky top-14 z-10 border-b border-slate-200 bg-[#f7fafc]/95 backdrop-blur lg:hidden">
          <PortalNavLinks navItems={navItems} orientation="horizontal" />
        </div>
        {session.kind === "unconfigured" ? (
          <div className="border-b border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-950 sm:px-6 lg:px-8">
            Supabase is not connected yet. Routes are visible for build-out, but
            live auth, RLS, storage, and data operations need project
            credentials in `.env.local`.
          </div>
        ) : null}
        <main className="portal-shell min-h-[calc(100vh-3.5rem)] px-3 py-4 sm:px-4 lg:px-5">
          <div className="mx-auto w-full max-w-[96rem] min-w-0">{children}</div>
        </main>
        {session.kind === "authenticated" ? (
          <FloatingAiLauncher role={session.profile.role} />
        ) : null}
      </div>
    </div>
  );
}
