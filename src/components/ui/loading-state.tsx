export function LoadingState() {
  return (
    <div className="grid min-h-[60vh] place-items-center px-6">
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
