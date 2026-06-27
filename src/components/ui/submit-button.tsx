"use client";

import { useFormStatus } from "react-dom";
import { LoaderCircle } from "lucide-react";

import { Button } from "@/components/ui/button";

export function SubmitButton({
  children,
  pendingLabel = "Saving...",
}: {
  children: React.ReactNode;
  pendingLabel?: string;
}) {
  const { pending } = useFormStatus();

  return (
    <Button disabled={pending} type="submit">
      {pending ? (
        <>
          <LoaderCircle className="animate-spin" size={17} />
          {pendingLabel}
        </>
      ) : (
        children
      )}
    </Button>
  );
}
