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
    <section className="hero-noise relative min-h-[470px] overflow-hidden bg-navy-950 text-white sm:min-h-[540px]">
      <Image
        alt=""
        className="absolute inset-0 h-full w-full object-cover"
        fill
        priority
        src={image}
      />
      <div className="absolute inset-0 bg-gradient-to-r from-navy-950 via-navy-950/85 to-navy-950/25" />
      <div className="absolute inset-0 bg-gradient-to-t from-navy-950/80 via-transparent to-transparent" />
      <div className="relative mx-auto flex min-h-[470px] max-w-7xl items-center px-4 py-20 sm:min-h-[540px] sm:px-6 lg:px-8">
        <div className="max-w-3xl">
          <p className="flex items-center gap-3 text-xs font-bold uppercase text-skybrand-300">
            <span className="h-px w-10 bg-skybrand-400" />
            {eyebrow}
          </p>
          <h1 className="text-balance mt-5 max-w-full font-display text-[2.55rem] font-extrabold leading-[1.08] sm:text-5xl lg:text-6xl">
            {title}
          </h1>
          <p className="mt-6 max-w-2xl text-base leading-8 text-slate-200 sm:text-lg">
            {description}
          </p>
          {children}
        </div>
      </div>
    </section>
  );
}
