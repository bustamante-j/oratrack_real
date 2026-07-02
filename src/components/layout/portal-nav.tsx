"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  ArrowsClockwise,
  BookOpenText,
  CalendarCheck,
  CalendarDots,
  CaretDown,
  Certificate,
  ChalkboardTeacher,
  ChartLineUp,
  Exam,
  FileText,
  FlagBanner,
  GearSix,
  Notebook,
  Robot,
  Rows,
  SquaresFour,
  Student,
  UsersThree,
} from "@phosphor-icons/react";

import { cn } from "@/lib/utils";
import type { NavItem } from "@/types/domain";

const iconMap = {
  ArrowsClockwise,
  BookOpenText,
  CalendarCheck,
  CalendarDots,
  Certificate,
  ChalkboardTeacher,
  ChartLineUp,
  Exam,
  FileText,
  FlagBanner,
  GearSix,
  Notebook,
  Robot,
  Rows,
  SquaresFour,
  Student,
  UsersThree,
};

function isActivePath(pathname: string, href: string) {
  if (href === "/admin" || href === "/teacher") return pathname === href;

  return pathname === href || pathname.startsWith(`${href}/`);
}

function itemIcon(icon: string | undefined) {
  if (!icon) return null;

  return iconMap[icon as keyof typeof iconMap] ?? null;
}

function groupedNavItems(navItems: NavItem[]) {
  const groups: Array<{ label: string; items: NavItem[] }> = [];

  navItems.forEach((item) => {
    const label = item.group ?? "Main";
    const current = groups.find((group) => group.label === label);

    if (current) {
      current.items.push(item);
    } else {
      groups.push({ label, items: [item] });
    }
  });

  return groups;
}

export function PortalNavLinks({
  collapsed = false,
  navItems,
  orientation = "vertical",
}: {
  collapsed?: boolean;
  navItems: NavItem[];
  orientation?: "vertical" | "horizontal";
}) {
  const pathname = usePathname();

  if (orientation === "horizontal") {
    return (
      <nav
        aria-label="Portal sections"
        className="scroll-soft flex gap-2 overflow-x-auto px-4 py-2.5 sm:px-6 lg:hidden"
      >
        {navItems.map((item) => {
          const active = isActivePath(pathname, item.href);
          const Icon = itemIcon(item.icon);

          return (
            <Link
              aria-current={active ? "page" : undefined}
              className={cn(
                "inline-flex shrink-0 items-center gap-2 rounded-lg border px-3 py-1.5 text-xs font-bold transition",
                active
                  ? "border-navy-900 bg-navy-900 text-white shadow-sm"
                  : "border-slate-200 bg-white text-slate-600 hover:border-slate-300 hover:bg-slate-50 hover:text-navy-900",
              )}
              href={item.href}
              key={item.href}
            >
              {Icon ? <Icon size={16} weight="duotone" /> : null}
              {item.label}
            </Link>
          );
        })}
      </nav>
    );
  }

  if (collapsed) {
    return (
      <nav className="space-y-1.5" aria-label="Portal sections">
        {navItems.map((item) => {
          const active = isActivePath(pathname, item.href);
          const Icon = itemIcon(item.icon);

          return (
            <Link
              aria-current={active ? "page" : undefined}
              className={cn(
                "group relative grid size-10 place-items-center rounded-lg transition",
                active
                  ? "bg-white/10 text-white shadow-sm"
                  : "text-slate-300 hover:bg-white/10 hover:text-white",
              )}
              href={item.href}
              key={item.href}
              title={item.label}
            >
              {active ? (
                <span className="absolute left-0 top-1/2 h-5 w-1 -translate-y-1/2 rounded-r-full bg-skybrand-300" />
              ) : null}
              {Icon ? (
                <Icon size={20} weight={active ? "duotone" : "regular"} />
              ) : null}
              <span className="sr-only">{item.label}</span>
            </Link>
          );
        })}
      </nav>
    );
  }

  return (
    <nav className="space-y-2" aria-label="Portal sections">
      {groupedNavItems(navItems).map((group) => {
        const groupActive = group.items.some((item) =>
          isActivePath(pathname, item.href),
        );

        return (
          <details className="group/nav" key={group.label} open={groupActive}>
            <summary
              className={cn(
                "flex min-h-9 cursor-pointer list-none items-center justify-between gap-2 rounded-lg px-3 text-xs font-bold uppercase tracking-wide transition [&::-webkit-details-marker]:hidden",
                groupActive
                  ? "bg-white/10 text-white"
                  : "text-slate-400 hover:bg-white/10 hover:text-white",
              )}
            >
              <span>{group.label}</span>
              <CaretDown
                className="transition group-open/nav:rotate-180"
                size={14}
                weight="bold"
              />
            </summary>
            <div className="mt-1 space-y-1">
              {group.items.map((item) => {
                const active = isActivePath(pathname, item.href);
                const Icon = itemIcon(item.icon);

                return (
                  <Link
                    aria-current={active ? "page" : undefined}
                    className={cn(
                      "group relative flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-semibold transition",
                      active
                        ? "bg-white/10 text-white shadow-sm"
                        : "text-slate-300 hover:bg-white/10 hover:text-white",
                    )}
                    href={item.href}
                    key={item.href}
                  >
                    {active ? (
                      <span className="absolute left-0 top-1/2 h-5 w-1 -translate-y-1/2 rounded-r-full bg-skybrand-300" />
                    ) : null}
                    {Icon ? (
                      <Icon
                        className="shrink-0"
                        size={19}
                        weight={active ? "duotone" : "regular"}
                      />
                    ) : null}
                    {item.label}
                  </Link>
                );
              })}
            </div>
          </details>
        );
      })}
    </nav>
  );
}
