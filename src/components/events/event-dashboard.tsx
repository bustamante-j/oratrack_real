import {
  CalendarCheck2,
  CalendarClock,
  CalendarPlus,
  CheckCircle2,
  Clock3,
  Megaphone,
  Trash2,
  Undo2,
} from "lucide-react";

import { SubmitButton } from "@/components/ui/submit-button";
import {
  approvePublicEventAction,
  deletePublicEventAction,
  submitPublicEventAction,
  unpublishPublicEventAction,
} from "@/lib/events/actions";

export type DashboardEvent = {
  id: string;
  title: string;
  body: string | null;
  starts_at: string;
  ends_at: string | null;
  published_at: string | null;
  created_by: string | null;
  created_at: string;
};

function formatDateTime(value: string) {
  return new Intl.DateTimeFormat("en-PH", {
    dateStyle: "medium",
    timeStyle: "short",
    timeZone: "Asia/Manila",
  }).format(new Date(value));
}

function formatDay(value: string) {
  return new Intl.DateTimeFormat("en-PH", {
    day: "2-digit",
    timeZone: "Asia/Manila",
  }).format(new Date(value));
}

function formatMonth(value: string) {
  return new Intl.DateTimeFormat("en-PH", {
    month: "short",
    timeZone: "Asia/Manila",
  }).format(new Date(value));
}

function statusTone(event: DashboardEvent) {
  return event.published_at
    ? "bg-emerald-50 text-emerald-700"
    : "bg-amber-50 text-amber-700";
}

export function EventDashboard({
  events,
  isAdmin,
  currentUserId,
}: {
  events: DashboardEvent[];
  isAdmin: boolean;
  currentUserId: string;
}) {
  const publishedEvents = events.filter((event) => event.published_at);
  const pendingEvents = events.filter((event) => !event.published_at);
  const visiblePending = isAdmin
    ? pendingEvents
    : pendingEvents.filter((event) => event.created_by === currentUserId);
  const upcomingPublished = publishedEvents.slice(0, 8);

  return (
    <div className="space-y-8">
      <div>
        <p className="text-xs font-bold uppercase text-skybrand-600">
          Event calendar
        </p>
        <h1 className="mt-3 font-display text-3xl font-extrabold text-navy-950">
          School events
        </h1>
      </div>

      <div className="grid gap-3 sm:grid-cols-3">
        {[
          ["Approved events", publishedEvents.length],
          ["Pending review", pendingEvents.length],
          [
            "Your pending",
            pendingEvents.filter((e) => e.created_by === currentUserId).length,
          ],
        ].map(([label, value]) => (
          <section
            className="rounded-[1.5rem] border border-slate-200 bg-white p-5 shadow-soft"
            key={label}
          >
            <p className="text-3xl font-extrabold text-navy-950">{value}</p>
            <p className="mt-1 text-xs font-bold uppercase text-slate-500">
              {label}
            </p>
          </section>
        ))}
      </div>

      <div className="grid gap-6 xl:grid-cols-[0.9fr_1.1fr]">
        <section className="rounded-[1.5rem] border border-slate-200 bg-white p-6 shadow-soft">
          <div className="flex items-start gap-3">
            <span className="grid size-12 place-items-center rounded-2xl bg-skybrand-50 text-skybrand-600">
              <CalendarPlus size={24} />
            </span>
            <div>
              <h2 className="font-display text-xl font-extrabold text-navy-950">
                {isAdmin ? "Publish event" : "Submit event for approval"}
              </h2>
            </div>
          </div>

          <form action={submitPublicEventAction} className="mt-6 grid gap-4">
            <label>
              <span className="label">Title</span>
              <input className="input" name="title" required />
            </label>
            <div className="grid gap-4 sm:grid-cols-2">
              <label>
                <span className="label">Starts</span>
                <input
                  className="input"
                  name="startsAt"
                  required
                  type="datetime-local"
                />
              </label>
              <label>
                <span className="label">Ends</span>
                <input className="input" name="endsAt" type="datetime-local" />
              </label>
            </div>
            <label>
              <span className="label">Details</span>
              <textarea
                className="input min-h-32"
                name="body"
                placeholder="Location, audience, reminders, and other event details."
              />
            </label>
            <SubmitButton pendingLabel="Saving event...">
              <CalendarPlus size={17} />
              {isAdmin ? "Publish event" : "Submit for approval"}
            </SubmitButton>
          </form>
        </section>

        <section className="rounded-[1.5rem] border border-slate-200 bg-white p-6 shadow-soft">
          <div className="flex items-start gap-3">
            <span className="grid size-12 place-items-center rounded-2xl bg-skybrand-50 text-skybrand-600">
              <CalendarCheck2 size={24} />
            </span>
            <div>
              <h2 className="font-display text-xl font-extrabold text-navy-950">
                Approved calendar
              </h2>
            </div>
          </div>

          {upcomingPublished.length ? (
            <div className="mt-6 grid gap-3">
              {upcomingPublished.map((event, index) => (
                <EventRow
                  event={event}
                  index={index}
                  isAdmin={isAdmin}
                  key={event.id}
                  mode="published"
                />
              ))}
            </div>
          ) : (
            <p className="mt-6 rounded-2xl bg-slate-50 p-4 text-sm text-slate-600">
              No approved upcoming events yet.
            </p>
          )}
        </section>
      </div>

      <section className="rounded-[1.5rem] border border-slate-200 bg-white p-6 shadow-soft">
        <div className="flex items-start gap-3">
          <span className="grid size-12 place-items-center rounded-2xl bg-skybrand-50 text-skybrand-600">
            <Clock3 size={24} />
          </span>
          <div>
            <h2 className="font-display text-xl font-extrabold text-navy-950">
              Pending review
            </h2>
          </div>
        </div>

        {visiblePending.length ? (
          <div className="mt-6 grid gap-3 lg:grid-cols-2">
            {visiblePending.map((event, index) => (
              <EventRow
                event={event}
                index={index}
                isAdmin={isAdmin}
                key={event.id}
                mode="pending"
              />
            ))}
          </div>
        ) : (
          <p className="mt-6 rounded-2xl bg-slate-50 p-4 text-sm text-slate-600">
            No pending events to review.
          </p>
        )}
      </section>
    </div>
  );
}

function EventRow({
  event,
  index,
  isAdmin,
  mode,
}: {
  event: DashboardEvent;
  index: number;
  isAdmin: boolean;
  mode: "published" | "pending";
}) {
  const colors = [
    "bg-skybrand-500",
    "bg-violet-500",
    "bg-emerald-500",
    "bg-amber-500",
  ];

  return (
    <article className="group rounded-[1.35rem] border border-slate-200 bg-slate-50 p-4 transition hover:border-skybrand-300 hover:bg-white hover:shadow-soft">
      <div className="flex gap-4">
        <div
          className={`flex size-16 shrink-0 flex-col items-center justify-center rounded-2xl text-white shadow-md ${
            colors[index % colors.length]
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
          <div className="flex flex-wrap items-center gap-2">
            <span
              className={`rounded-full px-2.5 py-1 text-[10px] font-extrabold uppercase ${statusTone(event)}`}
            >
              {event.published_at ? "Approved" : "Pending"}
            </span>
            <span className="inline-flex items-center gap-1 text-xs font-semibold text-slate-500">
              <CalendarClock size={14} />
              {formatDateTime(event.starts_at)}
            </span>
          </div>
          <h3 className="mt-2 font-display text-lg font-extrabold leading-tight text-navy-950">
            {event.title}
          </h3>
          {event.body ? (
            <p className="mt-2 text-sm leading-6 text-slate-600">
              {event.body}
            </p>
          ) : null}
        </div>
      </div>

      {isAdmin ? (
        <div className="mt-4 flex flex-wrap gap-2 border-t border-slate-200 pt-4">
          {mode === "pending" ? (
            <form action={approvePublicEventAction}>
              <input name="id" type="hidden" value={event.id} />
              <button
                className="inline-flex items-center gap-2 rounded-xl bg-emerald-600 px-3 py-2 text-xs font-bold text-white transition hover:bg-emerald-700"
                type="submit"
              >
                <CheckCircle2 size={14} />
                Approve
              </button>
            </form>
          ) : (
            <form action={unpublishPublicEventAction}>
              <input name="id" type="hidden" value={event.id} />
              <button
                className="inline-flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-3 py-2 text-xs font-bold text-slate-600 transition hover:border-amber-300 hover:bg-amber-50 hover:text-amber-700"
                type="submit"
              >
                <Undo2 size={14} />
                Unpublish
              </button>
            </form>
          )}
          <form action={deletePublicEventAction}>
            <input name="id" type="hidden" value={event.id} />
            <button
              className="inline-flex items-center gap-2 rounded-xl border border-rose-200 bg-white px-3 py-2 text-xs font-bold text-rose-700 transition hover:bg-rose-50"
              type="submit"
            >
              <Trash2 size={14} />
              Delete
            </button>
          </form>
        </div>
      ) : (
        <p className="mt-4 inline-flex items-center gap-2 border-t border-slate-200 pt-4 text-xs font-semibold text-slate-500">
          <Megaphone size={14} />
          Admin approval controls the public posting status.
        </p>
      )}
    </article>
  );
}
