import { AuthShell } from "../_components/auth-shell";
import { SignUpForm } from "../_components/sign-up-form";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Create an account",
  description: "Create your Bill OCR account and start organizing bills.",
};

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
