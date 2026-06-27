import { AppShell } from "@/components/layout/app-shell";
import { requireRole } from "@/lib/auth/session";
import { teacherNavItems } from "@/lib/navigation";

export const dynamic = "force-dynamic";

export default async function TeacherLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await requireRole("/teacher");

  return (
    <AppShell
      navItems={teacherNavItems}
      session={session}
      title="Teacher portal"
    >
      {children}
    </AppShell>
  );
}
