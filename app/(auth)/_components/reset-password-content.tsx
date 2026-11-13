"use client";

import { useSearchParams } from "next/navigation";
import { AuthShell } from "./auth-shell";
import { ResetPasswordForm } from "./reset-password-form";

export function ResetPasswordContent() {
  const searchParams = useSearchParams();

  return (
    <AuthShell
      title="Reset your password"
      description="Enter the code from your email and choose a new password."
    >
      <ResetPasswordForm initialEmail={searchParams.get("email") ?? ""} />
    </AuthShell>
  );
}
