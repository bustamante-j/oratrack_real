import { LoaderCircle } from "lucide-react";

export function LoadingState({
  label = "Loading ORATRACK...",
}: {
  label?: string;
}) {
  return (
    <div className="grid min-h-[60vh] place-items-center px-6">
      <div className="w-full max-w-xs rounded-[1.5rem] border border-slate-200 bg-white p-5 text-center text-sm font-bold text-navy-950 shadow-soft">
        <div className="mx-auto grid size-12 place-items-center rounded-2xl bg-skybrand-50 text-skybrand-600">
          <LoaderCircle className="animate-spin" size={24} />
        </div>
        <span className="mt-3 block">{label}</span>
        <div className="mt-4 h-1.5 overflow-hidden rounded-full bg-slate-100">
          <div className="h-full w-1/2 animate-[pulse_1.2s_ease-in-out_infinite] rounded-full bg-skybrand-500" />
        </div>
      </div>
    </div>
  );
}
