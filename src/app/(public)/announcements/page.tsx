import Image from "next/image";
import { BellRing, Clock3, Pin } from "lucide-react";

import { EmptyState } from "@/components/ui/empty-state";
import { PublicHero } from "@/components/public-hero";

export const metadata = {
  title: "News and Announcements",
};

export default function AnnouncementsPage() {
  return (
    <>
      <PublicHero
        description="A clearer bulletin space for official school updates, reminders, and learner milestones."
        eyebrow="School bulletin"
        image="/assets/section-news.webp"
        title="News and Announcements"
      />

      <section className="relative overflow-hidden bg-white py-20">
        <div className="absolute inset-0 newsprint opacity-70" />
        <div className="relative mx-auto grid max-w-7xl gap-8 px-4 sm:px-6 lg:grid-cols-[.95fr_1.05fr] lg:px-8">
          <article className="shine-card rounded-[1.75rem] border border-skybrand-200 bg-gradient-to-br from-skybrand-50 to-white p-7 shadow-glow">
            <div className="flex items-start justify-between gap-3">
              <div className="grid size-14 place-items-center rounded-2xl bg-gradient-to-br from-skybrand-500 to-blue-600 text-white shadow-lg">
                <BellRing size={27} />
              </div>
              <span className="inline-flex items-center gap-1 rounded-full bg-white px-2.5 py-1 text-[10px] font-extrabold uppercase text-navy-950 shadow-sm">
                <Pin size={12} />
                Ready
              </span>
            </div>
            <h2 className="mt-6 font-display text-2xl font-extrabold text-navy-950">
              Public announcements are ready for database publishing.
            </h2>
            <p className="mt-3 text-sm leading-7 text-slate-600">
              Once admin publishing is enabled, featured notices can appear here
              with categories, audience labels, and publish dates.
            </p>
            <p className="mt-5 flex items-center gap-2 text-xs font-bold text-slate-400">
              <Clock3 size={14} /> Empty production state
            </p>
          </article>

          <div className="relative min-h-[24rem] overflow-hidden rounded-[2rem] bg-navy-950 shadow-editorial">
            <Image
              alt="Balili school news feature"
              className="h-full w-full object-cover opacity-85"
              fill
              src="/assets/news-feature.webp"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-navy-950 via-navy-950/20 to-transparent" />
          </div>
        </div>
        <div className="relative mx-auto mt-8 max-w-7xl px-4 sm:px-6 lg:px-8">
          <EmptyState
            message="Announcements will be published from the database after public publishing permissions are enabled."
            title="No announcements published"
          />
        </div>
      </section>
    </>
  );
}
