import { CalendarDays, Clock3, MapPin } from "lucide-react";

import { EmptyState } from "@/components/ui/empty-state";
import { PublicHero } from "@/components/public-hero";

export const metadata = {
  title: "Events",
};

export default function EventsPage() {
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
        <div className="relative mx-auto grid max-w-7xl gap-6 px-4 sm:px-6 lg:grid-cols-3 lg:px-8">
          {[
            ["Calendar view", "Monthly school activities"],
            ["Family reminders", "Meetings and deadlines"],
            ["Community events", "Shared Balili milestones"],
          ].map(([title, detail], index) => (
            <article
              className="shine-card rounded-[1.5rem] border border-slate-200 bg-white p-6 shadow-soft"
              key={title}
            >
              <div className="flex items-start justify-between gap-3">
                <div className="grid size-12 place-items-center rounded-2xl bg-skybrand-50 text-skybrand-600">
                  <CalendarDays size={23} />
                </div>
                <span className="font-display text-2xl font-extrabold text-slate-200">
                  0{index + 1}
                </span>
              </div>
              <h2 className="mt-6 font-display text-xl font-extrabold text-navy-950">
                {title}
              </h2>
              <p className="mt-2 text-sm leading-6 text-slate-600">{detail}</p>
              <div className="mt-5 grid gap-2 text-xs font-semibold text-slate-500">
                <span className="flex items-center gap-2">
                  <Clock3 size={14} className="text-skybrand-600" />
                  To be scheduled
                </span>
                <span className="flex items-center gap-2">
                  <MapPin size={14} className="text-skybrand-600" />
                  Balili Elementary School
                </span>
              </div>
            </article>
          ))}
        </div>
        <div className="relative mx-auto mt-8 max-w-7xl px-4 sm:px-6 lg:px-8">
          <EmptyState
            message="Upcoming events will appear here once public content management is enabled."
            title="No upcoming events"
          />
        </div>
      </section>
    </>
  );
}
