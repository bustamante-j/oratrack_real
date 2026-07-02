import Image from "next/image";
import Link from "next/link";

import { PublicHero } from "@/components/public-hero";
import { school } from "@/lib/constants";

export const metadata = {
  title: "About",
};

const commitments = [
  ["Safe learning", "Classrooms are organized around care, routines, and respect."],
  ["Strong basics", "Reading, numeracy, attendance, and values remain daily priorities."],
  ["Family connection", "Updates and school information stay clear for parents and guardians."],
  ["Learner support", "Teachers use records to notice progress, needs, and next steps."],
];

export default function AboutPage() {
  return (
    <>
      <PublicHero
        description="A public elementary school community serving learners and families in Balili, La Trinidad, Benguet."
        eyebrow="About the school"
        image="/assets/section-about.webp"
        title={school.name}
      />

      <section className="bg-white py-20">
        <div className="mx-auto grid max-w-7xl gap-12 px-5 sm:px-6 lg:grid-cols-[.9fr_1.1fr] lg:px-8">
          <div>
            <p className="text-xs font-extrabold uppercase tracking-[0.28em] text-skybrand-600">
              School profile
            </p>
            <h2 className="mt-5 font-display text-5xl font-extrabold uppercase leading-[.92] text-navy-950 sm:text-6xl">
              Rooted in community, focused on children.
            </h2>
            <p className="mt-6 max-w-xl text-sm leading-7 text-slate-600">
              Balili Elementary School is listed under DepEd with School ID{" "}
              {school.schoolId}. The school supports young learners through
              classroom instruction, family partnership, school activities, and
              careful monitoring of attendance and progress.
            </p>
          </div>

          <div className="grid gap-6">
            <div className="relative min-h-[26rem] overflow-hidden bg-navy-950">
              <Image
                alt="Balili Elementary School learners and community"
                className="h-full w-full object-cover opacity-88"
                fill
                src="/assets/about-history.webp"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-navy-950/82 via-transparent to-transparent" />
              <div className="absolute bottom-0 left-0 right-0 p-6 text-white sm:p-8">
                <p className="text-xs font-extrabold uppercase tracking-[0.22em] text-skybrand-300">
                  {school.location}
                </p>
                <p className="mt-3 max-w-2xl font-display text-2xl font-extrabold uppercase leading-tight">
                  A school space for learning, belonging, and steady growth.
                </p>
              </div>
            </div>

            <dl className="grid gap-x-8 gap-y-0 border-y border-slate-200 sm:grid-cols-2">
              {[
                ["School ID", school.schoolId],
                ["Principal", school.principal],
                ["Office hours", school.hours],
                ["Email", school.email],
              ].map(([label, value]) => (
                <div className="border-b border-slate-200 py-4" key={label}>
                  <dt className="text-xs font-extrabold uppercase tracking-[0.18em] text-slate-400">
                    {label}
                  </dt>
                  <dd className="mt-2 text-sm font-bold leading-6 text-navy-950">
                    {value}
                  </dd>
                </div>
              ))}
            </dl>
          </div>
        </div>
      </section>

      <section className="bg-skybrand-50 py-20">
        <div className="mx-auto grid max-w-7xl gap-10 px-5 sm:px-6 lg:grid-cols-[.72fr_1.28fr] lg:px-8">
          <div>
            <p className="text-xs font-extrabold uppercase tracking-[0.28em] text-skybrand-600">
              What guides us
            </p>
            <h2 className="mt-5 font-display text-4xl font-extrabold uppercase leading-none text-navy-950 sm:text-5xl">
              Practical care, clear priorities.
            </h2>
          </div>
          <div className="divide-y divide-navy-950/10 border-y border-navy-950/10">
            {commitments.map(([title, text]) => (
              <article
                className="grid gap-3 py-5 sm:grid-cols-[12rem_1fr]"
                key={title}
              >
                <h3 className="font-display text-xl font-extrabold text-navy-950">
                  {title}
                </h3>
                <p className="text-sm leading-7 text-slate-600">{text}</p>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section className="bg-white py-16">
        <div className="mx-auto flex max-w-7xl flex-col gap-5 px-5 sm:px-6 md:flex-row md:items-center md:justify-between lg:px-8">
          <p className="max-w-2xl text-sm font-semibold leading-7 text-navy-950">
            Families can follow official school updates, activities, and
            program information through this site.
          </p>
          <Link
            className="inline-flex min-h-11 w-fit items-center bg-navy-950 px-5 text-xs font-extrabold uppercase tracking-[0.18em] text-white transition hover:bg-skybrand-500"
            href="/announcements"
          >
            View bulletin
          </Link>
        </div>
      </section>
    </>
  );
}
