import { DashboardHome } from "@/components/modules/dashboard-home";
import { getDashboardSummary } from "@/lib/dashboard/summary";
import { teacherModules } from "@/lib/module-catalog";

export const metadata = {
  title: "Teacher",
};

export default async function TeacherPage() {
  const summary = await getDashboardSummary("teacher", teacherModules);

  return (
    <DashboardHome
      description="Teacher workflows are scoped to assigned learners, sections, subjects, attendance, grades, interventions, reports, certificates, lesson plans, and safe AI drafting."
      modules={teacherModules}
      summary={summary}
      title="Teacher dashboard"
    />
  );
}
