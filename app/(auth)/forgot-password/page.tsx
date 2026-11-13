import { AuthShell } from "../_components/auth-shell";
import { ForgotPasswordForm } from "../_components/forgot-password";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Forgot password",
  description: "Request a secure link to reset your Bill OCR password.",
};

export default function ForgotPasswordPage() {
  return (
    <AuthShell
      title="Forgot your password?"
      description="Enter your email and we'll send you a reset link."
    >
      <ForgotPasswordForm />
    </AuthShell>
  );
}
