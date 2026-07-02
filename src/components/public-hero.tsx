import Image from "next/image";
import type { ReactNode } from "react";

export function PublicHero({
  eyebrow,
  title,
  description,
  image = "/assets/balili-campus-hero.webp",
  children,
}: {
  eyebrow: string;
  title: string;
  description: string;
  image?: string;
  children?: ReactNode;
}) {
  return (
    <section className="hero-noise relative min-h-[500px] overflow-hidden bg-navy-950 text-white sm:min-h-[560px]">
      <Image
        alt=""
        className="absolute inset-0 h-full w-full object-cover opacity-72"
        fill
        priority
        src={image}
      />
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_72%_38%,rgba(142,220,255,.18),transparent_25%),linear-gradient(90deg,#071b33_0%,rgba(7,27,51,.96)_38%,rgba(11,36,71,.68)_72%,rgba(7,27,51,.92)_100%)]" />
      <div className="absolute inset-x-0 bottom-0 h-40 bg-gradient-to-t from-navy-950 to-transparent" />
      <div className="relative mx-auto grid min-h-[500px] max-w-7xl items-end gap-8 px-5 py-16 sm:min-h-[560px] sm:px-6 lg:grid-cols-[1fr_18rem] lg:px-8">
        <div className="max-w-4xl pb-4">
          <p className="flex items-center gap-3 text-xs font-extrabold uppercase tracking-[0.28em] text-skybrand-300">
            <span className="h-px w-10 bg-skybrand-400" />
            {eyebrow}
          </p>
          <h1 className="text-balance mt-5 max-w-full font-display text-[clamp(2.9rem,7vw,6.6rem)] font-extrabold uppercase leading-[.92]">
            {title}
          </h1>
          <p className="mt-6 max-w-2xl text-base font-semibold leading-8 text-slate-200 sm:text-lg">
            {description}
          </p>
          {children}
        </div>
        <div className="hidden border-l border-white/20 pl-6 pb-4 lg:block">
          <p className="text-xs font-extrabold uppercase tracking-[0.24em] text-white/45">
            Balili ES
          </p>
          <p className="mt-4 text-sm font-bold uppercase leading-6 text-white">
            Official updates, programs, and school information for families.
          </p>
        </div>
      </div>
    </section>
  );
}
