import { AppShell } from "@/components/layout/app-shell";
import { requireRole } from "@/lib/auth/session";
import { teacherNavItems } from "@/lib/navigation";
import { getPortalNotifications } from "@/lib/notifications";

export const dynamic = "force-dynamic";

export default async function TeacherLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await requireRole("/teacher");
  const notifications = await getPortalNotifications(session);

  return (
    <AppShell
      navItems={teacherNavItems}
      notifications={notifications}
      session={session}
      title="Teacher portal"
    >
      {children}
    </AppShell>
  );
}
