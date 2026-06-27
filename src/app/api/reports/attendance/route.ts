import { NextResponse } from "next/server";

import { getSessionProfile } from "@/lib/auth/session";
import { createSimplePdfReport } from "@/lib/reports/pdf";

export const runtime = "nodejs";

export async function GET() {
  const session = await getSessionProfile();

  if (session.kind === "unconfigured") {
    return NextResponse.json(
      { error: "Supabase must be configured before reports can read data." },
      { status: 503 },
    );
  }

  if (session.kind === "anonymous") {
    return NextResponse.json(
      { error: "Authentication required." },
      { status: 401 },
    );
  }

  const pdf = await createSimplePdfReport({
    title: "Attendance Report",
    subtitle: "Temporary clean report template",
    lines: [
      "No attendance records were queried in this starter endpoint.",
      "Next phase: filter by school year, section, learner, and permitted role scope.",
      "Attendance calculations will include AM/PM status, tardy conversion, attendance percentage, and 20% absenteeism flags.",
    ],
  });

  return new Response(new Uint8Array(pdf), {
    headers: {
      "Content-Disposition": 'attachment; filename="attendance-report.pdf"',
      "Content-Type": "application/pdf",
    },
  });
}
