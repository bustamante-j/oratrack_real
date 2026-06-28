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
  { href: "/admin", label: "Overview", icon: "SquaresFour" },
  { href: "/admin/school-years", label: "School Years", icon: "CalendarDots" },
  { href: "/admin/users", label: "Teachers", icon: "ChalkboardTeacher" },
  { href: "/admin/sections", label: "Sections", icon: "Rows" },
  { href: "/admin/learners", label: "Learners", icon: "UsersThree" },
  { href: "/admin/events", label: "Events", icon: "CalendarCheck" },
  { href: "/admin/promotion", label: "Promotion", icon: "ArrowsClockwise" },
  { href: "/admin/analytics", label: "Analytics", icon: "ChartLineUp" },
  { href: "/admin/reports", label: "Reports", icon: "FileText" },
  { href: "/admin/certificates", label: "Certificates", icon: "Certificate" },
  { href: "/admin/lesson-plans", label: "Lesson Plans", icon: "BookOpenText" },
  { href: "/admin/ai", label: "AI Assistant", icon: "Robot" },
  { href: "/admin/profile", label: "My Profile", icon: "GearSix" },
];

export const teacherNavItems: NavItem[] = [
  { href: "/teacher", label: "Overview", icon: "SquaresFour" },
  { href: "/teacher/learners", label: "Learners", icon: "Student" },
  { href: "/teacher/events", label: "Events", icon: "CalendarDots" },
  { href: "/teacher/attendance", label: "Attendance", icon: "CalendarCheck" },
  { href: "/teacher/grades", label: "Grades", icon: "BookOpenText" },
  {
    href: "/teacher/literacy-numeracy",
    label: "Literacy/Numeracy",
    icon: "Exam",
  },
  {
    href: "/teacher/interventions",
    label: "Interventions",
    icon: "FlagBanner",
  },
  { href: "/teacher/reports", label: "Reports", icon: "FileText" },
  { href: "/teacher/certificates", label: "Certificates", icon: "Certificate" },
  { href: "/teacher/lesson-plans", label: "Lesson Plans", icon: "Notebook" },
  { href: "/teacher/ai", label: "AI Assistant", icon: "Robot" },
  { href: "/teacher/profile", label: "My Profile", icon: "GearSix" },
];
