import { LoaderCircle } from "lucide-react";

export function LoadingState({
  label = "Loading ORATRACK...",
}: {
  label?: string;
}) {
  return (
    <div className="grid min-h-[60vh] place-items-center px-6">
      <div className="flex items-center gap-3 rounded-2xl border border-slate-200 bg-white px-5 py-4 text-sm font-bold text-navy-950 shadow-soft">
        <LoaderCircle className="animate-spin text-skybrand-600" size={22} />
        <span>{label}</span>
      </div>
    </div>
  );
}
