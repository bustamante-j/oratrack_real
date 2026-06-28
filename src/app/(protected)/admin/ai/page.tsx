import { AiAssistantPanel } from "@/components/ai/ai-assistant-panel";
import { createSupabaseServerClient } from "@/lib/supabase/server";

export const metadata = {
  title: "AI Assistant",
};

function learnerName(learner: {
  lrn: string;
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
    .join(" ")
    .concat(` - ${learner.lrn}`);
}

export default async function Page() {
  const supabase = await createSupabaseServerClient();
  const [learnerResult, sectionResult, yearResult, logResult] =
    await Promise.all([
      supabase
        .from("learners")
        .select("id,lrn,first_name,middle_name,last_name,extension_name")
        .order("last_name", { ascending: true }),
      supabase
        .from("sections")
        .select("id,name,grade_level_id,school_year_id")
        .order("name", { ascending: true }),
      supabase
        .from("school_years")
        .select("id,name,status")
        .order("starts_on", { ascending: false }),
      supabase
        .from("ai_activity_logs")
        .select("id,intent,prompt_excerpt,output_excerpt,created_at")
        .order("created_at", { ascending: false })
        .limit(8),
    ]);

  const firstError =
    learnerResult.error ??
    sectionResult.error ??
    yearResult.error ??
    logResult.error;

  if (firstError) {
    throw new Error(firstError.message);
  }

  const years = yearResult.data ?? [];
  const yearById = new Map(years.map((year) => [year.id, year]));

  return (
    <AiAssistantPanel
      description="Summarize school-wide records and draft narratives without changing data automatically."
      learners={(learnerResult.data ?? []).map((learner) => ({
        id: learner.id,
        label: learnerName(learner),
      }))}
      logs={logResult.data ?? []}
      schoolYears={years.map((year) => ({
        id: year.id,
        label: `${year.name} (${year.status})`,
      }))}
      sections={(sectionResult.data ?? []).map((section) => ({
        id: section.id,
        label: `${yearById.get(section.school_year_id)?.name ?? "School year"} - ${section.name}`,
      }))}
      title="AI assistant"
    />
  );
}
