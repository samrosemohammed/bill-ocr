import { buttonVariants } from "@/components/ui/button";
import { getSession } from "@/lib/session";
import { AuthShell } from "../_components/auth-shell";
import { VerifyEmailForm } from "../_components/verify-email-form";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Verify your email",
  description: "Verify your email address to finish setting up Bill OCR.",
};

export default async function VerifyEmailPage({
  searchParams,
}: {
  searchParams: Promise<{ email?: string }>;
}) {
  const { email } = await searchParams;
  return (
    <AuthShell
      title="Verify your email"
      description="Enter the 6-digit code we sent to your email."
    >
      <VerifyEmailForm initialEmail={email ?? ""} />
    </AuthShell>
  );
}
