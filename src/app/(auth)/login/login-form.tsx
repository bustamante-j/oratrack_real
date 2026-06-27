"use client";

import { useActionState } from "react";
import Link from "next/link";
import { ArrowLeft, LoaderCircle, LockKeyhole, Mail } from "lucide-react";

import { BrandLogo } from "@/components/brand-logo";
import { Button } from "@/components/ui/button";

import { loginAction } from "./actions";

export function LoginForm() {
  const [state, action, pending] = useActionState(loginAction, {});

  return (
    <form action={action} className="w-full max-w-xl">
      <Link
        className="mb-8 inline-flex items-center gap-2 text-sm font-semibold text-slate-500 hover:text-navy-900"
        href="/"
      >
        <ArrowLeft size={17} />
        Back to school website
      </Link>
      <BrandLogo compact className="mb-7 lg:hidden" />
      <h1 className="font-display text-3xl font-extrabold text-navy-950">
        Welcome back, educator
      </h1>
      <p className="mt-2 text-sm leading-6 text-slate-500">
        Use the account created by the Admin/Principal.
      </p>

      <div className="mt-7 grid gap-4">
        <label className="block">
          <span className="label">Email address</span>
          <span className="relative block">
            <Mail
              aria-hidden="true"
              className="pointer-events-none absolute left-4 top-1/2 z-10 -translate-y-1/2 text-slate-400"
              size={18}
            />
            <input
              autoComplete="email"
              className="input input-icon-left py-3 pr-4"
              name="email"
              placeholder="admin@gmail.com"
              type="email"
            />
          </span>
          {state.errors?.email ? (
            <span className="text-xs text-rose-700">
              {state.errors.email.join(" ")}
            </span>
          ) : null}
        </label>
        <label className="block">
          <span className="label">Password</span>
          <span className="relative block">
            <LockKeyhole
              aria-hidden="true"
              className="pointer-events-none absolute left-4 top-1/2 z-10 -translate-y-1/2 text-slate-400"
              size={18}
            />
            <input
              autoComplete="current-password"
              className="input input-icon-left py-3 pr-4"
              name="password"
              placeholder="Enter password"
              type="password"
            />
          </span>
          {state.errors?.password ? (
            <span className="text-xs text-rose-700">
              {state.errors.password.join(" ")}
            </span>
          ) : null}
        </label>
      </div>

      {state.message ? (
        <p className="mt-4 rounded-xl bg-rose-50 px-4 py-3 text-sm font-medium text-rose-700">
          {state.message}
        </p>
      ) : null}

      <Button className="mt-6 w-full" disabled={pending} type="submit">
        {pending ? (
          <>
            <LoaderCircle className="animate-spin" size={17} />
            Signing in...
          </>
        ) : (
          "Sign in"
        )}
      </Button>

      <div className="mt-4 flex justify-end text-sm">
        <Link
          className="font-medium text-skybrand-600 hover:text-navy-900"
          href="/reset-password"
        >
          Reset password
        </Link>
      </div>
    </form>
  );
}
