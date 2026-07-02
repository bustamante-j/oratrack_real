import Image from "next/image";
import Link from "next/link";

import { school } from "@/lib/constants";
import { getHomePageData, type HomeEvent } from "@/lib/public/home-data";

const programs = [
  {
    label: "Reading",
    title: "Building confident readers through daily practice.",
    image: "/assets/program-reading.webp",
  },
  {
    label: "Wellness",
    title: "Healthy routines that help children come ready to learn.",
    image: "/assets/program-nutrition.webp",
  },
  {
    label: "Culture",
    title: "Creativity, local identity, and community participation.",
    image: "/assets/program-arts.webp",
  },
];

function formatPublishedDate(date: string | null) {
  if (!date) return "Published";

  return new Intl.DateTimeFormat("en-PH", {
    month: "short",
    day: "numeric",
    year: "numeric",
    timeZone: "Asia/Manila",
  }).format(new Date(date));
}

function formatEventDate(value: string) {
  return new Intl.DateTimeFormat("en-PH", {
    month: "short",
    day: "2-digit",
    year: "numeric",
    timeZone: "Asia/Manila",
  }).format(new Date(value));
}

function formatEventTime(value: string) {
  return new Intl.DateTimeFormat("en-PH", {
    hour: "numeric",
    minute: "2-digit",
    timeZone: "Asia/Manila",
  }).format(new Date(value));
}

function shortNumber(value: number) {
  return new Intl.NumberFormat("en-PH").format(value);
}

function attendanceMetric(value: number | null) {
  if (value === null) return "No data";
  return `${value.toFixed(1)}%`;
}

function statRows(
  metrics: Awaited<ReturnType<typeof getHomePageData>>["metrics"],
) {
  return [
    ["Enrolled learners", shortNumber(metrics.activeLearners)],
    ["Teachers and staff", shortNumber(metrics.activeStaff)],
    ["Attendance", attendanceMetric(metrics.attendanceRate)],
    ["Grade levels", shortNumber(metrics.activeGradeLevels)],
  ] as const;
}

function EventLine({ event }: { event: HomeEvent }) {
  return (
    <article className="grid gap-3 border-t border-white/15 py-5 sm:grid-cols-[9rem_1fr]">
      <div className="font-display text-3xl font-extrabold leading-none text-white">
        {formatEventDate(event.starts_at).split(",")[0]}
      </div>
      <div>
        <h3 className="font-display text-xl font-extrabold text-white">
          {event.title}
        </h3>
        <p className="mt-2 text-sm leading-6 text-slate-300">
          {formatEventTime(event.starts_at)}
          {event.body ? ` / ${event.body}` : ""}
        </p>
      </div>
    </article>
  );
}

export default async function HomePage() {
  const { announcements, events, metrics } = await getHomePageData();
  const lead = announcements[0] ?? null;
  const secondaryAnnouncements = announcements.slice(1, 4);
  const nextEvents = events.slice(0, 3);
  const stats = statRows(metrics);

  return (
    <>
      <section className="relative isolate overflow-hidden bg-navy-950 text-white">
        <Image
          alt="Balili Elementary School campus"
          className="absolute inset-0 -z-20 h-full w-full object-cover opacity-42"
          fill
          priority
          src="/assets/balili-campus-hero.webp"
        />
        <div className="absolute inset-0 -z-10 bg-[radial-gradient(circle_at_62%_45%,rgba(142,220,255,.18),transparent_24%),linear-gradient(90deg,#071b33_0%,rgba(7,27,51,.95)_36%,rgba(11,36,71,.78)_68%,rgba(7,27,51,.97)_100%)]" />
        <div className="absolute bottom-0 left-0 right-0 -z-10 h-56 bg-gradient-to-t from-navy-950 to-transparent" />

        <div className="mx-auto grid min-h-[720px] max-w-7xl grid-cols-1 px-5 py-10 sm:px-6 lg:px-8">
          <div className="relative grid items-center gap-10 lg:grid-cols-[1.05fr_.95fr]">
            <div className="relative z-10 max-w-4xl pt-12 lg:pt-0">
              <p className="text-xs font-extrabold uppercase tracking-[0.32em] text-skybrand-200">
                {school.name}
              </p>
              <h1 className="mt-6 max-w-5xl font-display text-[clamp(3.4rem,10vw,8rem)] font-extrabold uppercase leading-[.88] text-white">
                Learn
                <span className="block text-skybrand-200">Grow</span>
                Together
              </h1>
              <p className="mt-7 max-w-xl text-base font-semibold leading-7 text-slate-200">
                A welcoming elementary school community where children build
                confidence, curiosity, and care for others each day.
              </p>
              <div className="mt-9 flex flex-wrap gap-3">
                <Link
                  className="inline-flex min-h-11 items-center bg-skybrand-500 px-5 text-sm font-extrabold uppercase tracking-wide text-white transition hover:bg-white hover:text-navy-950"
                  href="/events"
                >
                  School calendar
                </Link>
              </div>
            </div>

            <div className="relative min-h-[34rem] lg:min-h-[44rem]">
              <Image
                alt="Balili learners and school community"
                className="absolute bottom-0 right-0 h-[92%] w-[78%] object-cover opacity-95 shadow-[0_40px_110px_rgba(7,27,51,.45)]"
                fill
                sizes="(min-width: 1024px) 42vw, 90vw"
                src="/assets/section-family.webp"
              />
              <div className="absolute inset-y-16 left-0 hidden w-[52%] border border-white/10 bg-white/[.05] backdrop-blur-[2px] lg:block" />
              <div className="absolute bottom-14 left-0 max-w-sm border-l-4 border-skybrand-400 bg-navy-950/78 px-5 py-4 backdrop-blur-md">
                <p className="text-xs font-extrabold uppercase tracking-[0.24em] text-white/45">
                  School ID {school.schoolId}
                </p>
                <p className="mt-3 text-sm font-bold uppercase leading-6 text-white">
                  Serving learners and families in {school.location} with care,
                  discipline, and community partnership.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="bg-navy-950 text-white">
        <div className="mx-auto grid max-w-7xl border-y border-white/10 px-5 sm:grid-cols-2 sm:px-6 lg:grid-cols-4 lg:px-8">
          {stats.map(([label, value]) => (
            <div
              className="border-b border-white/10 py-7 sm:border-r lg:border-b-0"
              key={label}
            >
              <p className="font-display text-4xl font-extrabold">{value}</p>
              <p className="mt-2 text-xs font-bold uppercase tracking-[0.2em] text-white/45">
                {label}
              </p>
            </div>
          ))}
        </div>
      </section>

      <section className="bg-white py-20">
        <div className="mx-auto grid max-w-7xl gap-10 px-5 sm:px-6 lg:grid-cols-[.78fr_1.22fr] lg:px-8">
          <div>
            <p className="text-xs font-extrabold uppercase tracking-[0.28em] text-skybrand-600">
              Our school
            </p>
            <h2 className="mt-5 max-w-xl font-display text-5xl font-extrabold uppercase leading-[.92] text-navy-950 sm:text-6xl">
              A place to learn, belong, and grow.
            </h2>
          </div>
          <div className="grid gap-6 lg:grid-cols-[1fr_.9fr]">
            <div className="border-l-4 border-skybrand-500 pl-6">
              <p className="text-lg font-bold leading-8 text-navy-950">
                Balili Elementary School serves learners and families in{" "}
                {school.location} through a caring public school community
                focused on daily learning, attendance, and steady support.
              </p>
              <p className="mt-5 text-sm leading-7 text-slate-600">
                This site keeps official announcements, school activities,
                learner milestones, and family reminders easy to find in one
                clean public space.
              </p>
            </div>
            <dl className="divide-y divide-slate-200 border-y border-slate-200">
              {[
                ["School ID", school.schoolId],
                ["Principal", school.principal],
                ["Location", school.location],
                ["Office", school.hours],
              ].map(([label, value]) => (
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
          </div>
        </div>
      </section>

      <section className="bg-white py-20">
        <div className="mx-auto grid max-w-7xl gap-10 px-5 sm:px-6 lg:grid-cols-[1.15fr_.85fr] lg:px-8">
          <div>
            <div className="border-b border-navy-950 pb-5">
              <p className="text-xs font-extrabold uppercase tracking-[0.28em] text-skybrand-600">
                Latest bulletin
              </p>
              <h2 className="mt-4 font-display text-5xl font-extrabold uppercase leading-none text-navy-950 sm:text-6xl">
                School news
              </h2>
            </div>

            {lead ? (
              <article className="grid gap-6 py-8 lg:grid-cols-[.92fr_1.08fr]">
                <div className="relative min-h-[24rem] overflow-hidden bg-navy-950">
                  <Image
                    alt="Balili school update"
                    className="h-full w-full object-cover opacity-86"
                    fill
                    src="/assets/news-feature.webp"
                  />
                </div>
                <div className="flex flex-col justify-end">
                  <p className="text-xs font-extrabold uppercase tracking-[0.22em] text-skybrand-600">
                    {formatPublishedDate(lead.published_at)}
                  </p>
                  <h3 className="mt-4 font-display text-4xl font-extrabold leading-[.95] text-navy-950">
                    {lead.title}
                  </h3>
                  <p className="mt-5 text-sm leading-7 text-slate-600">
                    {lead.body}
                  </p>
                  <Link
                    className="mt-7 inline-flex w-fit border border-navy-950 px-5 py-3 text-xs font-extrabold uppercase tracking-[0.18em] text-navy-950 transition hover:bg-navy-950 hover:text-white"
                    href="/announcements"
                  >
                    Read bulletin
                  </Link>
                </div>
              </article>
            ) : (
              <div className="py-8 text-sm leading-7 text-slate-600">
                No published announcements yet. Once a record is published, it
                appears here automatically.
              </div>
            )}
          </div>

          <aside className="border-l border-slate-200 pl-0 lg:pl-8">
            <h3 className="font-display text-2xl font-extrabold uppercase text-navy-950">
              More updates
            </h3>
            <div className="mt-5">
              {secondaryAnnouncements.length ? (
                secondaryAnnouncements.map((item) => (
                  <article
                    className="border-t border-slate-200 py-5"
                    key={item.id}
                  >
                    <p className="text-xs font-bold uppercase tracking-[0.18em] text-slate-400">
                      {formatPublishedDate(item.published_at)}
                    </p>
                    <h4 className="mt-3 font-display text-xl font-extrabold leading-tight text-navy-950">
                      {item.title}
                    </h4>
                  </article>
                ))
              ) : (
                <p className="border-t border-slate-200 py-5 text-sm text-slate-500">
                  Additional updates will appear after publication.
                </p>
              )}
            </div>
          </aside>
        </div>
      </section>

      <section className="bg-navy-950 py-20 text-white">
        <div className="mx-auto grid max-w-7xl gap-12 px-5 sm:px-6 lg:grid-cols-[.82fr_1.18fr] lg:px-8">
          <div>
            <p className="text-xs font-extrabold uppercase tracking-[0.28em] text-skybrand-300">
              Calendar
            </p>
            <h2 className="mt-5 font-display text-5xl font-extrabold uppercase leading-[.92] text-white sm:text-6xl">
              School activities and reminders.
            </h2>
            <p className="mt-6 max-w-md text-sm leading-7 text-slate-300">
              Stay updated on school programs, family meetings, learner
              activities, and community events.
            </p>
            <Link
              className="mt-8 inline-flex w-fit border border-white/35 px-5 py-3 text-xs font-extrabold uppercase tracking-[0.18em] text-white transition hover:border-white hover:bg-white hover:text-navy-950"
              href="/events"
            >
              Open calendar
            </Link>
          </div>
          <div>
            {nextEvents.length ? (
              nextEvents.map((event) => (
                <EventLine event={event} key={event.id} />
              ))
            ) : (
              <div className="border-t border-white/15 py-6 text-sm leading-7 text-slate-300">
                No approved events are scheduled yet.
              </div>
            )}
          </div>
        </div>
      </section>

      <section className="bg-white py-20">
        <div className="mx-auto max-w-7xl px-5 sm:px-6 lg:px-8">
          <div className="grid gap-10 lg:grid-cols-[.7fr_1.3fr]">
            <div>
              <p className="text-xs font-extrabold uppercase tracking-[0.28em] text-skybrand-600">
                Programs
              </p>
              <h2 className="mt-5 font-display text-5xl font-extrabold uppercase leading-[.92] text-navy-950 sm:text-6xl">
                Learning for the whole child.
              </h2>
            </div>
            <div className="grid gap-5 md:grid-cols-3">
              {programs.map((program) => (
                <Link
                  className="group block"
                  href="/programs"
                  key={program.label}
                >
                  <div className="relative aspect-[4/5] overflow-hidden bg-navy-950">
                    <Image
                      alt={`${program.label} at Balili Elementary School`}
                      className="h-full w-full object-cover opacity-88 transition duration-700 group-hover:scale-105"
                      fill
                      src={program.image}
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-navy-950/82 via-transparent to-transparent" />
                    <div className="absolute bottom-0 left-0 right-0 p-5">
                      <p className="text-xs font-extrabold uppercase tracking-[0.22em] text-skybrand-200">
                        {program.label}
                      </p>
                      <h3 className="mt-3 font-display text-xl font-extrabold leading-tight text-white">
                        {program.title}
                      </h3>
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        </div>
      </section>

      <section className="bg-skybrand-50 py-20">
        <div className="mx-auto max-w-7xl px-5 sm:px-6 lg:px-8">
          <div className="relative min-h-[28rem] overflow-hidden bg-navy-950 p-8 text-white sm:p-12 lg:p-16">
            <Image
              alt=""
              className="absolute inset-0 h-full w-full object-cover opacity-24"
              fill
              src="/assets/balili-classroom.webp"
            />
            <div className="relative max-w-4xl">
              <p className="text-xs font-extrabold uppercase tracking-[0.28em] text-skybrand-300">
                Principal
              </p>
              <blockquote className="mt-8 font-display text-4xl font-extrabold uppercase leading-[1.02] text-white sm:text-6xl">
                Children learn best when they are safe, known, and encouraged to
                keep growing.
              </blockquote>
              <p className="mt-8 text-sm font-bold uppercase tracking-[0.18em] text-slate-300">
                {school.principal} / School Principal I
              </p>
            </div>
          </div>
        </div>
      </section>
    </>
  );
}
