import { LearnerPerformanceProfile } from "@/components/learners/learner-performance-profile";
import { requireRole } from "@/lib/auth/session";
import { getLearnerPerformanceData } from "@/lib/learners/performance";
import { createSupabaseServerClient } from "@/lib/supabase/server";

export const metadata = {
  title: "Learner Performance",
};

export default async function TeacherLearnerDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  await requireRole("/teacher");
  const { id } = await params;
  const supabase = await createSupabaseServerClient();
  const data = await getLearnerPerformanceData(supabase, id);

  return <LearnerPerformanceProfile backHref="/teacher/learners" data={data} />;
}
