import Image from "next/image";
import Link from "next/link";
import {
  ArrowRight,
  ArrowUpRight,
  BarChart3,
  BellRing,
  BookOpenCheck,
  CalendarDays,
  FileText,
  GraduationCap,
  HeartHandshake,
  ShieldCheck,
  Sparkles,
} from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { ButtonLink } from "@/components/ui/button";
import { MetricCard } from "@/components/ui/metric-card";
import { school } from "@/lib/constants";

const quickLinks = [
  {
    href: "/announcements",
    label: "School News",
    text: "Read the latest updates",
    icon: BellRing,
    color: "from-skybrand-500 to-blue-600",
  },
  {
    href: "/events",
    label: "Events Calendar",
    text: "See what is coming up",
    icon: CalendarDays,
    color: "from-violet-500 to-indigo-600",
  },
  {
    href: "/programs",
    label: "Programs",
    text: "Explore learner support",
    icon: Sparkles,
    color: "from-emerald-500 to-teal-600",
  },
  {
    href: "/contact",
    label: "School Office",
    text: "Contact our team",
    icon: HeartHandshake,
    color: "from-amber-500 to-orange-600",
  },
];

const platformPillars = [
  {
    title: "Learner records",
    text: "Stable learner identity with yearly enrollments, histories, and section assignments.",
    icon: GraduationCap,
  },
  {
    title: "Attendance and grades",
    text: "AM/PM attendance, grade import workflows, and validation before saving records.",
    icon: BookOpenCheck,
  },
  {
    title: "Risk and interventions",
    text: "Permission-aware risk flags, intervention notes, follow-ups, and report trails.",
    icon: ShieldCheck,
  },
  {
    title: "Reports and AI",
    text: "PDF/Excel reporting and read-only AI support that proposes, never silently changes.",
    icon: Sparkles,
  },
];

export default function HomePage() {
  return (
    <>
      <section className="hero-noise relative min-h-[calc(100vh-7.4rem)] overflow-hidden bg-navy-950 text-white">
        <Image
          alt="Balili Elementary School campus"
          className="absolute inset-0 h-full w-full object-cover"
          fill
          priority
          src="/assets/balili-campus-hero.webp"
        />
        <div className="absolute inset-0 bg-gradient-to-r from-navy-950 via-navy-950/85 to-navy-950/25" />
        <div className="absolute inset-0 bg-gradient-to-t from-navy-950/80 via-transparent to-transparent" />
        <div className="relative mx-auto flex min-h-[calc(100vh-7.4rem)] max-w-7xl items-center px-4 py-20 sm:px-6 lg:px-8">
          <div className="max-w-3xl">
            <p className="flex items-center gap-3 text-xs font-bold uppercase text-skybrand-300">
              <span className="h-px w-10 bg-skybrand-400" />
              Centralized learner monitoring
            </p>
            <h1 className="text-balance mt-5 max-w-full font-display text-[2.55rem] font-extrabold leading-[1.08] sm:text-5xl lg:text-6xl">
              {school.name}
            </h1>
            <p className="mt-6 max-w-2xl text-base leading-8 text-slate-200 sm:text-lg">
              {school.platform} brings the public school website and private
              learner monitoring workflows into one secure platform for
              attendance, grades, interventions, reports, and AI-assisted
              insights.
            </p>
            <div className="mt-8 flex flex-wrap gap-3">
              <ButtonLink href="/about">Explore the school</ButtonLink>
              <ButtonLink href="/login" variant="secondary">
                Teacher Portal
              </ButtonLink>
            </div>
          </div>
        </div>
      </section>

      <section className="relative z-10 -mt-10 px-4 sm:px-6">
        <div className="mx-auto grid max-w-7xl gap-4 rounded-[2rem] border border-slate-200 bg-white p-4 shadow-editorial md:grid-cols-4">
          {quickLinks.map((item) => {
            const Icon = item.icon;
            return (
              <Link
                className="group flex items-center gap-4 rounded-[1.35rem] p-4 transition hover:bg-slate-50"
                href={item.href}
                key={item.href}
              >
                <span
                  className={`grid size-12 shrink-0 place-items-center rounded-2xl bg-gradient-to-br text-white shadow-lg ${item.color}`}
                >
                  <Icon size={22} />
                </span>
                <span className="min-w-0">
                  <span className="block font-display text-sm font-extrabold text-navy-950">
                    {item.label}
                  </span>
                  <span className="mt-0.5 block truncate text-xs text-slate-500">
                    {item.text}
                  </span>
                </span>
                <ArrowRight
                  className="ml-auto shrink-0 text-slate-300 transition group-hover:translate-x-1 group-hover:text-skybrand-500"
                  size={16}
                />
              </Link>
            );
          })}
        </div>
      </section>

      <section className="bg-white py-16">
        <div className="mx-auto grid max-w-7xl gap-4 px-4 sm:px-6 md:grid-cols-3 lg:px-8">
          <MetricCard
            detail="No fake learner records are inserted by default."
            icon={<ShieldCheck size={22} />}
            label="Data posture"
            value="Empty"
          />
          <MetricCard
            detail="Admin/Principal, Adviser, and Subject Teacher."
            icon={<BarChart3 size={22} />}
            label="Initial roles"
            value="3"
          />
          <MetricCard
            detail="Database policies, server checks, and audit logs are designed from the start."
            icon={<FileText size={22} />}
            label="Security layer"
            value="RLS"
          />
        </div>
      </section>

      <section className="relative overflow-hidden bg-slate-50 py-20">
        <div className="absolute inset-0 soft-grid opacity-50" />
        <div className="relative mx-auto grid max-w-7xl gap-10 px-4 sm:px-6 lg:grid-cols-[.75fr_1.25fr] lg:items-center lg:px-8">
          <div>
            <p className="text-xs font-extrabold uppercase text-skybrand-600">
              Built around real school operations
            </p>
            <h2 className="text-balance mt-4 font-display text-4xl font-extrabold text-navy-950">
              A warm public site with a secure school platform underneath.
            </h2>
            <p className="mt-5 max-w-lg text-sm leading-7 text-slate-600">
              The first version focuses on secure structure and empty states so
              the school can connect Supabase, confirm rules, and begin adding
              real data deliberately.
            </p>
            <Link
              className="mt-7 inline-flex items-center gap-2 text-sm font-bold text-skybrand-600 hover:text-navy-900"
              href="/programs"
            >
              View school programs
              <ArrowUpRight size={16} />
            </Link>
          </div>
          <div className="grid gap-4 md:grid-cols-2">
            {platformPillars.map((pillar) => {
              const Icon = pillar.icon;
              return (
                <article
                  className="rounded-[1.5rem] border border-slate-200 bg-white p-6 shadow-soft transition hover:-translate-y-1 hover:border-skybrand-300 hover:shadow-glow"
                  key={pillar.title}
                >
                  <div className="grid size-12 place-items-center rounded-2xl bg-skybrand-50 text-skybrand-600">
                    <Icon size={24} />
                  </div>
                  <h3 className="mt-5 font-display font-extrabold text-navy-950">
                    {pillar.title}
                  </h3>
                  <p className="mt-2 text-sm leading-6 text-slate-600">
                    {pillar.text}
                  </p>
                </article>
              );
            })}
          </div>
        </div>
      </section>

      <section className="bg-white py-20">
        <div className="mx-auto grid max-w-7xl gap-8 px-4 sm:px-6 lg:grid-cols-[1.05fr_.95fr] lg:px-8">
          <div className="relative min-h-[28rem] overflow-hidden rounded-[2rem] bg-navy-950 shadow-editorial">
            <Image
              alt="Classroom at Balili Elementary School"
              className="h-full w-full object-cover opacity-85"
              fill
              src="/assets/balili-classroom.webp"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-navy-950 via-navy-950/20 to-transparent" />
            <div className="absolute bottom-0 left-0 right-0 p-7 text-white sm:p-10">
              <Badge tone="emerald">Balili community</Badge>
              <h2 className="mt-4 max-w-xl font-display text-3xl font-extrabold leading-tight">
                Daily classroom records become timely support.
              </h2>
            </div>
          </div>
          <div className="grid content-center gap-4">
            {[
              "Attendance monitoring with AM and PM status",
              "Excel grade import review before saving",
              "Literacy and numeracy encoding",
              "Risk flags and intervention follow-up history",
            ].map((item) => (
              <div
                className="rounded-2xl border border-slate-200 bg-white p-5 shadow-soft"
                key={item}
              >
                <p className="flex items-center gap-3 text-sm font-bold text-navy-950">
                  <span className="grid size-7 place-items-center rounded-lg bg-skybrand-50 text-skybrand-600">
                    <ShieldCheck size={15} />
                  </span>
                  {item}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>
    </>
  );
}
