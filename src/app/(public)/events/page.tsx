import { EmptyState } from "@/components/ui/empty-state";
import { PublicHero } from "@/components/public-hero";
import { school } from "@/lib/constants";
import { createSupabaseServerClient } from "@/lib/supabase/server";

export const metadata = {
  title: "Events",
};

type PublicEvent = {
  id: string;
  title: string;
  body: string | null;
  starts_at: string;
  ends_at: string | null;
  published_at: string | null;
  location?: string | null;
  event_type?: string | null;
};

function formatMonth(value: string) {
  return new Intl.DateTimeFormat("en-PH", {
    month: "short",
    timeZone: "Asia/Manila",
  }).format(new Date(value));
}

function formatDay(value: string) {
  return new Intl.DateTimeFormat("en-PH", {
    day: "2-digit",
    timeZone: "Asia/Manila",
  }).format(new Date(value));
}

function formatDateTime(value: string) {
  return new Intl.DateTimeFormat("en-PH", {
    weekday: "short",
    month: "long",
    day: "numeric",
    year: "numeric",
    hour: "numeric",
    minute: "2-digit",
    timeZone: "Asia/Manila",
  }).format(new Date(value));
}

function formatTime(value: string | null) {
  if (!value) return null;

  return new Intl.DateTimeFormat("en-PH", {
    hour: "numeric",
    minute: "2-digit",
    timeZone: "Asia/Manila",
  }).format(new Date(value));
}

async function getPublishedEvents() {
  const supabase = await createSupabaseServerClient();
  const detailedResult = await supabase
    .from("public_events")
    .select("id,title,body,starts_at,ends_at,published_at,location,event_type")
    .not("published_at", "is", null)
    .order("starts_at", { ascending: true });

  if (!detailedResult.error) {
    return (detailedResult.data ?? []) as PublicEvent[];
  }

  const canUseBaseSchema =
    detailedResult.error.message.includes("location") ||
    detailedResult.error.message.includes("event_type");

  if (!canUseBaseSchema) {
    console.error(detailedResult.error.message);
    return [];
  }

  const baseResult = await supabase
    .from("public_events")
    .select("id,title,body,starts_at,ends_at,published_at")
    .not("published_at", "is", null)
    .order("starts_at", { ascending: true });

  if (baseResult.error) {
    console.error(baseResult.error.message);
    return [];
  }

  return (baseResult.data ?? []) as PublicEvent[];
}

export default async function EventsPage() {
  const events = await getPublishedEvents();
  const featured = events.slice(0, 2);
  const upcoming = events.slice(2);

  return (
    <>
      <PublicHero
        description="Approved school activities, family meetings, assessment dates, and community events."
        eyebrow="School calendar"
        image="/assets/section-events.webp"
        title="Events"
      />

      <section className="bg-white py-20">
        <div className="mx-auto max-w-7xl px-5 sm:px-6 lg:px-8">
          {events.length ? (
            <div className="grid gap-12">
              <div className="grid gap-6 lg:grid-cols-2">
                {featured.map((event) => (
                  <article
                    className="relative overflow-hidden bg-navy-950 p-7 text-white sm:p-9"
                    key={event.id}
                  >
                    <p className="text-xs font-extrabold uppercase tracking-[0.24em] text-skybrand-300">
                      {event.event_type ?? "School event"}
                    </p>
                    <h2 className="mt-8 font-display text-4xl font-extrabold uppercase leading-[.96] sm:text-5xl">
                      {event.title}
                    </h2>
                    <div className="mt-8 grid gap-4 border-t border-white/15 pt-5 text-sm font-semibold text-slate-200">
                      <p>{formatDateTime(event.starts_at)}</p>
                      <p>
                        {event.location || school.location}
                        {formatTime(event.ends_at)
                          ? ` / Ends ${formatTime(event.ends_at)}`
                          : ""}
                      </p>
                    </div>
                    {event.body ? (
                      <p className="mt-6 text-sm leading-7 text-slate-300">
                        {event.body}
                      </p>
                    ) : null}
                  </article>
                ))}
              </div>

              {upcoming.length ? (
                <div className="grid gap-10 lg:grid-cols-[.72fr_1.28fr]">
                  <div>
                    <p className="text-xs font-extrabold uppercase tracking-[0.28em] text-skybrand-600">
                      Upcoming
                    </p>
                    <h2 className="mt-5 font-display text-5xl font-extrabold uppercase leading-[.92] text-navy-950">
                      School dates to remember.
                    </h2>
                  </div>
                  <div className="divide-y divide-slate-200 border-y border-slate-200">
                    {upcoming.map((event) => (
                        <article
                          className="grid gap-5 py-6 sm:grid-cols-[7rem_1fr]"
                          key={event.id}
                        >
                          <div className="border border-navy-950/15 py-4 text-center">
                            <p className="text-xs font-extrabold uppercase tracking-[0.16em] text-skybrand-600">
                              {formatMonth(event.starts_at)}
                            </p>
                            <p className="mt-1 font-display text-4xl font-extrabold leading-none text-navy-950">
                              {formatDay(event.starts_at)}
                            </p>
                          </div>
                          <div>
                            <p className="text-xs font-extrabold uppercase tracking-[0.18em] text-slate-400">
                              {event.event_type ?? "School event"}
                            </p>
                            <h3 className="mt-2 font-display text-2xl font-extrabold leading-tight text-navy-950">
                              {event.title}
                            </h3>
                            <p className="mt-3 text-sm font-semibold text-slate-600">
                              {formatDateTime(event.starts_at)} /{" "}
                              {event.location || school.location}
                            </p>
                            {event.body ? (
                              <p className="mt-3 text-sm leading-7 text-slate-600">
                                {event.body}
                              </p>
                            ) : null}
                          </div>
                        </article>
                      ))}
                  </div>
                </div>
              ) : null}
            </div>
          ) : (
            <EmptyState
              message="Approved events will appear here after staff submit events and an admin publishes them."
              title="No approved events yet"
            />
          )}
        </div>
      </section>
    </>
  );
}
