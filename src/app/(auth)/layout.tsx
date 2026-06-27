import Image from "next/image";
import { Check, ShieldCheck } from "lucide-react";

import { BrandLogo } from "@/components/brand-logo";
import { Badge } from "@/components/ui/badge";
import { school } from "@/lib/constants";

export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <main className="min-h-screen bg-slate-50 lg:grid lg:grid-cols-[1.05fr_.95fr]">
      <section className="hero-noise relative hidden overflow-hidden bg-navy-950 p-12 text-white lg:flex lg:flex-col">
        <Image
          alt=""
          className="absolute inset-0 h-full w-full object-cover"
          fill
          priority
          src="/assets/balili-campus-hero.webp"
        />
        <div className="absolute inset-0 bg-gradient-to-b from-navy-950/75 via-navy-950/85 to-navy-950" />
        <div className="absolute inset-0 public-grid opacity-10" />
        <BrandLogo inverse className="relative" />
        <div className="relative my-auto max-w-xl rounded-[2rem] border border-white/10 bg-navy-950/35 p-8 backdrop-blur-sm">
          <Badge tone="emerald">{school.name}</Badge>
          <h1 className="mt-7 font-display text-5xl font-extrabold leading-tight">
            One clear view of every learner&apos;s journey.
          </h1>
          <p className="mt-6 max-w-lg text-lg leading-8 text-slate-300">
            Track progress, notice support needs, and turn daily school records
            into thoughtful action.
          </p>
          <div className="mt-10 grid gap-4 sm:grid-cols-2">
            {[
              "Student-centered insights",
              "Permission-aware records",
              "Fast monthly reports",
              "Shared school updates",
            ].map((item) => (
              <div
                className="flex items-center gap-3 text-sm font-semibold"
                key={item}
              >
                <span className="grid size-7 place-items-center rounded-lg bg-skybrand-500/20 text-skybrand-300">
                  <Check size={15} />
                </span>
                {item}
              </div>
            ))}
          </div>
        </div>
        <div className="relative flex items-center gap-2 text-xs text-slate-400">
          <ShieldCheck size={16} />
          Real data access is protected by Supabase Auth and RLS.
        </div>
      </section>
      <section className="flex items-center justify-center px-4 py-12">
        {children}
      </section>
    </main>
  );
}
