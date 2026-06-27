import Image from "next/image";
import {
  BookOpen,
  HeartHandshake,
  ShieldCheck,
  UsersRound,
} from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { PublicHero } from "@/components/public-hero";
import { school } from "@/lib/constants";

export const metadata = {
  title: "About",
};

const values = [
  {
    title: "Learner-centered care",
    text: "Daily school records help teachers notice support needs early.",
    icon: UsersRound,
  },
  {
    title: "Community connection",
    text: "Families, advisers, and school leaders share a clearer view of progress.",
    icon: HeartHandshake,
  },
  {
    title: "Thoughtful monitoring",
    text: "Attendance, grades, interventions, and reports are treated as sensitive data.",
    icon: ShieldCheck,
  },
  {
    title: "Growth mindset",
    text: "Literacy, numeracy, and academic support focus on next helpful steps.",
    icon: BookOpen,
  },
];

export default function AboutPage() {
  return (
    <>
      <PublicHero
        description="A digital home for school information, family connection, and secure learner monitoring workflows."
        eyebrow="About the school"
        image="/assets/section-about.webp"
        title={`About ${school.name}`}
      />

      <section className="relative overflow-hidden bg-white py-20">
        <div className="mx-auto grid max-w-7xl gap-10 px-4 sm:px-6 lg:grid-cols-[.9fr_1.1fr] lg:px-8">
          <div className="relative min-h-[31rem] overflow-hidden rounded-[2rem] bg-navy-950 shadow-editorial">
            <Image
              alt="Balili Elementary School history and community"
              className="h-full w-full object-cover opacity-85"
              fill
              src="/assets/about-history.webp"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-navy-950 via-navy-950/25 to-transparent" />
            <div className="absolute bottom-0 left-0 right-0 p-7 text-white sm:p-10">
              <Badge tone="emerald">School profile</Badge>
              <h2 className="mt-4 font-display text-3xl font-extrabold leading-tight">
                Official school history and profile content can be placed here.
              </h2>
            </div>
          </div>

          <div className="grid content-center gap-4 md:grid-cols-2">
            {values.map((item) => {
              const Icon = item.icon;
              return (
                <article
                  className="rounded-[1.5rem] border border-slate-200 bg-white p-6 shadow-soft"
                  key={item.title}
                >
                  <div className="grid size-12 place-items-center rounded-2xl bg-skybrand-50 text-skybrand-600">
                    <Icon size={23} />
                  </div>
                  <h2 className="mt-5 font-display text-lg font-extrabold text-navy-950">
                    {item.title}
                  </h2>
                  <p className="mt-2 text-sm leading-6 text-slate-600">
                    {item.text}
                  </p>
                </article>
              );
            })}
          </div>
        </div>
      </section>
    </>
  );
}
