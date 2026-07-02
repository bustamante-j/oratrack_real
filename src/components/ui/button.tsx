import Link from "next/link";
import type {
  AnchorHTMLAttributes,
  ButtonHTMLAttributes,
  ReactNode,
} from "react";

import { cn } from "@/lib/utils";

const variants = {
  primary:
    "border border-navy-900 bg-white text-navy-950 hover:bg-navy-900 hover:text-white",
  secondary:
    "border border-slate-200 bg-white text-navy-950 hover:border-slate-300 hover:bg-slate-50",
  ghost: "text-slate-700 hover:bg-skybrand-50 hover:text-navy-900",
};

const base =
  "inline-flex min-h-9 w-fit max-w-full items-center justify-center gap-2 rounded-lg px-3 py-1.5 text-center text-sm font-bold transition";

type ButtonProps = ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: keyof typeof variants;
};

export function Button({
  className,
  variant = "primary",
  ...props
}: ButtonProps) {
  return (
    <button
      className={cn(base, variants[variant], className)}
      type={props.type ?? "button"}
      {...props}
    />
  );
}

type ButtonLinkProps = AnchorHTMLAttributes<HTMLAnchorElement> & {
  children: ReactNode;
  href: string;
  variant?: keyof typeof variants;
};

export function ButtonLink({
  className,
  variant = "primary",
  href,
  children,
  ...props
}: ButtonLinkProps) {
  return (
    <Link
      className={cn(base, variants[variant], className)}
      href={href}
      {...props}
    >
      {children}
    </Link>
  );
}
