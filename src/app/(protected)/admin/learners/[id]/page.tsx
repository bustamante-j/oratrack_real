import { LearnerPerformanceProfile } from "@/components/learners/learner-performance-profile";
import { requireAdminProfile } from "@/lib/auth/session";
import { getLearnerPerformanceData } from "@/lib/learners/performance";
import { createSupabaseServerClient } from "@/lib/supabase/server";

export const metadata = {
  title: "Learner Performance",
};

export default async function AdminLearnerDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  await requireAdminProfile();
  const { id } = await params;
  const supabase = await createSupabaseServerClient();
  const data = await getLearnerPerformanceData(supabase, id);

  return <LearnerPerformanceProfile backHref="/admin/learners" data={data} />;
}
