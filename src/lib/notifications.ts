import "server-only";

import { isSupabaseConfigured } from "@/lib/env";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import type { SessionState } from "@/lib/auth/session";
import type { PortalNotification } from "@/types/domain";

function formatDate(value: string | null | undefined) {
  if (!value) return "No date set";

  return new Intl.DateTimeFormat("en-PH", {
    month: "short",
    day: "numeric",
    timeZone: "Asia/Manila",
  }).format(new Date(value));
}

function countText(count: number, singular: string, plural = `${singular}s`) {
  return `${count} ${count === 1 ? singular : plural}`;
}

export async function getPortalNotifications(
  session: SessionState,
): Promise<PortalNotification[]> {
  if (session.kind !== "authenticated" || !isSupabaseConfigured()) return [];

  const supabase = await createSupabaseServerClient();
  const profile = session.profile;
  const isAdmin = profile.role === "admin_principal";

  let eventQuery = supabase
    .from("public_events")
    .select("id,title,starts_at,created_by", { count: "exact" })
    .is("published_at", null)
    .order("starts_at", { ascending: true })
    .limit(3);

  if (!isAdmin) {
    eventQuery = eventQuery.eq("created_by", profile.userId);
  }

  let lessonQuery = supabase
    .from("lesson_plans")
    .select("id,title,status,teacher_id,created_at", { count: "exact" })
    .in("status", ["uploaded", "replaced"])
    .order("created_at", { ascending: false })
    .limit(3);

  if (!isAdmin) {
    lessonQuery = lessonQuery.eq("teacher_id", profile.userId);
  }

  const interventionQuery = supabase
    .from("interventions")
    .select("id,category,status,follow_up_on,teacher_id", { count: "exact" })
    .in("status", ["planned", "ongoing"])
    .order("follow_up_on", { ascending: true })
    .limit(3);

  const gradeImportQuery = supabase
    .from("grade_import_batches")
    .select("id,error_count,status,created_at", { count: "exact" })
    .gt("error_count", 0)
    .order("created_at", { ascending: false })
    .limit(2);

  const [eventResult, lessonResult, interventionResult, gradeImportResult] =
    await Promise.all([
      eventQuery,
      lessonQuery,
      interventionQuery,
      gradeImportQuery,
    ]);

  const notifications: PortalNotification[] = [];

  if (!eventResult.error && (eventResult.count ?? 0) > 0) {
    const first = eventResult.data?.[0];
    notifications.push({
      id: "events-pending",
      title: isAdmin ? "Event approvals pending" : "Your event is pending",
      detail: first
        ? `${countText(eventResult.count ?? 0, "event")} / next: ${first.title} on ${formatDate(first.starts_at)}`
        : countText(eventResult.count ?? 0, "event"),
      href: isAdmin ? "/admin/events" : "/teacher/events",
      tone: "amber",
    });
  }

  if (!lessonResult.error && (lessonResult.count ?? 0) > 0) {
    notifications.push({
      id: "lesson-plans-review",
      title: isAdmin ? "Lesson plans need review" : "Lesson plans awaiting review",
      detail: countText(lessonResult.count ?? 0, "lesson plan"),
      href: isAdmin ? "/admin/lesson-plans" : "/teacher/lesson-plans",
      tone: "sky",
    });
  }

  if (!interventionResult.error && (interventionResult.count ?? 0) > 0) {
    const first = interventionResult.data?.[0];
    notifications.push({
      id: "open-interventions",
      title: "Open interventions",
      detail: first
        ? `${countText(interventionResult.count ?? 0, "record")} / follow-up ${formatDate(first.follow_up_on)}`
        : countText(interventionResult.count ?? 0, "record"),
      href: isAdmin ? "/admin/analytics" : "/teacher/interventions",
      tone: "rose",
    });
  }

  if (!gradeImportResult.error && (gradeImportResult.count ?? 0) > 0) {
    const errorTotal =
      gradeImportResult.data?.reduce(
        (sum, batch) => sum + (batch.error_count ?? 0),
        0,
      ) ?? 0;

    notifications.push({
      id: "grade-import-errors",
      title: "Grade import needs checking",
      detail: `${errorTotal} import ${errorTotal === 1 ? "error" : "errors"} found`,
      href: isAdmin ? "/admin/analytics" : "/teacher/grades",
      tone: "amber",
    });
  }

  return notifications.slice(0, 6);
}
