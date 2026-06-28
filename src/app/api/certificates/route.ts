import { getSessionProfile } from "@/lib/auth/session";
import { createCertificatePdf } from "@/lib/reports/pdf";
import { createSupabaseServerClient } from "@/lib/supabase/server";

export const runtime = "nodejs";

function learnerName(learner: {
  first_name: string;
  middle_name: string | null;
  last_name: string;
  extension_name: string | null;
}) {
  return [
    learner.first_name,
    learner.middle_name,
    learner.last_name,
    learner.extension_name,
  ]
    .filter(Boolean)
    .join(" ");
}

function safeFilename(value: string) {
  return value
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "")
    .slice(0, 80);
}

export async function GET(request: Request) {
  const session = await getSessionProfile();

  if (session.kind === "unconfigured") {
    return Response.json(
      {
        error: "Supabase must be configured before certificates can download.",
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

  const certificateId = new URL(request.url).searchParams.get("id");

  if (!certificateId) {
    return Response.json(
      { error: "Certificate id is required." },
      { status: 400 },
    );
  }

  const supabase = await createSupabaseServerClient();
  const { data: certificate, error: certificateError } = await supabase
    .from("generated_certificates")
    .select(
      "id,certificate_template_id,enrollment_id,certificate_type,generated_at",
    )
    .eq("id", certificateId)
    .single();

  if (certificateError) {
    return Response.json({ error: certificateError.message }, { status: 404 });
  }

  const { data: enrollment, error: enrollmentError } = await supabase
    .from("learner_enrollments")
    .select("id,learner_id,school_year_id,grade_level_id,section_id")
    .eq("id", certificate.enrollment_id)
    .single();

  if (enrollmentError) {
    return Response.json({ error: enrollmentError.message }, { status: 404 });
  }

  const [
    learnerResult,
    schoolYearResult,
    gradeLevelResult,
    sectionResult,
    templateResult,
  ] = await Promise.all([
    supabase
      .from("learners")
      .select("id,lrn,first_name,middle_name,last_name,extension_name")
      .eq("id", enrollment.learner_id)
      .single(),
    supabase
      .from("school_years")
      .select("id,name")
      .eq("id", enrollment.school_year_id)
      .single(),
    supabase
      .from("grade_levels")
      .select("id,label")
      .eq("id", enrollment.grade_level_id)
      .single(),
    enrollment.section_id
      ? supabase
          .from("sections")
          .select("id,name")
          .eq("id", enrollment.section_id)
          .single()
      : Promise.resolve({ data: null, error: null }),
    certificate.certificate_template_id
      ? supabase
          .from("certificate_templates")
          .select("id,name")
          .eq("id", certificate.certificate_template_id)
          .single()
      : Promise.resolve({ data: null, error: null }),
  ]);

  const firstError =
    learnerResult.error ??
    schoolYearResult.error ??
    gradeLevelResult.error ??
    sectionResult.error ??
    templateResult.error;

  if (firstError) {
    return Response.json({ error: firstError.message }, { status: 404 });
  }

  const learner = learnerResult.data;
  const schoolYear = schoolYearResult.data;
  const gradeLevel = gradeLevelResult.data;

  if (!learner || !schoolYear || !gradeLevel) {
    return Response.json(
      { error: "Certificate source records are incomplete." },
      { status: 404 },
    );
  }

  const name = learnerName(learner);
  const pdf = await createCertificatePdf({
    certificateType: certificate.certificate_type,
    learnerName: name,
    lrn: learner.lrn,
    schoolYearName: schoolYear.name,
    gradeLevelLabel: gradeLevel.label,
    sectionName: sectionResult.data?.name ?? "Unsectioned",
    templateName: templateResult.data?.name,
    generatedAt: certificate.generated_at,
  });

  return new Response(new Uint8Array(pdf), {
    headers: {
      "Content-Disposition": `attachment; filename="certificate-${safeFilename(name)}.pdf"`,
      "Content-Type": "application/pdf",
    },
  });
}
