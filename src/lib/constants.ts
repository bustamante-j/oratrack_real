import type { AppRole } from "@/types/domain";

export const school = {
  name: "Balili Elementary School",
  platform: "ORATRACK",
  location: "Purok 3, Balili, La Trinidad, Benguet 2601",
  email: "hello@balilies.edu.ph",
  phone: "(074) 422-0186",
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
