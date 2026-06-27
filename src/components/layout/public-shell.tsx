import Link from "next/link";
import type { ReactNode } from "react";
import {
  ArrowUpRight,
  Clock3,
  Globe2,
  Mail,
  MapPin,
  Phone,
  Video,
} from "lucide-react";

import { BrandLogo } from "@/components/brand-logo";
import { externalSchoolLinks, school } from "@/lib/constants";
import { publicNavItems } from "@/lib/navigation";

export function PublicShell({ children }: { children: ReactNode }) {
  return (
    <div className="min-h-screen w-full overflow-hidden bg-white text-slate-800">
      <div className="relative z-30 bg-navy-950 text-white">
        <div className="mx-auto flex min-h-10 max-w-7xl items-center justify-between gap-4 px-4 py-2 text-[11px] sm:px-6 lg:px-8">
          <p className="flex min-w-0 items-center gap-2 text-slate-300">
            <MapPin size={13} className="shrink-0 text-skybrand-400" />
            <span className="truncate">{school.location}</span>
          </p>
          <div className="hidden items-center gap-5 sm:flex">
            <span className="flex items-center gap-2 text-slate-300">
              <Clock3 size={13} className="text-skybrand-400" />
              {school.hours}
            </span>
            <a
              className="flex items-center gap-2 font-semibold text-white hover:text-skybrand-300"
              href="tel:+63744220186"
            >
              <Phone size={13} />
              {school.phone}
            </a>
          </div>
        </div>
      </div>

      <header className="sticky top-0 z-20 border-b border-slate-200/80 bg-white/95 shadow-[0_10px_35px_rgba(7,27,51,.08)] backdrop-blur-xl">
        <div className="mx-auto flex h-[78px] max-w-7xl items-center justify-between gap-6 px-4 sm:px-6 lg:px-8">
          <Link aria-label="ORATRACK home" className="group" href="/">
            <BrandLogo className="transition duration-300 group-hover:-translate-y-0.5" />
          </Link>

          <nav
            className="hidden items-center gap-1 lg:flex"
            aria-label="Public"
          >
            {publicNavItems.map((item) => (
              <Link
                className="rounded-xl px-4 py-2.5 text-sm font-semibold text-slate-600 transition hover:bg-slate-50 hover:text-navy-900"
                href={item.href}
                key={item.href}
              >
                {item.label}
              </Link>
            ))}
          </nav>

          <Link
            className="shine-card hidden items-center gap-2 rounded-xl bg-navy-900 px-5 py-3 text-sm font-bold text-white shadow-lg shadow-navy-900/15 transition hover:-translate-y-0.5 hover:bg-skybrand-600 hover:shadow-skybrand-500/25 sm:inline-flex"
            href="/login"
          >
            Teacher Portal
            <ArrowUpRight size={16} />
          </Link>
        </div>
      </header>

      <main>{children}</main>

      <footer className="relative overflow-hidden bg-navy-950 text-white">
        <div className="absolute inset-0 public-grid opacity-10" />
        <div className="relative mx-auto max-w-7xl px-4 pb-10 pt-16 sm:px-6 lg:px-8">
          <div className="mb-14 grid gap-8 rounded-[2rem] border border-white/10 bg-white/[.06] p-7 backdrop-blur-md md:grid-cols-[1fr_auto] md:items-center lg:p-10">
            <div>
              <p className="text-xs font-bold uppercase text-skybrand-300">
                Stay connected
              </p>
              <h2 className="mt-3 max-w-3xl font-display text-2xl font-extrabold sm:text-3xl">
                School news, learner milestones, and community stories.
              </h2>
            </div>
            <Link
              className="shine-card inline-flex w-fit items-center gap-2 rounded-xl bg-skybrand-500 px-5 py-3 text-sm font-bold text-white transition hover:-translate-y-0.5 hover:bg-skybrand-400"
              href="/announcements"
            >
              Read school updates
              <ArrowUpRight size={16} />
            </Link>
          </div>

          <div className="grid gap-10 md:grid-cols-2 lg:grid-cols-[1.35fr_.8fr_1fr_.8fr]">
            <div>
              <BrandLogo inverse />
              <p className="mt-5 max-w-sm text-sm leading-7 text-slate-300">
                A clearer, warmer digital home for Balili Elementary School,
                built around learner growth and community connection.
              </p>
              <div className="mt-5 flex gap-2">
                {[Globe2, Video].map((Icon, index) => (
                  <a
                    aria-label="School social page"
                    className="grid size-10 place-items-center rounded-xl border border-white/10 bg-white/5 text-slate-300 transition hover:-translate-y-0.5 hover:border-skybrand-400 hover:bg-skybrand-500 hover:text-white"
                    href="#"
                    key={index}
                  >
                    <Icon size={17} />
                  </a>
                ))}
              </div>
            </div>
            <div>
              <h3 className="font-display text-sm font-bold">Explore</h3>
              <div className="mt-5 space-y-3">
                {publicNavItems.slice(1).map((item) => (
                  <Link
                    className="block text-sm text-slate-300 hover:text-white"
                    href={item.href}
                    key={item.href}
                  >
                    {item.label}
                  </Link>
                ))}
              </div>
            </div>
            <div>
              <h3 className="font-display text-sm font-bold">
                Contact the school
              </h3>
              <div className="mt-5 space-y-4 text-sm text-slate-300">
                <p className="flex gap-3">
                  <MapPin size={18} className="shrink-0 text-skybrand-400" />
                  {school.location}
                </p>
                <a
                  className="flex gap-3 hover:text-white"
                  href="tel:+63744220186"
                >
                  <Phone size={18} className="text-skybrand-400" />
                  {school.phone}
                </a>
                <a
                  className="flex gap-3 hover:text-white"
                  href={`mailto:${school.email}`}
                >
                  <Mail size={18} className="text-skybrand-400" />
                  {school.email}
                </a>
              </div>
            </div>
            <div>
              <h3 className="font-display text-sm font-bold">Official links</h3>
              <div className="mt-5 space-y-3">
                {externalSchoolLinks.map((link) => (
                  <a
                    className="block text-sm text-slate-300 hover:text-white"
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

          <div className="mt-14 flex flex-col justify-between gap-3 border-t border-white/10 pt-6 text-xs text-slate-400 sm:flex-row">
            <p>© 2026 Balili Elementary School.</p>
            <p>Powered by ORATRACK.</p>
          </div>
        </div>
      </footer>
    </div>
  );
}
