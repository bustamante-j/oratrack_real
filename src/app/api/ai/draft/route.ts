import { NextResponse } from "next/server";

import { ORATRACK_AI_TRAINING_VERSION } from "@/lib/ai/knowledge";
import { getAiPermissionNotice, buildSafeDraft } from "@/lib/ai/policy";
import { getSessionProfile } from "@/lib/auth/session";
import { getAiModelName, hasAiProviderKey } from "@/lib/env";
import { aiDraftRequestSchema } from "@/lib/validation/domain";

export async function POST(request: Request) {
  const session = await getSessionProfile();

  if (session.kind === "unconfigured") {
    return NextResponse.json(
      {
        error:
          "Supabase must be configured before AI can access permission-scoped data.",
      },
      { status: 503 },
    );
  }

  if (session.kind === "anonymous") {
    return NextResponse.json(
      { error: "Authentication required." },
      { status: 401 },
    );
  }

  const payload = aiDraftRequestSchema.safeParse(await request.json());

  if (!payload.success) {
    return NextResponse.json(
      { error: "Invalid AI draft request.", details: payload.error.flatten() },
      { status: 400 },
    );
  }

  const model = getAiModelName();
  const mode = hasAiProviderKey()
    ? "provider-key-present-safe-draft"
    : "local-safe-draft";

  return NextResponse.json({
    mode,
    provider: "OpenAI",
    model,
    trainingVersion: ORATRACK_AI_TRAINING_VERSION,
    notice: getAiPermissionNotice(session.profile.role),
    writePolicy:
      "No records were changed. User confirmation is required for writes.",
    draft: buildSafeDraft(payload.data.intent, payload.data.prompt, {
      role: session.profile.role,
      model,
      mode,
    }),
  });
}
