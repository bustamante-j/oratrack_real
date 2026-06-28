import { getSessionProfile } from "@/lib/auth/session";
import { createLearnerImportTemplate } from "@/lib/excel/learner-template";

export const runtime = "nodejs";

export async function GET() {
  const session = await getSessionProfile();

  if (session.kind === "unconfigured") {
    return Response.json(
      { error: "Supabase must be configured before templates are downloaded." },
      { status: 503 },
    );
  }

  if (session.kind === "anonymous") {
    return Response.json(
      { error: "Authentication required." },
      { status: 401 },
    );
  }

  const workbook = await createLearnerImportTemplate();

  return new Response(workbook, {
    headers: {
      "Content-Disposition":
        'attachment; filename="oratrack-learner-import-template.xlsx"',
      "Content-Type":
        "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
    },
  });
}
