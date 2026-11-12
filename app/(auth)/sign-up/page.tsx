import { AuthShell } from "../_components/auth-shell";
import { SignUpForm } from "../_components/sign-up-form";

export default function SignUpPage() {
  return (
    <AuthShell
      title="Create your account"
      description="Start reading bills in minutes."
    >
      <SignUpForm />
    </AuthShell>
  );
}
