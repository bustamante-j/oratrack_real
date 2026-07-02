import { AppShell } from "@/components/layout/app-shell";
import { requireRole } from "@/lib/auth/session";
import { adminNavItems } from "@/lib/navigation";
import { getPortalNotifications } from "@/lib/notifications";

export const dynamic = "force-dynamic";

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await requireRole("/admin");
  const notifications = await getPortalNotifications(session);

  return (
    <AppShell
      navItems={adminNavItems}
      notifications={notifications}
      session={session}
      title="Admin console"
    >
      {children}
    </AppShell>
  );
}
