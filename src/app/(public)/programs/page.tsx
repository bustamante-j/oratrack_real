import Image from "next/image";
import Link from "next/link";
import {
  ArrowRight,
  BookOpen,
  HeartHandshake,
  Palette,
  Salad,
  ShieldCheck,
  Trophy,
} from "lucide-react";

import { PublicHero } from "@/components/public-hero";

const programs = [
  {
    icon: BookOpen,
    image: "/assets/program-reading.webp",
    title: "Reading and Literacy",
    short: "Build confident, joyful readers",
    color: "bg-skybrand-500",
  },
  {
    icon: Salad,
    image: "/assets/program-nutrition.webp",
    title: "School Nutrition",
    short: "Healthy bodies, ready minds",
    color: "bg-emerald-500",
  },
  {
    icon: Trophy,
    image: "/assets/program-sports.webp",
    title: "Sports and Wellness",
    short: "Move, play, and grow together",
    color: "bg-violet-500",
  },
  {
    icon: Palette,
    image: "/assets/program-arts.webp",
    title: "Arts and Culture",
    short: "Create with pride and imagination",
    color: "bg-rose-500",
  },
  {
    icon: ShieldCheck,
    image: "/assets/section-support.webp",
    title: "Learner Support",
    short: "Timely care for every learner",
    color: "bg-amber-500",
  },
  {
    icon: HeartHandshake,
    image: "/assets/section-family.webp",
    title: "Family Partnerships",
    short: "Families belong in school life",
    color: "bg-blue-600",
  },
];

export const metadata = {
  title: "Programs",
};

export default function ProgramsPage() {
  return (
    <>
      <PublicHero
        description="Explore academic, wellness, creative, and family programs designed around the whole child."
        eyebrow="Programs and services"
        image="/assets/programs-hero.webp"
        title="Every learner deserves more ways to thrive"
      />

      <section className="relative z-10 -mt-14 px-4 pb-20 sm:px-6">
        <div className="mx-auto grid max-w-7xl gap-5 lg:grid-cols-3">
          {programs.map((program) => {
            const Icon = program.icon;
            return (
              <article
                className="group overflow-hidden rounded-[1.75rem] border border-slate-200 bg-white shadow-soft transition hover:-translate-y-1 hover:border-skybrand-300 hover:shadow-glow"
                key={program.title}
              >
                <div className="relative h-56 overflow-hidden bg-navy-950">
                  <Image
                    alt={`${program.title} at Balili Elementary School`}
                    className="h-full w-full object-cover transition duration-500 group-hover:scale-105"
                    fill
                    src={program.image}
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-navy-950/80 via-transparent to-transparent" />
                  <div
                    className={`absolute bottom-5 left-5 grid size-12 place-items-center rounded-2xl text-white shadow-lg ${program.color}`}
                  >
                    <Icon size={23} />
                  </div>
                </div>
                <div className="p-6">
                  <p className="text-xs font-bold uppercase text-skybrand-600">
                    {program.short}
                  </p>
                  <h2 className="mt-3 font-display text-xl font-extrabold text-navy-950">
                    {program.title}
                  </h2>
                  <p className="mt-3 text-sm leading-7 text-slate-600">
                    Temporary clean content placeholder for school-approved
                    program details.
                  </p>
                  <Link
                    className="mt-5 inline-flex items-center gap-2 text-sm font-bold text-skybrand-600 hover:text-navy-900"
                    href="/contact"
                  >
                    Talk to the school office
                    <ArrowRight size={16} />
                  </Link>
                </div>
              </article>
            );
          })}
        </div>
      </section>
    </>
  );
}
