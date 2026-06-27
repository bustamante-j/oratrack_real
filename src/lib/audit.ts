import "server-only";

import { createSupabaseServerClient } from "@/lib/supabase/server";
import type { Json } from "@/types/database";

type SupabaseServerClient = Awaited<
  ReturnType<typeof createSupabaseServerClient>
>;

export async function logAuditEvent(
  supabase: SupabaseServerClient,
  input: {
    actorId: string;
    action: string;
    entityTable: string;
    entityId?: string | null;
    metadata?: Json;
  },
) {
  await supabase.from("audit_logs").insert({
    actor_id: input.actorId,
    action: input.action,
    entity_table: input.entityTable,
    entity_id: input.entityId ?? null,
    metadata: input.metadata ?? {},
  });
}
