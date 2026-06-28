import { DashboardHome } from "@/components/modules/dashboard-home";
import { getDashboardSummary } from "@/lib/dashboard/summary";
import { adminModules } from "@/lib/module-catalog";

export const metadata = {
  title: "Admin",
};

export default async function AdminPage() {
  const summary = await getDashboardSummary("admin", adminModules);

  return (
    <DashboardHome
      description="Admin/Principal workflows manage school setup, accounts, learner records, promotions, school-wide analytics, reports, certificates, lesson plans, and AI review."
      modules={adminModules}
      summary={summary}
      title="Admin/Principal dashboard"
    />
  );
}
