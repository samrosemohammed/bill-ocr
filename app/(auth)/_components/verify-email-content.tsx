"use client";

import { useSearchParams } from "next/navigation";
import { AuthShell } from "./auth-shell";
import { VerifyEmailForm } from "./verify-email-form";

export function VerifyEmailContent() {
  const searchParams = useSearchParams();

  return (
    <AuthShell
      title="Verify your email"
      description="Enter the 6-digit code we sent to your email."
    >
      <VerifyEmailForm initialEmail={searchParams.get("email") ?? ""} />
    </AuthShell>
  );
}
