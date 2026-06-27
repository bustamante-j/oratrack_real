import { roleLabels } from "@/lib/constants";
import type { AppRole } from "@/types/domain";

export const protectedPrefixes = ["/admin", "/teacher"];

export function getRoleLandingPath(role: AppRole) {
  if (role === "admin_principal") return "/admin";
  return "/teacher";
}

export function getRoleLabel(role: AppRole) {
  return roleLabels[role];
}

export function canOpenRoleArea(role: AppRole, pathname: string) {
  if (pathname.startsWith("/admin")) return role === "admin_principal";
  if (pathname.startsWith("/teacher")) {
    return role === "adviser" || role === "subject_teacher";
  }
  return true;
}
