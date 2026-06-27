import { ModulePage } from "@/components/modules/module-page";
import { getTeacherModule } from "@/lib/module-catalog";

export default function Page() {
  return <ModulePage module={getTeacherModule("certificates")} />;
}
