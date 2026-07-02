"use client";

import { useActionState } from "react";
import { ImageUp, KeyRound, Save } from "lucide-react";

import { Button } from "@/components/ui/button";
import {
  changeOwnPasswordAction,
  uploadOwnAvatarAction,
  updateOwnProfileAction,
} from "@/lib/profile/actions";

type ProfileFormData = {
  avatarUrl: string | null;
  fullName: string;
  phone: string;
};

function FieldError({ errors }: { errors?: string[] }) {
  if (!errors?.length) return null;

  return (
    <p className="mt-1 text-xs font-semibold text-rose-700">{errors[0]}</p>
  );
}

export function ProfileForms({ profile }: { profile: ProfileFormData }) {
  const [profileState, profileAction, profilePending] = useActionState(
    updateOwnProfileAction,
    {},
  );
  const [avatarState, avatarAction, avatarPending] = useActionState(
    uploadOwnAvatarAction,
    {},
  );
  const [passwordState, passwordAction, passwordPending] = useActionState(
    changeOwnPasswordAction,
    {},
  );

  return (
    <div className="grid gap-4">
      <form
        action={avatarAction}
        className="rounded-lg border border-slate-200 bg-white p-4 shadow-soft"
      >
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <span
              className="grid size-11 place-items-center overflow-hidden rounded-lg bg-skybrand-50 bg-cover bg-center text-skybrand-600"
              style={
                profile.avatarUrl
                  ? { backgroundImage: `url(${profile.avatarUrl})` }
                  : undefined
              }
            >
              {profile.avatarUrl ? null : <ImageUp size={21} />}
            </span>
            <h2 className="font-display text-lg font-extrabold text-navy-950">
              Profile photo
            </h2>
          </div>
          <label className="min-w-[min(100%,18rem)]">
            <span className="label">Image</span>
            <input
              accept="image/jpeg,image/png,image/webp"
              className="input"
              name="avatar"
              required
              type="file"
            />
          </label>
          <Button disabled={avatarPending} type="submit">
            {avatarPending ? "Uploading..." : "Upload"}
          </Button>
        </div>
        {avatarState.message ? (
          <p className="mt-3 rounded-lg bg-skybrand-50 px-3 py-2 text-sm font-semibold text-navy-900">
            {avatarState.message}
          </p>
        ) : null}
      </form>

      <form
        action={profileAction}
        className="rounded-lg border border-slate-200 bg-white p-4 shadow-soft"
      >
        <div className="flex items-start gap-3">
          <span className="grid size-10 place-items-center rounded-lg bg-skybrand-50 text-skybrand-600">
            <Save size={21} />
          </span>
          <div>
            <h2 className="font-display text-lg font-extrabold text-navy-950">
              Profile details
            </h2>
          </div>
        </div>

        <div className="mt-4 grid gap-3">
          <label>
            <span className="label">Full name</span>
            <input
              className="input"
              defaultValue={profile.fullName}
              name="fullName"
              required
            />
            <FieldError errors={profileState.errors?.fullName} />
          </label>
          <label>
            <span className="label">Phone</span>
            <input
              className="input"
              defaultValue={profile.phone}
              name="phone"
            />
            <FieldError errors={profileState.errors?.phone} />
          </label>
        </div>

        {profileState.message ? (
          <p className="mt-4 rounded-xl bg-skybrand-50 px-3 py-2 text-sm font-semibold text-navy-900">
            {profileState.message}
          </p>
        ) : null}

        <Button className="mt-4" disabled={profilePending} type="submit">
          {profilePending ? "Saving..." : "Save profile"}
        </Button>
      </form>

      <form
        action={passwordAction}
        className="rounded-lg border border-slate-200 bg-white p-4 shadow-soft"
      >
        <div className="flex items-start gap-3">
          <span className="grid size-10 place-items-center rounded-lg bg-skybrand-50 text-skybrand-600">
            <KeyRound size={21} />
          </span>
          <div>
            <h2 className="font-display text-lg font-extrabold text-navy-950">
              Password
            </h2>
          </div>
        </div>

        <div className="mt-4 grid gap-3">
          <label>
            <span className="label">Current password</span>
            <input
              autoComplete="current-password"
              className="input"
              name="currentPassword"
              required
              type="password"
            />
            <FieldError errors={passwordState.errors?.currentPassword} />
          </label>
          <label>
            <span className="label">New password</span>
            <input
              autoComplete="new-password"
              className="input"
              minLength={8}
              name="newPassword"
              required
              type="password"
            />
            <FieldError errors={passwordState.errors?.newPassword} />
          </label>
          <label>
            <span className="label">Confirm new password</span>
            <input
              autoComplete="new-password"
              className="input"
              minLength={8}
              name="confirmPassword"
              required
              type="password"
            />
            <FieldError errors={passwordState.errors?.confirmPassword} />
          </label>
        </div>

        {passwordState.message ? (
          <p className="mt-4 rounded-xl bg-skybrand-50 px-3 py-2 text-sm font-semibold text-navy-900">
            {passwordState.message}
          </p>
        ) : null}

        <Button className="mt-4" disabled={passwordPending} type="submit">
          {passwordPending ? "Changing..." : "Change password"}
        </Button>
      </form>
    </div>
  );
}
