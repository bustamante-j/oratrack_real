import { DashboardHome } from "@/components/modules/dashboard-home";
import { teacherModules } from "@/lib/module-catalog";

export const metadata = {
  title: "Teacher",
};

export default function TeacherPage() {
  return (
    <DashboardHome
      description="Teacher workflows are scoped to assigned learners, sections, subjects, attendance, grades, interventions, reports, certificates, lesson plans, and safe AI drafting."
      modules={teacherModules}
      title="Teacher dashboard"
    />
  );
}
