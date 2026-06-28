import { CalendarDays, Clock3, MapPin } from "lucide-react";

import { EmptyState } from "@/components/ui/empty-state";
import { PublicHero } from "@/components/public-hero";
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
    dateStyle: "medium",
    timeStyle: "short",
    timeZone: "Asia/Manila",
  }).format(new Date(value));
}

export default async function EventsPage() {
  const supabase = await createSupabaseServerClient();
  const { data, error } = await supabase
    .from("public_events")
    .select("id,title,body,starts_at,ends_at,published_at")
    .not("published_at", "is", null)
    .order("starts_at", { ascending: true });

  if (error) {
    throw new Error(error.message);
  }

  const events = (data ?? []) as PublicEvent[];

  return (
    <>
      <PublicHero
        description="A public calendar space for school activities, family meetings, assessment dates, and community events."
        eyebrow="School calendar"
        image="/assets/section-events.webp"
        title="Events"
      />

      <section className="relative overflow-hidden bg-slate-50 py-20">
        <div className="absolute inset-0 soft-grid opacity-50" />
        <div className="relative mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          {events.length ? (
            <div className="grid gap-5 lg:grid-cols-2">
              {events.map((event, index) => (
                <article
                  className="shine-card group relative overflow-hidden rounded-[1.65rem] border border-slate-200 bg-white p-5 shadow-soft transition hover:-translate-y-1 hover:border-skybrand-300 hover:shadow-glow"
                  key={event.id}
                >
                  <div className="flex gap-4">
                    <div
                      className={`flex size-16 shrink-0 flex-col items-center justify-center rounded-2xl text-center text-white shadow-md ${
                        [
                          "bg-skybrand-500",
                          "bg-violet-500",
                          "bg-emerald-500",
                          "bg-amber-500",
                        ][index % 4]
                      }`}
                    >
                      <span className="text-[10px] font-bold uppercase">
                        {formatMonth(event.starts_at)}
                      </span>
                      <span className="font-display text-2xl font-extrabold">
                        {formatDay(event.starts_at)}
                      </span>
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="inline-flex items-center gap-2 text-xs font-bold uppercase text-skybrand-600">
                        <CalendarDays size={14} />
                        Approved school event
                      </p>
                      <h2 className="mt-2 font-display text-xl font-extrabold text-navy-950">
                        {event.title}
                      </h2>
                      <div className="mt-3 grid gap-2 text-sm text-slate-600">
                        <p className="flex items-center gap-2">
                          <Clock3 size={16} className="text-skybrand-600" />
                          {formatDateTime(event.starts_at)}
                        </p>
                        <p className="flex items-center gap-2">
                          <MapPin size={16} className="text-skybrand-600" />
                          Balili Elementary School
                        </p>
                      </div>
                      {event.body ? (
                        <p className="mt-4 text-sm leading-7 text-slate-600">
                          {event.body}
                        </p>
                      ) : null}
                    </div>
                  </div>
                </article>
              ))}
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
