import Image from "next/image";
import Link from "next/link";
import {
  ArrowRight,
  ArrowUpRight,
  BadgeCheck,
  BarChart3,
  BellRing,
  BookOpen,
  CalendarDays,
  ChevronRight,
  Clock3,
  GraduationCap,
  HeartHandshake,
  Leaf,
  MapPin,
  Medal,
  Megaphone,
  Palette,
  Pin,
  Play,
  Quote,
  Salad,
  ShieldCheck,
  Sparkles,
  Trophy,
  UserRoundCheck,
  UsersRound,
} from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { ButtonLink } from "@/components/ui/button";
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

const communityFeatures = [
  {
    icon: ShieldCheck,
    title: "Safe and inclusive",
    text: "A welcoming environment where children can learn with confidence.",
  },
  {
    icon: BarChart3,
    title: "Thoughtful support",
    text: "Progress and attendance insights guide timely, caring action.",
  },
  {
    icon: HeartHandshake,
    title: "Family partnership",
    text: "Families are valued partners in every child's school journey.",
  },
  {
    icon: Leaf,
    title: "Local identity",
    text: "Learning honors community, culture, and the Cordillera environment.",
  },
];

const stats = [
  {
    value: "180+",
    label: "Learners supported",
    icon: UsersRound,
  },
  {
    value: "30",
    label: "Dedicated teachers",
    icon: UserRoundCheck,
  },
  {
    value: "95.1%",
    label: "Current attendance",
    icon: BarChart3,
  },
  {
    value: "6",
    label: "Grade levels",
    icon: BookOpen,
  },
];

const programs = [
  {
    icon: BookOpen,
    image: "/assets/program-reading.webp",
    title: "Reading and Literacy",
    text: "Guided reading, buddy sessions, and inviting classroom libraries help every child become a confident reader.",
    color: "bg-skybrand-500",
    tint: "from-skybrand-50 to-white",
  },
  {
    icon: Salad,
    image: "/assets/program-nutrition.webp",
    title: "School Nutrition",
    text: "Nutrition education and feeding support help learners stay healthy, active, and ready to learn.",
    color: "bg-emerald-500",
    tint: "from-emerald-50 to-white",
  },
  {
    icon: Trophy,
    image: "/assets/program-sports.webp",
    title: "Sports and Wellness",
    text: "Movement, team activities, and wellness lessons build healthy habits and joyful confidence.",
    color: "bg-violet-500",
    tint: "from-violet-50 to-white",
  },
  {
    icon: Palette,
    image: "/assets/program-arts.webp",
    title: "Arts and Culture",
    text: "Music, visual arts, dance, and local traditions give learners more ways to express themselves.",
    color: "bg-rose-500",
    tint: "from-rose-50 to-white",
  },
  {
    icon: ShieldCheck,
    image: "/assets/section-support.webp",
    title: "Learner Support",
    text: "Teachers coordinate remediation, family follow-ups, and practical classroom interventions.",
    color: "bg-amber-500",
    tint: "from-amber-50 to-white",
  },
  {
    icon: HeartHandshake,
    image: "/assets/section-family.webp",
    title: "Family Partnerships",
    text: "Regular meetings and volunteer programs make families active partners in school life.",
    color: "bg-blue-600",
    tint: "from-blue-50 to-white",
  },
];

const announcements = [
  {
    id: "A-001",
    title: "First Quarter Parent Meeting",
    category: "School Update",
    date: "2026-06-26",
    audience: "Parents and guardians",
    content:
      "Parents and guardians are invited to the school covered court for orientation, class updates, and family partnership reminders.",
    pinned: true,
    icon: Megaphone,
    gradient: "from-skybrand-500 to-blue-600",
    accent: "bg-skybrand-500",
    ink: "text-skybrand-600",
  },
  {
    id: "A-002",
    title: "Nutrition Month Activities",
    category: "Student Activity",
    date: "2026-07-03",
    audience: "All learners",
    content:
      "Classes will prepare healthy meal posters and join a school-wide wellness program.",
    pinned: false,
    icon: Sparkles,
    gradient: "from-amber-400 to-orange-500",
    accent: "bg-amber-500",
    ink: "text-amber-700",
  },
  {
    id: "A-003",
    title: "School Supplies Donation Drive",
    category: "Community",
    date: "2026-07-08",
    audience: "School community",
    content:
      "The school is accepting notebooks, pencils, art supplies, and gently used storybooks at the main office.",
    pinned: false,
    icon: HeartHandshake,
    gradient: "from-emerald-500 to-teal-600",
    accent: "bg-emerald-500",
    ink: "text-emerald-700",
  },
  {
    id: "A-004",
    title: "Quarterly Assessment Schedule",
    category: "Academic",
    date: "2026-07-20",
    audience: "Grades 1 to 6",
    content:
      "Quarterly assessments will run from July 20 to July 23. Class advisers will share the subject schedule.",
    pinned: false,
    icon: GraduationCap,
    gradient: "from-violet-500 to-indigo-600",
    accent: "bg-violet-500",
    ink: "text-violet-700",
  },
];

const events = [
  {
    id: "E-001",
    title: "Nutrition Month Launch",
    date: "2026-07-03",
    month: "Jul",
    day: "03",
    time: "9:00 AM",
    type: "Student Activity",
    location: "School Quadrangle",
    description: "A morning of health, food, and wellness activities.",
  },
  {
    id: "E-002",
    title: "Reading Buddy Day",
    date: "2026-07-10",
    month: "Jul",
    day: "10",
    time: "10:00 AM",
    type: "Academic",
    location: "Library and Classrooms",
    description: "Older pupils read with younger learning partners.",
  },
  {
    id: "E-003",
    title: "Quarterly Assessments",
    date: "2026-07-20",
    month: "Jul",
    day: "20",
    time: "7:30 AM",
    type: "Academic",
    location: "Classrooms",
    description: "Quarterly assessments for Grades 1 to 6.",
  },
  {
    id: "E-004",
    title: "Clean and Green Day",
    date: "2026-07-31",
    month: "Jul",
    day: "31",
    time: "7:00 AM",
    type: "Community",
    location: "School Grounds",
    description: "Campus care day with families and local partners.",
  },
];

const calendarDays = [
  "",
  "",
  "",
  "1",
  "2",
  "3",
  "4",
  "5",
  "6",
  "7",
  "8",
  "9",
  "10",
  "11",
  "12",
  "13",
  "14",
  "15",
  "16",
  "17",
  "18",
  "19",
  "20",
  "21",
  "22",
  "23",
  "24",
  "25",
  "26",
  "27",
  "28",
  "29",
  "30",
  "31",
  "",
];

const eventDays = new Set(["3", "10", "20", "31"]);

function formatDate(date: string) {
  return new Intl.DateTimeFormat("en-PH", {
    month: "short",
    day: "numeric",
    year: "numeric",
  }).format(new Date(`${date}T00:00:00`));
}

export default function HomePage() {
  const lead = announcements[0];
  const LeadIcon = lead.icon;
  const tickerItems = [...announcements, ...announcements];

  return (
    <>
      <section className="hero-noise relative overflow-hidden bg-navy-950 pb-10 text-white lg:min-h-[800px] lg:pb-0">
        <Image
          alt="Learners arriving at Balili Elementary School"
          className="absolute inset-0 h-full w-full object-cover"
          fill
          priority
          src="/assets/balili-campus-hero.webp"
        />
        <div className="absolute inset-0 bg-gradient-to-r from-navy-950 via-navy-950/82 to-transparent" />
        <div className="absolute inset-0 bg-gradient-to-t from-navy-950/75 via-transparent to-navy-950/10" />
        <div className="absolute left-0 right-0 top-0 h-32 bg-gradient-to-b from-navy-950/50 to-transparent" />

        <div className="relative mx-auto flex min-h-[620px] max-w-7xl items-center px-4 pb-28 pt-20 sm:min-h-[690px] sm:px-6 lg:min-h-[800px] lg:px-8 lg:pb-44">
          <div className="max-w-3xl">
            <span className="inline-flex items-center gap-2 rounded-full border border-white/20 bg-white/10 px-4 py-2 text-xs font-bold uppercase text-skybrand-200 backdrop-blur-md">
              <Sparkles size={14} />
              Welcome to Balili Elementary School
            </span>
            <h1 className="text-balance mt-7 font-display text-5xl font-extrabold leading-none sm:text-6xl lg:text-[5.35rem]">
              {school.name}
              <span className="mt-3 block bg-gradient-to-r from-skybrand-300 to-white bg-clip-text text-transparent">
                Growing minds. Building bright futures.
              </span>
            </h1>
            <p className="mt-7 max-w-xl text-base leading-8 text-slate-200 sm:text-lg">
              A caring mountain community where every learner is known,
              encouraged, and given the tools to thrive.
            </p>
            <div className="mt-9 flex flex-wrap gap-3">
              <ButtonLink className="px-6 py-3.5" href="/about">
                Discover our school
                <ArrowRight size={17} />
              </ButtonLink>
              <Link
                className="inline-flex items-center gap-3 rounded-xl border border-white/25 bg-white/10 px-5 py-3.5 text-sm font-bold text-white backdrop-blur-md transition hover:bg-white/20"
                href="/programs"
              >
                <span className="grid size-7 place-items-center rounded-full bg-white text-navy-950">
                  <Play fill="currentColor" size={12} />
                </span>
                Explore programs
              </Link>
            </div>
            <div className="mt-10 flex flex-wrap gap-x-6 gap-y-3 text-sm font-medium text-slate-200">
              {[
                "Child-friendly campus",
                "Community supported",
                "Data-informed care",
              ].map((item) => (
                <span className="flex items-center gap-2" key={item}>
                  <BadgeCheck size={18} className="text-skybrand-300" />
                  {item}
                </span>
              ))}
            </div>
          </div>
        </div>

        <div className="relative z-10 -mt-16 px-4 sm:px-6 lg:absolute lg:bottom-0 lg:left-0 lg:right-0 lg:mt-0 lg:px-8">
          <div className="mx-auto max-w-7xl">
            <div className="grid overflow-hidden rounded-t-[2rem] border border-white/15 bg-white shadow-[0_-15px_55px_rgba(7,27,51,.18)] sm:grid-cols-2 lg:grid-cols-4">
              {quickLinks.map((item, index) => {
                const Icon = item.icon;
                return (
                  <Link
                    className={`shine-card group relative flex items-center gap-4 overflow-hidden p-5 transition hover:bg-slate-50 lg:p-6 ${
                      index
                        ? "border-t border-slate-100 sm:border-l sm:border-t-0"
                        : ""
                    } ${index === 2 ? "sm:border-l-0 lg:border-l" : ""}`}
                    href={item.href}
                    key={item.href}
                  >
                    <div
                      className={`grid size-12 shrink-0 place-items-center rounded-2xl bg-gradient-to-br text-white shadow-lg ${item.color}`}
                    >
                      <Icon size={22} />
                    </div>
                    <div className="min-w-0">
                      <p className="font-display text-sm font-extrabold text-navy-950">
                        {item.label}
                      </p>
                      <p className="mt-1 truncate text-xs text-slate-500">
                        {item.text}
                      </p>
                    </div>
                    <ChevronRight
                      className="ml-auto shrink-0 text-slate-300 transition group-hover:translate-x-1 group-hover:text-skybrand-500"
                      size={17}
                    />
                  </Link>
                );
              })}
            </div>
          </div>
        </div>
      </section>

      <section className="relative overflow-hidden py-24">
        <div className="absolute inset-0 soft-grid opacity-50" />
        <div className="relative mx-auto grid max-w-7xl gap-14 px-4 sm:px-6 lg:grid-cols-[1.05fr_.95fr] lg:items-center lg:px-8">
          <div className="relative">
            <div className="relative overflow-hidden rounded-[2rem] shadow-[0_30px_80px_rgba(7,27,51,.18)]">
              <Image
                alt="Balili pupils learning together in the classroom"
                className="aspect-[4/3] h-full w-full object-cover"
                height={900}
                src="/assets/balili-classroom.webp"
                width={1200}
              />
              <div className="absolute inset-0 bg-gradient-to-t from-navy-950/45 via-transparent to-transparent" />
              <div className="glass-panel absolute bottom-5 left-5 right-5 rounded-2xl p-4 text-white sm:max-w-xs">
                <p className="text-xs font-bold uppercase text-skybrand-200">
                  Learning together
                </p>
                <p className="mt-1 text-sm font-semibold leading-6">
                  Curiosity grows when every child has a voice at the table.
                </p>
              </div>
            </div>
            <div className="absolute -bottom-7 right-4 hidden rounded-2xl bg-amber-400 p-5 text-navy-950 shadow-xl sm:block">
              <Medal size={24} />
              <p className="mt-3 font-display text-2xl font-extrabold">6</p>
              <p className="text-xs font-bold">Grade levels</p>
            </div>
          </div>

          <div>
            <p className="flex items-center gap-3 text-xs font-bold uppercase text-skybrand-600">
              <span className="h-px w-10 bg-skybrand-500" />A school that sees
              every learner
            </p>
            <h2 className="text-balance mt-5 font-display text-4xl font-extrabold leading-tight text-navy-950 sm:text-5xl">
              Rooted in community, moving forward with purpose.
            </h2>
            <p className="mt-6 text-base leading-8 text-slate-600">
              Balili Elementary School combines the warmth of a close-knit
              community with clear, timely information that helps teachers and
              families respond to every learner&apos;s needs.
            </p>
            <div className="mt-8 grid gap-4 sm:grid-cols-2">
              {communityFeatures.map((feature) => {
                const Icon = feature.icon;
                return (
                  <div className="flex gap-3" key={feature.title}>
                    <div className="grid size-10 shrink-0 place-items-center rounded-xl bg-skybrand-50 text-skybrand-600">
                      <Icon size={19} />
                    </div>
                    <div>
                      <h3 className="text-sm font-bold text-navy-950">
                        {feature.title}
                      </h3>
                      <p className="mt-1 text-xs leading-5 text-slate-500">
                        {feature.text}
                      </p>
                    </div>
                  </div>
                );
              })}
            </div>
            <Link
              className="mt-8 inline-flex items-center gap-2 text-sm font-bold text-skybrand-600 hover:text-navy-900"
              href="/about"
            >
              Learn more about Balili
              <ArrowRight size={16} />
            </Link>
          </div>
        </div>
      </section>

      <section className="relative overflow-hidden bg-navy-950 py-14 text-white">
        <div className="absolute inset-0 public-grid opacity-10" />
        <div className="relative mx-auto grid max-w-7xl gap-8 px-4 sm:grid-cols-2 sm:px-6 lg:grid-cols-4 lg:px-8">
          {stats.map((stat, index) => {
            const Icon = stat.icon;
            return (
              <div
                className={`flex items-center gap-5 border-white/10 sm:border-l sm:pl-7 ${
                  index === 0 ? "sm:border-l-0 sm:pl-0" : ""
                }`}
                key={stat.label}
              >
                <div className="grid size-12 shrink-0 place-items-center rounded-2xl bg-white/10 text-skybrand-300">
                  <Icon size={22} />
                </div>
                <div>
                  <p className="font-display text-3xl font-extrabold">
                    {stat.value}
                  </p>
                  <p className="mt-1 text-xs font-medium text-slate-300">
                    {stat.label}
                  </p>
                </div>
              </div>
            );
          })}
        </div>
      </section>

      <section className="bg-gradient-to-b from-white to-skybrand-50/50 py-24">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="mx-auto max-w-3xl text-center">
            <p className="text-xs font-bold uppercase text-skybrand-600">
              Programs that help children flourish
            </p>
            <h2 className="text-balance mt-4 font-display text-4xl font-extrabold text-navy-950 sm:text-5xl">
              Learning goes beyond the lesson.
            </h2>
            <p className="mt-5 text-base leading-8 text-slate-600">
              Our programs nurture strong foundations, healthy habits,
              creativity, character, and belonging.
            </p>
          </div>

          <div className="scroll-soft mt-12 flex snap-x gap-5 overflow-x-auto pb-4 lg:grid lg:grid-cols-3 lg:overflow-visible lg:pb-0">
            {programs.map((program) => {
              const Icon = program.icon;
              return (
                <article
                  className="shine-card group relative flex min-h-[27rem] w-[min(22rem,86vw)] shrink-0 snap-start flex-col overflow-hidden rounded-[1.75rem] border border-slate-200 bg-white transition duration-500 hover:-translate-y-1.5 hover:shadow-glow lg:w-auto"
                  key={program.title}
                >
                  <div className="relative h-44 shrink-0 overflow-hidden">
                    <Image
                      alt={`${program.title} at Balili Elementary School`}
                      className="h-full w-full object-cover transition duration-700 group-hover:scale-105"
                      fill
                      src={program.image}
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-navy-950/65 via-transparent to-transparent" />
                    <div
                      className={`absolute bottom-4 left-5 grid size-12 place-items-center rounded-2xl text-white shadow-lg ring-4 ring-white/25 transition duration-300 group-hover:rotate-3 group-hover:scale-110 ${program.color}`}
                    >
                      <Icon size={24} />
                    </div>
                  </div>
                  <div
                    className={`flex flex-1 flex-col bg-gradient-to-br p-6 ${program.tint}`}
                  >
                    <h3 className="font-display text-xl font-extrabold text-navy-950">
                      {program.title}
                    </h3>
                    <p className="mt-3 flex-1 text-sm leading-7 text-slate-500">
                      {program.text}
                    </p>
                    <Link
                      className="mt-5 flex items-center gap-2 text-xs font-bold uppercase text-navy-900"
                      href="/programs"
                    >
                      Discover program
                      <ArrowRight size={15} />
                    </Link>
                  </div>
                </article>
              );
            })}
          </div>
        </div>
      </section>

      <section className="relative overflow-hidden bg-white py-24">
        <div className="absolute inset-0 newsprint opacity-80" />
        <div className="relative mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col justify-between gap-5 border-b-2 border-navy-950 pb-6 sm:flex-row sm:items-end">
            <div>
              <p className="text-xs font-extrabold uppercase text-skybrand-600">
                From our school community
              </p>
              <h2 className="mt-3 font-editorial text-5xl font-extrabold leading-none text-navy-950 sm:text-6xl">
                The Balili Bulletin
              </h2>
              <p className="mt-3 max-w-2xl text-sm leading-7 text-slate-600">
                A livelier front-page digest for reminders, learner moments, and
                community activities.
              </p>
            </div>
            <Link
              className="inline-flex w-fit items-center gap-2 rounded-full border border-navy-950 bg-navy-950 px-5 py-3 text-sm font-extrabold text-white transition hover:-translate-y-0.5 hover:border-skybrand-600 hover:bg-skybrand-600"
              href="/announcements"
            >
              View all school news
              <ArrowRight size={16} />
            </Link>
          </div>

          <div className="marquee-mask mt-5 overflow-hidden border-y border-slate-300 bg-white/70 py-3 backdrop-blur">
            <div className="marquee-track flex w-max gap-8">
              {tickerItems.map((item, index) => (
                <span
                  className="flex items-center gap-3 text-xs font-extrabold uppercase text-navy-950"
                  key={`${item.id}-${index}`}
                >
                  <span className={`size-2.5 rounded-full ${item.accent}`} />
                  {item.title}
                  <span className="text-slate-400">
                    {formatDate(item.date)}
                  </span>
                </span>
              ))}
            </div>
          </div>

          <div className="mt-10 grid gap-6 lg:grid-cols-[1.28fr_.72fr]">
            <article className="shine-card group relative min-h-[31rem] overflow-hidden rounded-[2rem] bg-navy-950 text-white shadow-editorial">
              <Image
                alt="Balili learners enjoying a featured school activity"
                className="absolute inset-0 h-full w-full object-cover opacity-70 transition duration-1000 group-hover:scale-105"
                fill
                src="/assets/news-feature.webp"
              />
              <div className="absolute inset-0 bg-gradient-to-r from-navy-950 via-navy-950/80 to-navy-950/25" />
              <div className="absolute inset-x-0 bottom-0 h-2/3 bg-gradient-to-t from-navy-950 via-navy-950/80 to-transparent" />
              <div className="relative flex min-h-[31rem] flex-col justify-end p-7 sm:p-10">
                <div className="mb-6 flex flex-wrap items-center gap-2">
                  <Badge tone="emerald">Lead story</Badge>
                  {lead.pinned ? (
                    <span className="inline-flex items-center gap-1 rounded-full bg-amber-300 px-3 py-1 text-[10px] font-extrabold uppercase text-navy-950">
                      <Pin size={12} />
                      Pinned
                    </span>
                  ) : null}
                </div>
                <div className="grid max-w-3xl gap-6 sm:grid-cols-[auto_1fr] sm:items-start">
                  <div
                    className={`grid size-16 place-items-center rounded-3xl bg-gradient-to-br ${lead.gradient} shadow-xl shadow-black/20`}
                  >
                    <LeadIcon size={32} />
                  </div>
                  <div>
                    <p className="text-xs font-extrabold uppercase text-skybrand-200">
                      {lead.category} - {formatDate(lead.date)}
                    </p>
                    <h3 className="mt-3 font-editorial text-4xl font-extrabold leading-none sm:text-5xl">
                      {lead.title}
                    </h3>
                    <p className="mt-5 max-w-2xl text-base leading-8 text-slate-200">
                      {lead.content}
                    </p>
                    <Link
                      className="mt-7 inline-flex items-center gap-2 rounded-xl bg-white px-5 py-3 text-sm font-extrabold text-navy-950 transition hover:-translate-y-0.5 hover:bg-skybrand-100"
                      href="/announcements"
                    >
                      Read the bulletin
                      <ArrowRight size={16} />
                    </Link>
                  </div>
                </div>
              </div>
            </article>

            <div className="grid gap-4">
              {announcements.slice(1).map((item) => {
                const Icon = item.icon;
                return (
                  <article
                    className="group relative overflow-hidden rounded-[1.6rem] border border-slate-200 bg-white p-5 shadow-soft transition duration-500 hover:-translate-y-1 hover:border-skybrand-300 hover:shadow-glow"
                    key={item.id}
                  >
                    <div className="relative flex gap-4">
                      <div
                        className={`grid size-12 shrink-0 place-items-center rounded-2xl bg-gradient-to-br ${item.gradient} text-white shadow-md transition duration-500 group-hover:rotate-6 group-hover:scale-110`}
                      >
                        <Icon size={24} />
                      </div>
                      <div className="min-w-0">
                        <p
                          className={`text-[10px] font-extrabold uppercase ${item.ink}`}
                        >
                          {item.category} - {formatDate(item.date)}
                        </p>
                        <h3 className="mt-2 font-display text-lg font-extrabold leading-tight text-navy-950">
                          {item.title}
                        </h3>
                        <p className="mt-2 text-xs leading-6 text-slate-500">
                          {item.content}
                        </p>
                      </div>
                    </div>
                  </article>
                );
              })}
              <article className="relative overflow-hidden rounded-[1.6rem] bg-gradient-to-br from-navy-950 to-navy-800 p-6 text-white shadow-editorial">
                <p className="text-xs font-extrabold uppercase text-skybrand-300">
                  Quick notice
                </p>
                <h3 className="mt-3 font-display text-2xl font-extrabold">
                  Save important dates early.
                </h3>
                <p className="mt-3 text-sm leading-7 text-slate-300">
                  The Events page now has a clean monthly calendar for families
                  and advisers.
                </p>
                <Link
                  className="mt-5 inline-flex items-center gap-2 text-sm font-bold text-skybrand-200"
                  href="/events"
                >
                  Open events
                  <ArrowRight size={15} />
                </Link>
              </article>
            </div>
          </div>
        </div>
      </section>

      <section className="relative overflow-hidden bg-slate-50 py-24">
        <div className="absolute inset-0 soft-grid opacity-40" />
        <div className="relative mx-auto grid max-w-7xl gap-10 px-4 sm:px-6 lg:grid-cols-[.72fr_1.28fr] lg:items-center lg:px-8">
          <div>
            <p className="text-xs font-extrabold uppercase text-skybrand-600">
              School calendar
            </p>
            <h2 className="text-balance mt-4 font-display text-4xl font-extrabold text-navy-950">
              Plan around the moments that bring Balili together.
            </h2>
            <p className="mt-5 max-w-lg text-base leading-8 text-slate-600">
              A compact calendar preview for families who want dates at a
              glance, with the full events page ready for deeper planning.
            </p>
            <div className="mt-7 grid gap-3">
              {events.map((event, index) => (
                <EventCard event={event} index={index} key={event.id} />
              ))}
            </div>
            <Link
              className="shine-card relative mt-7 inline-flex items-center gap-2 overflow-hidden rounded-xl bg-navy-900 px-5 py-3 text-sm font-bold text-white transition hover:-translate-y-0.5 hover:bg-skybrand-600"
              href="/events"
            >
              Open full calendar
              <CalendarDays size={17} />
            </Link>
          </div>

          <div className="grid overflow-hidden rounded-[2rem] border border-slate-200 bg-white shadow-editorial xl:grid-cols-[1fr_.8fr]">
            <div className="p-5 sm:p-7">
              <div className="mb-4 flex items-center justify-between gap-4">
                <div>
                  <p className="text-xs font-extrabold uppercase text-skybrand-600">
                    At a glance
                  </p>
                  <h3 className="mt-2 font-display text-2xl font-extrabold text-navy-950">
                    July 2026
                  </h3>
                </div>
                <Badge tone="emerald">{events.length} events</Badge>
              </div>
              <div className="grid grid-cols-7 gap-1 text-center text-[11px] font-extrabold uppercase text-slate-400">
                {["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"].map(
                  (day) => (
                    <span className="py-2" key={day}>
                      {day}
                    </span>
                  ),
                )}
              </div>
              <div className="mt-1 grid grid-cols-7 gap-1">
                {calendarDays.map((day, index) => (
                  <span
                    className={`relative grid aspect-square place-items-center rounded-xl text-sm font-bold ${
                      day
                        ? eventDays.has(day)
                          ? "bg-navy-900 text-white shadow-[0_8px_20px_rgba(11,36,71,.18)]"
                          : "text-slate-600 hover:bg-skybrand-50"
                        : "text-transparent"
                    }`}
                    key={`${day || "blank"}-${index}`}
                  >
                    {day || "."}
                    {day && eventDays.has(day) ? (
                      <span className="absolute bottom-1.5 size-1.5 rounded-full bg-skybrand-300" />
                    ) : null}
                  </span>
                ))}
              </div>
            </div>

            <div className="bg-gradient-to-br from-navy-950 to-navy-800 p-6 text-white sm:p-7">
              <p className="text-xs font-extrabold uppercase text-skybrand-300">
                Selected date
              </p>
              <h3 className="mt-2 font-display text-2xl font-extrabold">
                July 3, 2026
              </h3>
              <div className="mt-6 space-y-3">
                <article className="rounded-2xl border border-white/10 bg-white/[.08] p-4 backdrop-blur-md">
                  <Badge tone="emerald">Student Activity</Badge>
                  <h4 className="mt-3 font-display text-lg font-extrabold">
                    Nutrition Month Launch
                  </h4>
                  <p className="mt-2 text-sm leading-6 text-slate-300">
                    A morning of health, food, and wellness activities.
                  </p>
                  <div className="mt-4 grid gap-2 text-xs font-semibold text-slate-300">
                    <span className="flex items-center gap-2">
                      <Clock3 size={14} className="text-skybrand-300" />
                      9:00 AM
                    </span>
                    <span className="flex items-center gap-2">
                      <MapPin size={14} className="text-skybrand-300" />
                      School Quadrangle
                    </span>
                  </div>
                </article>
                <div className="rounded-2xl border border-dashed border-white/20 p-5 text-sm leading-7 text-slate-300">
                  Pick highlighted dates in the full events page for more
                  schedule details.
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="py-24">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="relative overflow-hidden rounded-[2.3rem] bg-navy-950 px-7 py-14 text-white shadow-[0_35px_90px_rgba(7,27,51,.23)] sm:px-12 lg:px-16">
            <Image
              alt=""
              className="absolute inset-0 h-full w-full object-cover opacity-20"
              fill
              src="/assets/balili-classroom.webp"
            />
            <div className="absolute inset-0 bg-gradient-to-r from-navy-950 via-navy-950/95 to-navy-950/65" />
            <div className="relative grid gap-10 lg:grid-cols-[1fr_auto] lg:items-center">
              <div className="max-w-3xl">
                <Quote size={34} className="text-skybrand-400" />
                <blockquote className="text-balance mt-6 font-display text-2xl font-extrabold leading-relaxed sm:text-3xl">
                  &quot;Children do their best learning when they feel safe,
                  known, and encouraged to keep growing.&quot;
                </blockquote>
                <p className="mt-6 text-sm font-bold">
                  Dr. Elena D. Reyes{" "}
                  <span className="font-normal text-slate-400">
                    - School Principal
                  </span>
                </p>
              </div>
              <Link
                className="inline-flex w-fit items-center gap-2 rounded-xl bg-skybrand-500 px-6 py-3.5 text-sm font-bold text-white transition hover:bg-skybrand-400"
                href="/contact"
              >
                Connect with our school
                <ArrowUpRight size={17} />
              </Link>
            </div>
          </div>
        </div>
      </section>
    </>
  );
}

function EventCard({
  event,
  index,
}: {
  event: (typeof events)[number];
  index: number;
}) {
  const colors = [
    "bg-skybrand-500",
    "bg-violet-500",
    "bg-emerald-500",
    "bg-amber-500",
  ];

  return (
    <article className="shine-card group relative flex gap-4 overflow-hidden rounded-2xl border border-slate-200 bg-white p-4 transition duration-500 hover:-translate-y-1 hover:border-skybrand-300 hover:shadow-glow">
      <div
        className={`flex size-16 shrink-0 flex-col items-center justify-center rounded-2xl text-center text-white shadow-md ${
          colors[index % colors.length]
        }`}
      >
        <span className="text-[10px] font-bold uppercase">{event.month}</span>
        <span className="font-display text-2xl font-extrabold">
          {event.day}
        </span>
      </div>
      <div className="min-w-0 flex-1">
        <p className="text-[10px] font-bold uppercase text-skybrand-600">
          {event.type}
        </p>
        <h3 className="mt-1 truncate font-display font-bold text-navy-950">
          {event.title}
        </h3>
        <p className="mt-1 text-xs text-slate-500">
          {event.time} - {event.location}
        </p>
      </div>
      <ChevronRight
        className="mt-5 shrink-0 text-slate-300 transition group-hover:translate-x-1 group-hover:text-skybrand-500"
        size={18}
      />
    </article>
  );
}
