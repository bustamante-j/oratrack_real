import Link from "next/link";
import { BotMessageSquare } from "lucide-react";

import type { AppRole } from "@/types/domain";

export function FloatingAiLauncher({ role }: { role: AppRole }) {
  const href = role === "admin_principal" ? "/admin/ai" : "/teacher/ai";

  return (
    <Link
      aria-label="Open ORATRACK AI assistant"
      className="fixed bottom-5 right-5 z-40 grid size-14 place-items-center rounded-2xl bg-navy-900 text-white shadow-[0_18px_45px_rgba(7,27,51,.28)] transition hover:-translate-y-1 hover:bg-skybrand-600 focus-visible:outline focus-visible:outline-4 focus-visible:outline-skybrand-200 sm:bottom-7 sm:right-7"
      href={href}
      title="Open AI assistant"
    >
      <BotMessageSquare size={25} />
    </Link>
  );
}
