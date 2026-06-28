import Image from "next/image";
import { BellRing, Clock3 } from "lucide-react";

import { EmptyState } from "@/components/ui/empty-state";
import { PublicHero } from "@/components/public-hero";
import { createSupabaseServerClient } from "@/lib/supabase/server";

export const metadata = {
  title: "News and Announcements",
};

type Announcement = {
  id: string;
  title: string;
  body: string;
  published_at: string | null;
};

function formatDate(value: string | null) {
  if (!value) return "Published";

  return new Intl.DateTimeFormat("en-PH", {
    dateStyle: "medium",
    timeZone: "Asia/Manila",
  }).format(new Date(value));
}

export default async function AnnouncementsPage() {
  const supabase = await createSupabaseServerClient();
  const { data, error } = await supabase
    .from("public_announcements")
    .select("id,title,body,published_at")
    .not("published_at", "is", null)
    .order("published_at", { ascending: false });

  if (error) {
    throw new Error(error.message);
  }

  const announcements = (data ?? []) as Announcement[];

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
          <div className="grid gap-4">
            {announcements.length ? (
              announcements.map((announcement, index) => (
                <article
                  className="shine-card rounded-[1.75rem] border border-slate-200 bg-white p-7 shadow-soft transition hover:-translate-y-1 hover:border-skybrand-300 hover:shadow-glow"
                  key={announcement.id}
                >
                  <div className="flex items-start justify-between gap-3">
                    <div
                      className={`grid size-14 place-items-center rounded-2xl bg-gradient-to-br text-white shadow-lg ${
                        [
                          "from-skybrand-500 to-blue-600",
                          "from-emerald-500 to-teal-600",
                          "from-amber-400 to-orange-500",
                          "from-violet-500 to-indigo-600",
                        ][index % 4]
                      }`}
                    >
                      <BellRing size={27} />
                    </div>
                    <span className="inline-flex items-center gap-1 rounded-full bg-slate-50 px-2.5 py-1 text-[10px] font-extrabold uppercase text-slate-600">
                      <Clock3 size={12} />
                      {formatDate(announcement.published_at)}
                    </span>
                  </div>
                  <h2 className="mt-6 font-display text-2xl font-extrabold text-navy-950">
                    {announcement.title}
                  </h2>
                  <p className="mt-3 text-sm leading-7 text-slate-600">
                    {announcement.body}
                  </p>
                </article>
              ))
            ) : (
              <EmptyState
                message="Published announcements will appear here after school staff add official updates."
                title="No announcements published"
              />
            )}
          </div>

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
      </section>
    </>
  );
}
