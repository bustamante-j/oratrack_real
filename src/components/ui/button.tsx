import Link from "next/link";
import type {
  AnchorHTMLAttributes,
  ButtonHTMLAttributes,
  ReactNode,
} from "react";

import { cn } from "@/lib/utils";

const variants = {
  primary:
    "bg-navy-900 text-white shadow-lg shadow-navy-900/15 hover:bg-skybrand-600 hover:shadow-skybrand-500/25",
  secondary:
    "border border-slate-200 bg-white text-navy-950 shadow-sm hover:border-skybrand-300 hover:bg-skybrand-50",
  ghost: "text-slate-700 hover:bg-skybrand-50 hover:text-navy-900",
};

const base =
  "inline-flex min-h-10 items-center justify-center gap-2 rounded-xl px-4 py-2 text-center text-sm font-bold transition";

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
