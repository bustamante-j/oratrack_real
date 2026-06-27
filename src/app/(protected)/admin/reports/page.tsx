import { ModulePage } from "@/components/modules/module-page";
import { getAdminModule } from "@/lib/module-catalog";

export default function Page() {
  return <ModulePage module={getAdminModule("reports")} />;
}
