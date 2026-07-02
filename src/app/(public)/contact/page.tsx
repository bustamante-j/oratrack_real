import Image from "next/image";
import {
  Clock,
  FileText,
  Mail,
  MapPin,
  Phone,
  Send,
  Users,
} from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { PublicHero } from "@/components/public-hero";
import { externalSchoolLinks, school } from "@/lib/constants";

export const metadata = {
  title: "Contact",
};

export default function ContactPage() {
  const contactMethods = [
    { icon: MapPin, label: "Visit us", value: school.location },
    { icon: Phone, label: "SDO Benguet line", value: school.phone },
    { icon: Mail, label: "Send an email", value: school.email },
    { icon: Clock, label: "School hours", value: school.hours },
  ];

  return (
    <>
      <PublicHero
        description="Reach the school office for enrollment questions, records, family concerns, and community partnerships."
        eyebrow="Contact us"
        image="/assets/section-family.webp"
        title="Our doors are open to the community"
      />

      <section className="relative overflow-hidden bg-slate-50 py-20">
        <div className="absolute inset-0 soft-grid opacity-50" />
        <div className="relative mx-auto grid max-w-7xl gap-8 px-4 sm:px-6 lg:grid-cols-[.92fr_1.08fr] lg:px-8">
          <div className="space-y-5">
            <div className="relative min-h-[24rem] overflow-hidden rounded-[2rem] bg-navy-950 shadow-editorial">
              <Image
                alt="Balili school community and family support"
                className="h-full w-full object-cover opacity-75"
                fill
                src="/assets/section-family.webp"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-navy-950 via-navy-950/35 to-transparent" />
              <div className="absolute bottom-0 left-0 right-0 p-6 text-white sm:p-8">
                <Badge tone="emerald">School office</Badge>
                <h2 className="mt-4 font-display text-3xl font-extrabold leading-tight">
                  A clear place for questions, visits, and family support.
                </h2>
              </div>
            </div>

            <div className="grid gap-3 sm:grid-cols-2">
              {contactMethods.map((method) => {
                const Icon = method.icon;
                return (
                  <div
                    className="rounded-2xl border border-slate-200 bg-white p-5 shadow-soft"
                    key={method.label}
                  >
                    <div className="grid size-12 place-items-center rounded-2xl bg-gradient-to-br from-skybrand-500 to-blue-600 text-white shadow-md">
                      <Icon size={23} />
                    </div>
                    <p className="mt-5 text-xs font-extrabold uppercase text-slate-400">
                      {method.label}
                    </p>
                    <p className="mt-2 text-sm font-bold leading-6 text-navy-950">
                      {method.value}
                    </p>
                  </div>
                );
              })}
            </div>
          </div>

          <div className="rounded-[2rem] border border-slate-200 bg-white shadow-editorial">
            <div className="grid border-b border-slate-200 lg:grid-cols-[1fr_.75fr]">
              <div className="p-7 sm:p-10">
                <p className="text-xs font-extrabold uppercase text-skybrand-600">
                  Send an inquiry
                </p>
                <h2 className="mt-3 font-display text-3xl font-extrabold leading-tight text-navy-950">
                  How can we help?
                </h2>
                <p className="mt-3 text-sm leading-7 text-slate-600">
                  Choose the closest topic and prepare your message for the
                  office.
                </p>
              </div>
              <div className="hidden bg-gradient-to-br from-navy-950 to-navy-800 p-8 text-white lg:block">
                <Send size={34} className="text-skybrand-300" />
                <p className="mt-8 text-xs font-extrabold uppercase text-skybrand-300">
                  Response path
                </p>
                <p className="mt-2 text-sm leading-7 text-slate-300">
                  Office to adviser or records desk to family follow-up.
                </p>
              </div>
            </div>

            <div className="grid gap-3 border-b border-slate-100 bg-slate-50 p-5 sm:grid-cols-3">
              {[
                ["Enrollment and records", FileText],
                ["Family concerns", Users],
                ["Events and schedules", Clock],
              ].map(([title, Icon]) => (
                <div className="rounded-2xl bg-white p-4" key={title as string}>
                  <div className="grid size-10 place-items-center rounded-xl bg-skybrand-50 text-skybrand-600">
                    <Icon size={19} />
                  </div>
                  <h3 className="mt-4 text-sm font-extrabold text-navy-950">
                    {title as string}
                  </h3>
                </div>
              ))}
            </div>

            <form className="grid gap-4 p-7 sm:grid-cols-2 sm:p-10">
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
                  <option>General inquiry</option>
                  <option>Enrollment</option>
                  <option>Student records</option>
                  <option>Family concern</option>
                </select>
              </label>
              <label className="sm:col-span-2">
                <span className="label">Message</span>
                <textarea
                  className="input min-h-36 resize-y"
                  placeholder="Tell us what you need help with."
                />
              </label>
              <div className="flex flex-col gap-3 sm:col-span-2 sm:flex-row sm:items-center sm:justify-between">
                <div className="flex flex-wrap gap-2">
                  {externalSchoolLinks.map((link) => (
                    <a
                      className="text-xs font-bold text-skybrand-600 hover:text-navy-900"
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
