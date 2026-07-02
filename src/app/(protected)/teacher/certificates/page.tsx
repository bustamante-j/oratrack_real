import { Award, Download, FileText, Printer } from "lucide-react";

import { ActionDisclosure } from "@/components/ui/action-disclosure";
import { EmptyState } from "@/components/ui/empty-state";
import { MetricStrip } from "@/components/ui/metric-strip";
import { SubmitButton } from "@/components/ui/submit-button";
import { generateCertificateAction } from "@/lib/certificates/actions";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { certificateTypes, type CertificateType } from "@/types/domain";

export const metadata = {
  title: "Certificates",
};

type Learner = {
  id: string;
  lrn: string;
  first_name: string;
  middle_name: string | null;
  last_name: string;
  extension_name: string | null;
  status: "active" | "inactive" | "archived" | "transferred";
};

type LearnerEnrollment = {
  id: string;
  learner_id: string;
  school_year_id: string;
  grade_level_id: number;
  section_id: string | null;
  enrollment_status: string;
};

type CertificateTemplate = {
  id: string;
  name: string;
  certificate_type: CertificateType;
  is_active: boolean;
};

type GeneratedCertificate = {
  id: string;
  certificate_template_id: string | null;
  enrollment_id: string;
  certificate_type: CertificateType;
  generated_at: string;
};

type SchoolYear = {
  id: string;
  name: string;
};

type GradeLevel = {
  id: number;
  label: string;
};

type Section = {
  id: string;
  name: string;
};

function learnerName(learner: Learner) {
  return [
    learner.first_name,
    learner.middle_name,
    learner.last_name,
    learner.extension_name,
  ]
    .filter(Boolean)
    .join(" ");
}

function typeLabel(type: CertificateType) {
  return type === "completion" ? "Completion" : "Recognition";
}

function formatDateTime(value: string) {
  return new Intl.DateTimeFormat("en", {
    month: "short",
    day: "numeric",
    year: "numeric",
    hour: "numeric",
    minute: "2-digit",
  }).format(new Date(value));
}

function enrollmentLabel(
  enrollment: LearnerEnrollment,
  learnerById: Map<string, Learner>,
  yearById: Map<string, SchoolYear>,
  gradeById: Map<number, GradeLevel>,
  sectionById: Map<string, Section>,
) {
  const learner = learnerById.get(enrollment.learner_id);
  const section = enrollment.section_id
    ? sectionById.get(enrollment.section_id)
    : null;

  return [
    learner ? `${learnerName(learner)} (${learner.lrn})` : "Learner",
    yearById.get(enrollment.school_year_id)?.name,
    gradeById.get(enrollment.grade_level_id)?.label,
    section?.name,
  ]
    .filter(Boolean)
    .join(" - ");
}

export default async function TeacherCertificatesPage() {
  const supabase = await createSupabaseServerClient();
  const [
    templateResult,
    certificateResult,
    learnerResult,
    enrollmentResult,
    yearResult,
    gradeResult,
    sectionResult,
  ] = await Promise.all([
    supabase
      .from("certificate_templates")
      .select("id,name,certificate_type,is_active")
      .eq("is_active", true)
      .order("name", { ascending: true }),
    supabase
      .from("generated_certificates")
      .select(
        "id,certificate_template_id,enrollment_id,certificate_type,generated_at",
      )
      .order("generated_at", { ascending: false }),
    supabase
      .from("learners")
      .select("id,lrn,first_name,middle_name,last_name,extension_name,status")
      .order("last_name", { ascending: true }),
    supabase
      .from("learner_enrollments")
      .select(
        "id,learner_id,school_year_id,grade_level_id,section_id,enrollment_status",
      )
      .order("created_at", { ascending: false }),
    supabase
      .from("school_years")
      .select("id,name")
      .order("starts_on", { ascending: false }),
    supabase.from("grade_levels").select("id,label").order("id"),
    supabase.from("sections").select("id,name").order("name"),
  ]);

  const firstError =
    templateResult.error ??
    certificateResult.error ??
    learnerResult.error ??
    enrollmentResult.error ??
    yearResult.error ??
    gradeResult.error ??
    sectionResult.error;

  if (firstError) {
    throw new Error(firstError.message);
  }

  const templates = (templateResult.data ?? []) as CertificateTemplate[];
  const certificates = (certificateResult.data ?? []) as GeneratedCertificate[];
  const learners = (learnerResult.data ?? []) as Learner[];
  const enrollments = (enrollmentResult.data ?? []) as LearnerEnrollment[];
  const years = (yearResult.data ?? []) as SchoolYear[];
  const grades = (gradeResult.data ?? []) as GradeLevel[];
  const sections = (sectionResult.data ?? []) as Section[];
  const learnerById = new Map(learners.map((learner) => [learner.id, learner]));
  const enrollmentById = new Map(
    enrollments.map((enrollment) => [enrollment.id, enrollment]),
  );
  const yearById = new Map(years.map((year) => [year.id, year]));
  const gradeById = new Map(grades.map((grade) => [grade.id, grade]));
  const sectionById = new Map(sections.map((section) => [section.id, section]));
  const templateById = new Map(
    templates.map((template) => [template.id, template]),
  );
  const availableEnrollments = enrollments.filter((enrollment) => {
    const learner = learnerById.get(enrollment.learner_id);
    return (
      enrollment.enrollment_status === "enrolled" &&
      learner?.status === "active"
    );
  });

  return (
    <div className="space-y-4">
      <div>
        <h1 className="font-display text-2xl font-extrabold text-navy-950">
          Certificates
        </h1>
        <details className="mt-3 max-w-3xl text-sm leading-7 text-slate-600">
          <summary className="cursor-pointer text-sm font-bold text-navy-950">
            More
          </summary>
          Generate recognition and completion certificates for learners visible
          to your adviser or subject-teacher account.
        </details>
      </div>

      <MetricStrip
        columns="three"
        items={[
          { label: "Visible learners", value: availableEnrollments.length },
          { label: "Available templates", value: templates.length },
          { label: "Generated", value: certificates.length },
        ]}
      />

      <ActionDisclosure
        icon={<Award size={17} />}
        meta={`${availableEnrollments.length} learners`}
        title="Generate certificate"
      >
        {availableEnrollments.length ? (
          <form action={generateCertificateAction} className="grid gap-4">
            <label>
              <span className="label">Learner enrollment</span>
              <select className="input" name="enrollmentId" required>
                {availableEnrollments.map((enrollment) => (
                  <option key={enrollment.id} value={enrollment.id}>
                    {enrollmentLabel(
                      enrollment,
                      learnerById,
                      yearById,
                      gradeById,
                      sectionById,
                    )}
                  </option>
                ))}
              </select>
            </label>
            <div className="grid gap-4 sm:grid-cols-2">
              <label>
                <span className="label">Type</span>
                <select className="input" name="certificateType" required>
                  {certificateTypes.map((type) => (
                    <option key={type} value={type}>
                      {typeLabel(type)}
                    </option>
                  ))}
                </select>
              </label>
              <label>
                <span className="label">Template</span>
                <select className="input" name="templateId">
                  <option value="">Temporary clean template</option>
                  {templates.map((template) => (
                    <option key={template.id} value={template.id}>
                      {template.name} ({typeLabel(template.certificate_type)})
                    </option>
                  ))}
                </select>
              </label>
            </div>
            <SubmitButton pendingLabel="Generating certificate...">
              <Printer size={17} />
              Generate certificate
            </SubmitButton>
          </form>
        ) : (
          <EmptyState
            message="Learners become available here once they are assigned to your section or subject."
            title="No visible learners"
          />
        )}
      </ActionDisclosure>

      <section className="rounded-lg border border-slate-200 bg-white p-4 shadow-soft">
        <div className="flex items-start gap-3">
          <span className="grid size-12 place-items-center rounded-lg bg-skybrand-50 text-skybrand-600">
            <FileText size={24} />
          </span>
          <div>
            <h2 className="font-display text-xl font-extrabold text-navy-950">
              Certificate history
            </h2>
          </div>
        </div>

        {certificates.length ? (
          <div className="mt-4 grid gap-3">
            {certificates.map((certificate) => {
              const enrollment = enrollmentById.get(certificate.enrollment_id);

              return (
                <article
                  className="flex flex-col gap-4 rounded-lg border border-slate-200 bg-slate-50 p-4 lg:flex-row lg:items-center lg:justify-between"
                  key={certificate.id}
                >
                  <div>
                    <p className="font-semibold text-navy-950">
                      {enrollment
                        ? enrollmentLabel(
                            enrollment,
                            learnerById,
                            yearById,
                            gradeById,
                            sectionById,
                          )
                        : "Certificate"}
                    </p>
                    <p className="mt-1 text-sm text-slate-500">
                      {typeLabel(certificate.certificate_type)} -{" "}
                      {templateById.get(
                        certificate.certificate_template_id ?? "",
                      )?.name ?? "Temporary clean template"}{" "}
                      - {formatDateTime(certificate.generated_at)}
                    </p>
                  </div>
                  <a
                    className="inline-flex min-h-9 w-fit items-center justify-center gap-2 self-start rounded-lg border border-slate-200 bg-white px-3 py-1.5 text-sm font-bold text-navy-950 transition hover:border-slate-300 hover:bg-slate-50"
                    href={`/api/certificates?id=${certificate.id}`}
                  >
                    <Download size={17} />
                    Download PDF
                  </a>
                </article>
              );
            })}
          </div>
        ) : (
          <div className="mt-4">
            <EmptyState
              message="Generated certificates will appear here after your first certificate is created."
              title="No certificate history"
            />
          </div>
        )}
      </section>
    </div>
  );
}
