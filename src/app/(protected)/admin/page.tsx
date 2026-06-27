import { DashboardHome } from "@/components/modules/dashboard-home";
import { adminModules } from "@/lib/module-catalog";

export const metadata = {
  title: "Admin",
};

export default function AdminPage() {
  return (
    <DashboardHome
      description="Admin/Principal workflows manage school setup, accounts, learner records, promotions, school-wide analytics, reports, certificates, lesson plans, and AI review."
      modules={adminModules}
      title="Admin/Principal dashboard"
    />
  );
}
