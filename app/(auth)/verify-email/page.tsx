import { Suspense } from "react";
import { VerifyEmailContent } from "../_components/verify-email-content";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Verify your email",
  description: "Verify your email address to finish setting up Bill OCR.",
};

export default function VerifyEmailPage() {
  return (
    <Suspense>
      <VerifyEmailContent />
    </Suspense>
  );
}
