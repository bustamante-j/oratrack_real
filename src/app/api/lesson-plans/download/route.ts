import { NextResponse } from "next/server";

import { logAuditEvent } from "@/lib/audit";
import { getSessionProfile } from "@/lib/auth/session";
import { createSupabaseServerClient } from "@/lib/supabase/server";

export const runtime = "nodejs";

export async function GET(request: Request) {
  const session = await getSessionProfile();

  if (session.kind === "unconfigured") {
    return Response.json(
      {
        error: "Supabase must be configured before lesson plans can download.",
      },
      { status: 503 },
    );
  }

  if (session.kind === "anonymous") {
    return Response.json(
      { error: "Authentication required." },
      { status: 401 },
    );
  }

  const lessonPlanId = new URL(request.url).searchParams.get("id");

  if (!lessonPlanId) {
    return Response.json(
      { error: "Lesson plan id is required." },
      { status: 400 },
    );
  }

  const supabase = await createSupabaseServerClient();
  const { data: lessonPlan, error: lessonPlanError } = await supabase
    .from("lesson_plans")
    .select("id,title,file_id")
    .eq("id", lessonPlanId)
    .single();

  if (lessonPlanError) {
    return Response.json({ error: lessonPlanError.message }, { status: 404 });
  }

  if (!lessonPlan.file_id) {
    return Response.json(
      { error: "Lesson plan does not have an uploaded file." },
      { status: 404 },
    );
  }

  const { data: file, error: fileError } = await supabase
    .from("uploaded_files")
    .select("id,bucket_id,object_path,original_filename")
    .eq("id", lessonPlan.file_id)
    .single();

  if (fileError) {
    return Response.json({ error: fileError.message }, { status: 404 });
  }

  const { data: signedUrlData, error: signedUrlError } = await supabase.storage
    .from(file.bucket_id)
    .createSignedUrl(file.object_path, 60, {
      download: file.original_filename,
    });

  if (signedUrlError) {
    return Response.json({ error: signedUrlError.message }, { status: 500 });
  }

  await logAuditEvent(supabase, {
    actorId: session.profile.userId,
    action: "lesson_plan_downloaded",
    entityTable: "lesson_plans",
    entityId: lessonPlan.id,
    metadata: {
      fileId: file.id,
      title: lessonPlan.title,
    },
  });

  return NextResponse.redirect(signedUrlData.signedUrl);
}
