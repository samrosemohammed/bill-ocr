import { LoginForm } from "../_components/login-form";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Log in",
  description: "Log in to your Bill OCR workspace.",
};

const LoginPage = () => {
  return (
    <div className="flex min-h-svh flex-col items-center justify-center gap-6 bg-background p-6 md:p-10">
      <div className="w-full max-w-sm">
        <LoginForm />
      </div>
    </div>
  );
};

export default LoginPage;
