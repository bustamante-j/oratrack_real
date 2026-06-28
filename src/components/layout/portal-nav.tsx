"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

import { cn } from "@/lib/utils";
import type { NavItem } from "@/types/domain";

function isActivePath(pathname: string, href: string) {
  if (href === "/admin" || href === "/teacher") return pathname === href;

  return pathname === href || pathname.startsWith(`${href}/`);
}

export function PortalNavLinks({
  navItems,
  orientation = "vertical",
}: {
  navItems: NavItem[];
  orientation?: "vertical" | "horizontal";
}) {
  const pathname = usePathname();

  if (orientation === "horizontal") {
    return (
      <nav
        aria-label="Portal sections"
        className="scroll-soft flex gap-2 overflow-x-auto px-4 py-3 sm:px-6 lg:hidden"
      >
        {navItems.map((item) => {
          const active = isActivePath(pathname, item.href);

          return (
            <Link
              aria-current={active ? "page" : undefined}
              className={cn(
                "shrink-0 rounded-full border px-4 py-2 text-xs font-bold transition",
                active
                  ? "border-navy-900 bg-navy-900 text-white shadow-sm"
                  : "border-slate-200 bg-white text-slate-600 hover:border-skybrand-300 hover:bg-skybrand-50 hover:text-navy-900",
              )}
              href={item.href}
              key={item.href}
            >
              {item.label}
            </Link>
          );
        })}
      </nav>
    );
  }

  return (
    <nav className="space-y-1" aria-label="Portal sections">
      {navItems.map((item) => {
        const active = isActivePath(pathname, item.href);

        return (
          <Link
            aria-current={active ? "page" : undefined}
            className={cn(
              "block rounded-xl px-3 py-2.5 text-sm font-semibold transition",
              active
                ? "bg-white text-navy-950 shadow-sm"
                : "text-slate-300 hover:bg-white/10 hover:text-white",
            )}
            href={item.href}
            key={item.href}
          >
            {item.label}
          </Link>
        );
      })}
    </nav>
  );
}
