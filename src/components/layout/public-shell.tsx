import Link from "next/link";
import type { ReactNode } from "react";

import { BrandLogo } from "@/components/brand-logo";
import { externalSchoolLinks, school } from "@/lib/constants";
import { publicNavItems } from "@/lib/navigation";

export function PublicShell({ children }: { children: ReactNode }) {
  return (
    <div className="min-h-screen w-full overflow-hidden bg-white text-slate-800">
      <header className="sticky top-0 z-30 border-b border-white/10 bg-navy-950/96 text-white backdrop-blur-xl">
        <div className="mx-auto flex min-h-16 max-w-7xl items-center justify-between gap-4 px-5 py-3 sm:px-6 lg:px-8">
          <Link
            aria-label="Balili Elementary School home"
            className="group min-w-0"
            href="/"
          >
            <BrandLogo
              className="transition duration-300 group-hover:-translate-y-0.5"
              compact
              inverse
              markClassName="rounded-none shadow-none"
            />
          </Link>

          <nav
            aria-label="Public"
            className="hidden items-center gap-7 lg:flex"
          >
            {publicNavItems.map((item) => (
              <Link
                className="text-xs font-extrabold uppercase tracking-[0.18em] text-white/62 transition hover:text-white"
                href={item.href}
                key={item.href}
              >
                {item.label}
              </Link>
            ))}
          </nav>

          <Link
            className="inline-flex min-h-10 shrink-0 items-center bg-skybrand-500 px-4 text-xs font-extrabold uppercase tracking-[0.16em] text-white transition hover:bg-white hover:text-navy-950"
            href="/login"
          >
            Staff portal
          </Link>
        </div>
        <nav
          aria-label="Public mobile"
          className="scroll-soft flex gap-5 overflow-x-auto border-t border-white/10 px-5 py-3 sm:px-6 lg:hidden"
        >
          {publicNavItems.map((item) => (
            <Link
              className="shrink-0 text-[11px] font-extrabold uppercase tracking-[0.18em] text-white/60 transition hover:text-white"
              href={item.href}
              key={item.href}
            >
              {item.label}
            </Link>
          ))}
        </nav>
      </header>

      <main>{children}</main>

      <footer className="bg-navy-950 text-white">
        <div className="mx-auto max-w-7xl px-5 py-16 sm:px-6 lg:px-8">
          <div className="grid gap-10 border-b border-white/10 pb-12 md:grid-cols-[1.2fr_.8fr_.8fr]">
            <div>
              <BrandLogo inverse markClassName="rounded-none shadow-none" />
              <p className="mt-5 max-w-md text-sm leading-7 text-slate-300">
                Balili Elementary School welcomes learners and families to a
                caring community shaped by curiosity, service, and everyday
                growth.
              </p>
              <div className="mt-6 text-xs font-bold uppercase tracking-[0.18em] text-white/45">
                School ID {school.schoolId} / {school.location}
              </div>
            </div>

            <div>
              <h3 className="font-display text-sm font-extrabold uppercase tracking-[0.16em]">
                Explore
              </h3>
              <div className="mt-5 grid gap-3">
                {publicNavItems.slice(1).map((item) => (
                  <Link
                    className="text-sm text-slate-300 transition hover:text-white"
                    href={item.href}
                    key={item.href}
                  >
                    {item.label}
                  </Link>
                ))}
              </div>
            </div>

            <div>
              <h3 className="font-display text-sm font-extrabold uppercase tracking-[0.16em]">
                Official Links
              </h3>
              <div className="mt-5 grid gap-3">
                {externalSchoolLinks.map((link) => (
                  <a
                    className="text-sm text-slate-300 transition hover:text-white"
                    href={link.href}
                    key={link.label}
                    rel="noreferrer"
                    target="_blank"
                  >
                    {link.label}
                  </a>
                ))}
              </div>
            </div>
          </div>

          <div className="flex flex-col justify-between gap-3 pt-6 text-xs font-semibold uppercase tracking-[0.14em] text-white/40 sm:flex-row">
            <p>&copy; 2026 Balili Elementary School</p>
            <p>{school.email}</p>
          </div>
        </div>
      </footer>
    </div>
  );
}
