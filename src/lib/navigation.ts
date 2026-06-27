import type { NavItem } from "@/types/domain";

export const publicNavItems: NavItem[] = [
  { href: "/", label: "Home" },
  { href: "/about", label: "About" },
  { href: "/announcements", label: "Announcements" },
  { href: "/events", label: "Events" },
  { href: "/programs", label: "Programs" },
  { href: "/contact", label: "Contact" },
];

export const adminNavItems: NavItem[] = [
  { href: "/admin", label: "Overview" },
  { href: "/admin/school-years", label: "School Years" },
  { href: "/admin/users", label: "Teachers" },
  { href: "/admin/sections", label: "Sections" },
  { href: "/admin/learners", label: "Learners" },
  { href: "/admin/promotion", label: "Promotion" },
  { href: "/admin/analytics", label: "Analytics" },
  { href: "/admin/reports", label: "Reports" },
  { href: "/admin/certificates", label: "Certificates" },
  { href: "/admin/lesson-plans", label: "Lesson Plans" },
  { href: "/admin/ai", label: "AI Assistant" },
];

export const teacherNavItems: NavItem[] = [
  { href: "/teacher", label: "Overview" },
  { href: "/teacher/learners", label: "Learners" },
  { href: "/teacher/attendance", label: "Attendance" },
  { href: "/teacher/grades", label: "Grades" },
  { href: "/teacher/literacy-numeracy", label: "Literacy/Numeracy" },
  { href: "/teacher/interventions", label: "Interventions" },
  { href: "/teacher/reports", label: "Reports" },
  { href: "/teacher/certificates", label: "Certificates" },
  { href: "/teacher/lesson-plans", label: "Lesson Plans" },
  { href: "/teacher/ai", label: "AI Assistant" },
];
