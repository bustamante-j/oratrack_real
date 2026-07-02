import type { AppRole } from "@/types/domain";

export const school = {
  name: "Balili Elementary School",
  platform: "ORATRACK",
  schoolId: "135617",
  principal: "Herman Saweg",
  location: "Balili, La Trinidad, Benguet",
  email: "135617@deped.gov.ph",
  phone: "(074) 422-6570",
  hours: "Mon to Fri, 7:30 AM to 5:00 PM",
};

export const externalSchoolLinks = [
  { label: "DepEd National", href: "https://www.deped.gov.ph/" },
  { label: "DepEd CAR", href: "https://car.deped.gov.ph/" },
  { label: "DepEd Benguet", href: "https://depedbenguet.com/" },
  { label: "FB Balili ES", href: "https://www.facebook.com/balilielem135617/" },
];

export const roleLabels: Record<AppRole, string> = {
  admin_principal: "Admin/Principal",
  adviser: "Adviser",
  subject_teacher: "Subject Teacher",
};

export const attendancePolicy = {
  tardiesPerAbsence: 5,
  absenteeismRiskThreshold: 0.2,
};
