import { Award, Download, FileText, PlusCircle, Printer } from "lucide-react";

import { ActionDisclosure } from "@/components/ui/action-disclosure";
import { EmptyState } from "@/components/ui/empty-state";
import { MetricStrip } from "@/components/ui/metric-strip";
import { SubmitButton } from "@/components/ui/submit-button";
import {
  createCertificateTemplateAction,
  generateCertificateAction,
} from "@/lib/certificates/actions";
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
  created_at: string;
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

export default async function AdminCertificatesPage() {
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
      .select("id,name,certificate_type,is_active,created_at")
      .order("created_at", { ascending: false }),
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
  const activeTemplates = templates.filter((template) => template.is_active);
  const availableEnrollments = enrollments.filter((enrollment) => {
    const learner = learnerById.get(enrollment.learner_id);
    return (
      enrollment.enrollment_status === "enrolled" &&
      learner?.status === "active"
    );
  });
  const recognitionCount = certificates.filter(
    (certificate) => certificate.certificate_type === "recognition",
  ).length;
  const completionCount = certificates.filter(
    (certificate) => certificate.certificate_type === "completion",
  ).length;

  return (
    <div className="space-y-6">
      <div>
        <p className="text-xs font-bold uppercase text-skybrand-600">
          Phase 13
        </p>
        <h1 className="mt-3 font-display text-3xl font-extrabold text-navy-950">
          Certificates
        </h1>
        <details className="mt-3 max-w-3xl text-sm leading-7 text-slate-600">
          <summary className="cursor-pointer text-sm font-bold text-navy-950">
            More
          </summary>
          Manage certificate templates and generate printable recognition or
          completion PDFs for enrolled learners.
        </details>
      </div>

      <MetricStrip
        items={[
          { label: "Active templates", value: activeTemplates.length },
          { label: "Generated PDFs", value: certificates.length },
          { label: "Recognition", value: recognitionCount },
          { label: "Completion", value: completionCount },
        ]}
      />

      <div className="grid gap-6 xl:grid-cols-[0.82fr_1.18fr]">
        <section className="rounded-lg border border-slate-200 bg-white p-4 shadow-soft">
          <div className="flex items-center justify-between gap-3">
            <h2 className="font-display text-xl font-extrabold text-navy-950">
              Templates
            </h2>
            <span className="rounded-full bg-skybrand-50 px-3 py-1 text-xs font-bold text-skybrand-600">
              {templates.length} total
            </span>
          </div>

          <ActionDisclosure
            className="mt-5 bg-slate-50 shadow-none"
            icon={<PlusCircle size={17} />}
            meta="Name and type"
            title="Create template"
          >
            <form
              action={createCertificateTemplateAction}
              className="grid gap-4"
            >
              <label>
                <span className="label">Template name</span>
                <input
                  className="input"
                  name="name"
                  placeholder="Quarter recognition template"
                  required
                />
              </label>
              <label>
                <span className="label">Certificate type</span>
                <select className="input" name="certificateType" required>
                  {certificateTypes.map((type) => (
                    <option key={type} value={type}>
                      {typeLabel(type)}
                    </option>
                  ))}
                </select>
              </label>
              <div>
                <SubmitButton pendingLabel="Creating template...">
                  Create template
                </SubmitButton>
              </div>
            </form>
          </ActionDisclosure>

          <div className="mt-6 grid gap-3">
            {templates.slice(0, 5).map((template) => (
              <article
                className="rounded-lg border border-slate-200 bg-slate-50 p-4"
                key={template.id}
              >
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <p className="font-semibold text-navy-950">{template.name}</p>
                  <span className="rounded-full bg-white px-3 py-1 text-xs font-bold text-slate-600">
                    {typeLabel(template.certificate_type)}
                  </span>
                </div>
                <p className="mt-2 text-xs font-bold uppercase text-slate-500">
                  {template.is_active ? "Active" : "Inactive"} template
                </p>
              </article>
            ))}
          </div>
        </section>

        <section className="rounded-lg border border-slate-200 bg-white p-4 shadow-soft">
          <ActionDisclosure
            className="shadow-none"
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
                      {activeTemplates.map((template) => (
                        <option key={template.id} value={template.id}>
                          {template.name} (
                          {typeLabel(template.certificate_type)})
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
                message="Register and enroll learners before generating certificates."
                title="No enrolled learners"
              />
            )}
          </ActionDisclosure>
        </section>
      </div>

      <section className="rounded-lg border border-slate-200 bg-white p-4 shadow-soft">
        <div className="flex items-start gap-3">
          <span className="grid size-12 place-items-center rounded-lg bg-skybrand-50 text-skybrand-600">
            <FileText size={24} />
          </span>
          <div>
            <h2 className="font-display text-xl font-extrabold text-navy-950">
              Generated certificates
            </h2>
          </div>
        </div>

        {certificates.length ? (
          <div className="mt-6 grid gap-3">
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
                    className="inline-flex min-h-9 items-center justify-center gap-2 rounded-lg border border-slate-200 bg-white px-3 py-1.5 text-sm font-bold text-navy-950 transition hover:border-slate-300 hover:bg-slate-50"
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
          <div className="mt-6">
            <EmptyState
              message="Generated certificates will appear here after the first PDF is created."
              title="No certificates generated"
            />
          </div>
        )}
      </section>
    </div>
  );
}
