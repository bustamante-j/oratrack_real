export function LoadingState() {
  return (
    <div className="fixed left-0 top-0 z-50 flex h-dvh w-dvw items-center justify-center bg-[#f4f8fc]/90 px-6 backdrop-blur-sm">
      <div
        aria-label="Loading"
        className="size-14 rounded-full border-[3px] border-slate-200 border-t-skybrand-600 shadow-soft motion-safe:animate-spin"
        role="status"
      >
        <span className="sr-only">Loading</span>
      </div>
    </div>
  );
}
