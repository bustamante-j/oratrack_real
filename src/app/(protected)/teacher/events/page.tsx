import {
  EventDashboard,
  type DashboardEvent,
} from "@/components/events/event-dashboard";
import { requireAuthenticatedProfile } from "@/lib/auth/session";
import { createSupabaseServerClient } from "@/lib/supabase/server";

export const metadata = {
  title: "Events",
};

export default async function TeacherEventsPage() {
  const profile = await requireAuthenticatedProfile();
  const supabase = await createSupabaseServerClient();
  const { data, error } = await supabase
    .from("public_events")
    .select(
      "id,title,body,starts_at,ends_at,published_at,created_by,created_at",
    )
    .order("starts_at", { ascending: true });

  if (error) {
    throw new Error(error.message);
  }

  return (
    <EventDashboard
      currentUserId={profile.userId}
      events={(data ?? []) as DashboardEvent[]}
      isAdmin={false}
    />
  );
}
