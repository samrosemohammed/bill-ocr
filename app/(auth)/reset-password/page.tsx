import { Suspense } from "react";
import { ResetPasswordContent } from "../_components/reset-password-content";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Reset password",
  description: "Choose a new password for your Bill OCR account.",
};

export default function ResetPasswordPage() {
  return (
    <Suspense>
      <ResetPasswordContent />
    </Suspense>
  );
}
