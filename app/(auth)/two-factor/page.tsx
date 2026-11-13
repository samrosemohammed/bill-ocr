import { AuthShell } from "../_components/auth-shell";
import { TwoFactorForm } from "../_components/two-factor-form";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Two-factor authentication",
  description: "Verify your identity with your authenticator code.",
};

export default function TwoFactorPage() {
  return (
    <AuthShell
      title="Two-factor authentication"
      description="Enter the code from your authenticator app."
    >
      <TwoFactorForm />
    </AuthShell>
  );
}
