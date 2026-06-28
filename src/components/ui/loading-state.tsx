export function LoadingState() {
  return (
    <div className="fixed inset-0 z-50 grid place-items-center bg-[#f4f8fc]/85 px-6 backdrop-blur-sm">
      <div
        aria-label="Loading"
        className="size-14 rounded-full border-4 border-skybrand-100 border-t-skybrand-600 shadow-soft motion-safe:animate-spin"
        role="status"
      >
        <span className="sr-only">Loading</span>
      </div>
    </div>
  );
}
