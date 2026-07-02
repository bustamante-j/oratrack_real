import Image from "next/image";

import { cn } from "@/lib/utils";

export function BrandLogo({
  compact = false,
  inverse = false,
  className,
  markClassName,
  showText = true,
}: {
  compact?: boolean;
  inverse?: boolean;
  className?: string;
  markClassName?: string;
  showText?: boolean;
}) {
  return (
    <span className={cn("inline-flex items-center gap-3", className)}>
      <span
        className={cn(
          "grid shrink-0 place-items-center overflow-hidden rounded-2xl bg-white shadow-lg shadow-navy-950/15",
          compact ? "size-10 p-1" : "size-12 p-1.5",
          markClassName,
        )}
      >
        <Image
          alt=""
          className="h-full w-full object-contain"
          height={96}
          priority
          src="/oratrack-logo.png"
          width={96}
        />
      </span>
      {showText ? (
        <span
          className={cn(
            "font-display text-xl font-extrabold",
            compact ? "text-xl" : "text-xl sm:text-2xl",
            inverse ? "text-white" : "text-navy-950",
          )}
        >
          ORATRACK
        </span>
      ) : null}
    </span>
  );
}
