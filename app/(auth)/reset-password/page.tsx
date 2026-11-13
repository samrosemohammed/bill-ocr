import { AuthShell } from "../_components/auth-shell";
import { ResetPasswordForm } from "../_components/reset-password-form";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Reset password",
  description: "Choose a new password for your Bill OCR account.",
};

export default async function ResetPasswordPage({
  searchParams,
}: {
  searchParams: Promise<{ email?: string }>;
}) {
  const { email } = await searchParams;
  return (
    <AuthShell
      title="Reset your password"
      description="Enter the code from your email and choose a new password."
    >
      <ResetPasswordForm initialEmail={email ?? ""} />
    </AuthShell>
  );
}
