import type { AppRole } from "@/types/domain";

import {
  intentGuidance,
  ORATRACK_AI_DEFAULT_MODEL,
  ORATRACK_AI_PROVIDER,
  ORATRACK_AI_TRAINING_VERSION,
  oratrackCoreKnowledge,
  oratrackSafetyRules,
  oratrackWorkflowKnowledge,
  roleKnowledge,
} from "@/lib/ai/knowledge";

export function getAiPermissionNotice(role: AppRole) {
  if (role === "admin_principal") {
    return "AI may summarize school-wide information available to the Admin/Principal, but proposed writes still require confirmation.";
  }

  return "AI may only use assigned learner, class, or subject information visible to this teacher account.";
}

export function buildOratrackSystemBrief(role: AppRole) {
  return [
    `Training version: ${ORATRACK_AI_TRAINING_VERSION}`,
    `Provider target: ${ORATRACK_AI_PROVIDER}`,
    `Default model target: ${ORATRACK_AI_DEFAULT_MODEL}`,
    "",
    "Core ORATRACK knowledge:",
    ...oratrackCoreKnowledge.map((item) => `- ${item}`),
    "",
    "Role knowledge:",
    ...roleKnowledge(role).map((item) => `- ${item}`),
    "",
    "Workflow knowledge:",
    ...oratrackWorkflowKnowledge.map((item) => `- ${item}`),
    "",
    "Safety rules:",
    ...oratrackSafetyRules.map((item) => `- ${item}`),
  ].join("\n");
}

export function buildSafeDraft(
  intent: string,
  prompt: string,
  options: {
    role?: AppRole;
    context?: string;
    model?: string;
    mode?: string;
  } = {},
) {
  const role = options.role ?? "subject_teacher";
  const guidance = intentGuidance(intent);

  return [
    `Draft type: ${intent.replaceAll("_", " ")}`,
    `Training version: ${ORATRACK_AI_TRAINING_VERSION}`,
    `Runtime mode: ${options.mode ?? "local-safe-draft"}`,
    `Model target: ${options.model ?? ORATRACK_AI_DEFAULT_MODEL}`,
    "",
    "ORATRACK rules I am applying:",
    ...roleKnowledge(role).map((item) => `- ${item}`),
    ...guidance.map((item) => `- ${item}`),
    "",
    "Important safety boundaries:",
    "- Use only visible, permission-scoped school records.",
    "- Do not change records automatically.",
    "- Do not invent missing learner data, grades, attendance, diagnoses, or official policy.",
    "- Keep the tone professional, respectful, and suitable for school use.",
    "",
    "Permission-scoped context snapshot:",
    options.context?.trim() || "No additional scoped record summary provided.",
    "",
    "User request:",
    prompt,
    "",
    "Draft response:",
    "Based on the request and visible ORATRACK context, prepare a concise school-ready draft that starts with verified facts, then gives practical next steps. Review the wording, verify the learner context, and save or send only after staff confirmation.",
  ].join("\n");
}
