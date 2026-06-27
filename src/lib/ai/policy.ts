import type { AppRole } from "@/types/domain";

export function getAiPermissionNotice(role: AppRole) {
  if (role === "admin_principal") {
    return "AI may summarize school-wide information available to the Admin/Principal, but proposed writes still require confirmation.";
  }

  return "AI may only use assigned learner, class, or subject information visible to this teacher account.";
}

export function buildSafeDraft(intent: string, prompt: string) {
  return [
    `Draft type: ${intent.replaceAll("_", " ")}`,
    "",
    "This is a safe starter draft generated without direct record writes.",
    "",
    prompt,
    "",
    "Review the wording, verify the learner context, and save only after confirmation.",
  ].join("\n");
}
