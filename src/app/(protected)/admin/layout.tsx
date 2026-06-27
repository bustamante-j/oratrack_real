import { AppShell } from "@/components/layout/app-shell";
import { requireRole } from "@/lib/auth/session";
import { adminNavItems } from "@/lib/navigation";

export const dynamic = "force-dynamic";

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await requireRole("/admin");

  return (
    <AppShell navItems={adminNavItems} session={session} title="Admin console">
      {children}
    </AppShell>
  );
}
