import Image from "next/image";

import { Button } from "@/components/ui/button";
import { PublicHero } from "@/components/public-hero";
import { externalSchoolLinks, school } from "@/lib/constants";

export const metadata = {
  title: "Contact",
};

const contactRows = [
  ["Address", school.location],
  ["Telephone", school.phone],
  ["Email", school.email],
  ["Office hours", school.hours],
];

const inquiryTopics = [
  "General inquiry",
  "Enrollment",
  "Student records",
  "Family concern",
  "School activity",
];

export default function ContactPage() {
  return (
    <>
      <PublicHero
        description="Reach the school office for enrollment questions, records, family concerns, and community coordination."
        eyebrow="Contact us"
        image="/assets/section-family.webp"
        title="Contact"
      />

      <section className="bg-white py-20">
        <div className="mx-auto grid max-w-7xl gap-10 px-5 sm:px-6 lg:grid-cols-[.82fr_1.18fr] lg:px-8">
          <div className="grid gap-6">
            <div>
              <p className="text-xs font-extrabold uppercase tracking-[0.28em] text-skybrand-600">
                School office
              </p>
              <h2 className="mt-5 font-display text-5xl font-extrabold uppercase leading-[.92] text-navy-950 sm:text-6xl">
                We are here to help.
              </h2>
              <p className="mt-6 text-sm leading-7 text-slate-600">
                Families may contact the office for enrollment, records,
                school activities, and learner-related concerns.
              </p>
            </div>

            <dl className="divide-y divide-slate-200 border-y border-slate-200">
              {contactRows.map(([label, value]) => (
                <div
                  className="grid gap-2 py-4 sm:grid-cols-[8rem_1fr]"
                  key={label}
                >
                  <dt className="text-xs font-extrabold uppercase tracking-[0.18em] text-slate-400">
                    {label}
                  </dt>
                  <dd className="text-sm font-bold leading-6 text-navy-950">
                    {value}
                  </dd>
                </div>
              ))}
            </dl>

            <div className="relative min-h-[21rem] overflow-hidden bg-navy-950">
              <Image
                alt="Balili Elementary School office and family support"
                className="h-full w-full object-cover opacity-82"
                fill
                src="/assets/balili-classroom.webp"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-navy-950/85 via-transparent to-transparent" />
              <p className="absolute bottom-6 left-6 right-6 font-display text-2xl font-extrabold uppercase leading-tight text-white">
                Clear communication helps the school respond faster and better.
              </p>
            </div>
          </div>

          <div className="border border-slate-200 bg-white shadow-editorial">
            <div className="border-b border-slate-200 p-6 sm:p-8">
              <p className="text-xs font-extrabold uppercase tracking-[0.28em] text-skybrand-600">
                Send an inquiry
              </p>
              <h2 className="mt-4 font-display text-4xl font-extrabold uppercase leading-none text-navy-950">
                Message details
              </h2>
            </div>

            <form className="grid gap-4 p-6 sm:grid-cols-2 sm:p-8">
              <label>
                <span className="label">Full name</span>
                <input className="input" placeholder="Your name" />
              </label>
              <label>
                <span className="label">Email address</span>
                <input
                  className="input"
                  placeholder="name@example.com"
                  type="email"
                />
              </label>
              <label>
                <span className="label">Contact number</span>
                <input className="input" placeholder="Optional" type="tel" />
              </label>
              <label>
                <span className="label">Topic</span>
                <select className="input">
                  {inquiryTopics.map((topic) => (
                    <option key={topic}>{topic}</option>
                  ))}
                </select>
              </label>
              <label className="sm:col-span-2">
                <span className="label">Message</span>
                <textarea
                  className="input min-h-36 resize-y"
                  placeholder="Tell us what you need help with."
                />
              </label>
              <div className="flex flex-col gap-4 border-t border-slate-200 pt-5 sm:col-span-2 md:flex-row md:items-center md:justify-between">
                <div className="flex flex-wrap gap-x-4 gap-y-2">
                  {externalSchoolLinks.map((link) => (
                    <a
                      className="text-xs font-bold uppercase tracking-[0.12em] text-skybrand-600 hover:text-navy-900"
                      href={link.href}
                      key={link.label}
                      rel="noreferrer"
                      target="_blank"
                    >
                      {link.label}
                    </a>
                  ))}
                </div>
                <Button type="button">Prepare message</Button>
              </div>
            </form>
          </div>
        </div>
      </section>
    </>
  );
}
