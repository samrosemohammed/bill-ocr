import { AuthShell } from "../_components/auth-shell";
import { TwoFactorForm } from "../_components/two-factor-form";

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
