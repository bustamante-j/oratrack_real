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
  {
    href: "/admin/school-years",
    label: "School Years",
    group: "Setup",
    icon: "CalendarDots",
  },
  {
    href: "/admin/users",
    label: "Teachers",
    group: "Setup",
    icon: "ChalkboardTeacher",
  },
  { href: "/admin/sections", label: "Sections", group: "Setup", icon: "Rows" },
  {
    href: "/admin/learners",
    label: "Learners",
    group: "Learners",
    icon: "UsersThree",
  },
  {
    href: "/admin/promotion",
    label: "Promotion",
    group: "Learners",
    icon: "ArrowsClockwise",
  },
  {
    href: "/admin/events",
    label: "Events",
    group: "Operations",
    icon: "CalendarCheck",
  },
  {
    href: "/admin/analytics",
    label: "Analytics",
    group: "Operations",
    icon: "ChartLineUp",
  },
  {
    href: "/admin/reports",
    label: "Reports",
    group: "Operations",
    icon: "FileText",
  },
  {
    href: "/admin/certificates",
    label: "Certificates",
    group: "Resources",
    icon: "Certificate",
  },
  {
    href: "/admin/lesson-plans",
    label: "Lesson Plans",
    group: "Resources",
    icon: "BookOpenText",
  },
  {
    href: "/admin/ai",
    label: "AI Assistant",
    group: "Tools",
    icon: "Robot",
  },
];

export const teacherNavItems: NavItem[] = [
  { href: "/teacher", label: "Overview", icon: "SquaresFour" },
  {
    href: "/teacher/learners",
    label: "Learners",
    group: "Class",
    icon: "Student",
  },
  {
    href: "/teacher/attendance",
    label: "Attendance",
    group: "Class",
    icon: "CalendarCheck",
  },
  {
    href: "/teacher/grades",
    label: "Grades",
    group: "Class",
    icon: "BookOpenText",
  },
  {
    href: "/teacher/literacy-numeracy",
    label: "Literacy/Numeracy",
    group: "Class",
    icon: "Exam",
  },
  {
    href: "/teacher/interventions",
    label: "Interventions",
    group: "Class",
    icon: "FlagBanner",
  },
  {
    href: "/teacher/reports",
    label: "Reports",
    group: "Outputs",
    icon: "FileText",
  },
  {
    href: "/teacher/certificates",
    label: "Certificates",
    group: "Outputs",
    icon: "Certificate",
  },
  {
    href: "/teacher/lesson-plans",
    label: "Lesson Plans",
    group: "Outputs",
    icon: "Notebook",
  },
  {
    href: "/teacher/events",
    label: "Events",
    group: "Tools",
    icon: "CalendarDots",
  },
  {
    href: "/teacher/ai",
    label: "AI Assistant",
    group: "Tools",
    icon: "Robot",
  },
];
