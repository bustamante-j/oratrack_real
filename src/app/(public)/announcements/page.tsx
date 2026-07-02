import Image from "next/image";

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
    month: "long",
    day: "numeric",
    year: "numeric",
    timeZone: "Asia/Manila",
  }).format(new Date(value));
}

function formatMonthDay(value: string | null) {
  if (!value) return ["Now", ""];

  const date = new Date(value);

  return [
    new Intl.DateTimeFormat("en-PH", {
      month: "short",
      timeZone: "Asia/Manila",
    }).format(date),
    new Intl.DateTimeFormat("en-PH", {
      day: "2-digit",
      timeZone: "Asia/Manila",
    }).format(date),
  ];
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
  const lead = announcements[0] ?? null;
  const rest = announcements.slice(1);

  return (
    <>
      <PublicHero
        description="Official school reminders, updates, and announcements for learners, parents, and guardians."
        eyebrow="School bulletin"
        image="/assets/section-news.webp"
        title="News and Announcements"
      />

      <section className="bg-white py-20">
        <div className="mx-auto grid max-w-7xl gap-10 px-5 sm:px-6 lg:grid-cols-[1.05fr_.95fr] lg:px-8">
          {lead ? (
            <article className="grid gap-7">
              <div className="relative min-h-[28rem] overflow-hidden bg-navy-950">
                <Image
                  alt="Featured school announcement"
                  className="h-full w-full object-cover opacity-88"
                  fill
                  src="/assets/news-feature.webp"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-navy-950/80 via-transparent to-transparent" />
              </div>
              <div className="border-l-4 border-skybrand-500 pl-6">
                <p className="text-xs font-extrabold uppercase tracking-[0.2em] text-skybrand-600">
                  Latest bulletin / {formatDate(lead.published_at)}
                </p>
                <h2 className="mt-4 font-display text-4xl font-extrabold uppercase leading-[.98] text-navy-950 sm:text-5xl">
                  {lead.title}
                </h2>
                <p className="mt-5 text-sm leading-7 text-slate-600">
                  {lead.body}
                </p>
              </div>
            </article>
          ) : (
            <EmptyState
              message="Published announcements will appear here after school staff add official updates."
              title="No announcements published"
            />
          )}

          <aside className="lg:border-l lg:border-slate-200 lg:pl-8">
            <div className="border-b border-navy-950 pb-5">
              <p className="text-xs font-extrabold uppercase tracking-[0.28em] text-skybrand-600">
                Archive
              </p>
              <h2 className="mt-4 font-display text-4xl font-extrabold uppercase leading-none text-navy-950">
                More updates
              </h2>
            </div>

            {rest.length ? (
              <div className="divide-y divide-slate-200">
                {rest.map((announcement) => {
                  const [month, day] = formatMonthDay(
                    announcement.published_at,
                  );

                  return (
                    <article
                      className="grid gap-4 py-6 sm:grid-cols-[5rem_1fr]"
                      key={announcement.id}
                    >
                      <div className="border border-navy-950/15 py-3 text-center">
                        <p className="text-xs font-extrabold uppercase tracking-[0.16em] text-skybrand-600">
                          {month}
                        </p>
                        <p className="mt-1 font-display text-3xl font-extrabold leading-none text-navy-950">
                          {day}
                        </p>
                      </div>
                      <div>
                        <h3 className="font-display text-xl font-extrabold leading-tight text-navy-950">
                          {announcement.title}
                        </h3>
                        <p className="mt-3 line-clamp-3 text-sm leading-7 text-slate-600">
                          {announcement.body}
                        </p>
                      </div>
                    </article>
                  );
                })}
              </div>
            ) : lead ? (
              <p className="py-6 text-sm leading-7 text-slate-500">
                Additional bulletins will appear here after publication.
              </p>
            ) : null}
          </aside>
        </div>
      </section>
    </>
  );
}
