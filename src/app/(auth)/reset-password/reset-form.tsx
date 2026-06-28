"use client";

import { useActionState } from "react";
import Link from "next/link";
import { ArrowLeft, LoaderCircle, Mail } from "lucide-react";

import { Button } from "@/components/ui/button";

import { resetPasswordAction } from "./actions";

export function ResetPasswordForm() {
  const [state, action, pending] = useActionState(resetPasswordAction, {});

  return (
    <form action={action} className="w-full max-w-xl">
      <Link
        className="mb-8 inline-flex items-center gap-2 text-sm font-semibold text-slate-500 hover:text-navy-900"
        href="/login"
      >
        <ArrowLeft size={17} />
        Back to login
      </Link>
      <h1 className="font-display text-3xl font-extrabold text-navy-950">
        Reset password
      </h1>
      <p className="mt-2 text-sm leading-6 text-slate-600">
        Enter the teacher account email address. Supabase will send the reset
        email after auth settings are configured.
      </p>
      <label className="mt-6 block">
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
            type="email"
          />
        </span>
        {state.errors?.email ? (
          <span className="text-xs text-rose-700">
            {state.errors.email.join(" ")}
          </span>
        ) : null}
      </label>
      {state.message ? (
        <p className="mt-4 rounded-md bg-blue-50 px-3 py-2 text-sm text-blue-900">
          {state.message}
        </p>
      ) : null}
      <Button className="mt-6 w-full" disabled={pending} type="submit">
        {pending ? (
          <>
            <LoaderCircle className="animate-spin" size={17} />
            Sending...
          </>
        ) : (
          "Send reset link"
        )}
      </Button>
    </form>
  );
}
