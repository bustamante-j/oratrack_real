import Image from "next/image";
import Link from "next/link";

import { PublicHero } from "@/components/public-hero";

const programs = [
  {
    image: "/assets/program-reading.webp",
    title: "Reading and Literacy",
    summary:
      "Daily reading routines, classroom support, and activities that help learners build confidence with words and stories.",
  },
  {
    image: "/assets/program-nutrition.webp",
    title: "School Nutrition",
    summary:
      "Health and nutrition support that helps children come to class ready to participate and learn.",
  },
  {
    image: "/assets/program-sports.webp",
    title: "Sports and Wellness",
    summary:
      "Movement, play, and wellness activities that strengthen teamwork, discipline, and healthy habits.",
  },
  {
    image: "/assets/program-arts.webp",
    title: "Arts and Culture",
    summary:
      "Creative activities and school events that encourage learners to express themselves and value community identity.",
  },
  {
    image: "/assets/section-support.webp",
    title: "Learner Support",
    summary:
      "Teacher-led monitoring and follow-up for learners who need academic, attendance, or wellness support.",
  },
  {
    image: "/assets/section-family.webp",
    title: "Family Partnerships",
    summary:
      "Clear communication with families so school reminders, concerns, and milestones are easier to follow.",
  },
];

export const metadata = {
  title: "Programs",
};

export default function ProgramsPage() {
  return (
    <>
      <PublicHero
        description="School programs that support learning, health, creativity, and family partnership."
        eyebrow="Programs and services"
        image="/assets/programs-hero.webp"
        title="Programs"
      />

      <section className="bg-white py-20">
        <div className="mx-auto grid max-w-7xl gap-12 px-5 sm:px-6 lg:grid-cols-[.75fr_1.25fr] lg:px-8">
          <div>
            <p className="text-xs font-extrabold uppercase tracking-[0.28em] text-skybrand-600">
              Learning support
            </p>
            <h2 className="mt-5 font-display text-5xl font-extrabold uppercase leading-[.92] text-navy-950 sm:text-6xl">
              Programs for the whole child.
            </h2>
            <p className="mt-6 text-sm leading-7 text-slate-600">
              The school supports learners through core academics, health,
              values formation, creativity, and close coordination with
              families.
            </p>
          </div>

          <div className="grid gap-6">
            {programs.map((program, index) => (
              <article
                className="grid overflow-hidden border-y border-slate-200 py-6 sm:grid-cols-[12rem_1fr] sm:gap-6"
                key={program.title}
              >
                <div className="relative min-h-40 bg-navy-950">
                  <Image
                    alt={`${program.title} at Balili Elementary School`}
                    className="h-full w-full object-cover opacity-90"
                    fill
                    src={program.image}
                  />
                </div>
                <div className="pt-5 sm:pt-0">
                  <p className="text-xs font-extrabold uppercase tracking-[0.2em] text-skybrand-600">
                    {String(index + 1).padStart(2, "0")}
                  </p>
                  <h3 className="mt-3 font-display text-2xl font-extrabold uppercase leading-tight text-navy-950">
                    {program.title}
                  </h3>
                  <p className="mt-3 text-sm leading-7 text-slate-600">
                    {program.summary}
                  </p>
                </div>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section className="bg-navy-950 py-16 text-white">
        <div className="mx-auto flex max-w-7xl flex-col gap-5 px-5 sm:px-6 md:flex-row md:items-center md:justify-between lg:px-8">
          <p className="max-w-2xl font-display text-3xl font-extrabold uppercase leading-tight">
            Have questions about school programs or learner support?
          </p>
          <Link
            className="inline-flex min-h-11 w-fit items-center border border-white/35 px-5 text-xs font-extrabold uppercase tracking-[0.18em] text-white transition hover:border-white hover:bg-white hover:text-navy-950"
            href="/contact"
          >
            Contact the office
          </Link>
        </div>
      </section>
    </>
  );
}
