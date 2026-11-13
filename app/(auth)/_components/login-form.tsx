"use client";
import { useState } from "react";
import Link from "next/link";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import {
  Field,
  FieldDescription,
  FieldGroup,
  FieldLabel,
  FieldSeparator,
} from "@/components/ui/field";
import { Brand } from "@/components/brand";
import { PasswordInput } from "@/components/password-input";
import { authClient } from "@/lib/auth-client";
import { Input } from "@/components/ui/input";

export const LoginForm = ({
  className,
  ...props
}: React.ComponentProps<"div">) => {
  const [isPending, setIsPending] = useState(false);
  const [error, setError] = useState("");
  const [showPassword, setShowPassword] = useState(false);

  const handleLogin = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    setError("");
    setIsPending(true);

    const formData = new FormData(e.currentTarget);

    const email = formData.get("email") as string;
    const password = formData.get("password") as string;

    try {
      const { error } = await authClient.signIn.email({
        email,
        password,
        callbackURL: "/dashboard",
        rememberMe: false,
      });
      if (error) {
        setError(
          error.status === 403
            ? "Please verify your email first. We've sent you a new verification link."
            : error.message || "Invalid email or password.",
        );
      }
    } catch {
      setError("Something went wrong. Please try again.");
    } finally {
      setIsPending(false);
    }
  };

  const handleSocialLogin = async (provider: "github" | "google") => {
    setError("");

    try {
      await authClient.signIn.social({
        provider,
        callbackURL: "/dashboard",
      });
    } catch {
      setError(`Failed to sign in with ${provider}.`);
    }
  };

  return (
    <div className={cn("flex flex-col gap-6", className)} {...props}>
      <form onSubmit={handleLogin}>
        <FieldGroup>
          <div className="flex flex-col items-center gap-2 text-center">
            <Brand className="size-12 rounded-full" iconClassName="size-6" />

            <h1 className="text-xl font-bold">Welcome to Bill OCR.</h1>

            <FieldDescription>
              Do not have an account?{" "}
              <Link href="/sign-up" className="underline">
                Sign up
              </Link>
            </FieldDescription>
          </div>

          <Field>
            <FieldLabel htmlFor="email">Email</FieldLabel>
            <Input
              id="email"
              name="email"
              type="email"
              placeholder="m@example.com"
              autoComplete="email"
              required
            />
          </Field>

          <Field>
            <div className="flex items-center">
              <FieldLabel htmlFor="password">Password</FieldLabel>
              <Link
                href="/forgot-password"
                className="ml-auto text-sm underline-offset-4 hover:underline"
              >
                Forgot your password?
              </Link>
            </div>

            <PasswordInput
              id="password"
              name="password"
              placeholder="Enter your password"
              autoComplete="current-password"
              required
              showPassword={showPassword}
              onToggle={() => setShowPassword((prev) => !prev)}
            />
          </Field>

          {error && (
            <p className="text-sm text-destructive" role="alert">
              {error}
            </p>
          )}

          <Field>
            <Button type="submit" disabled={isPending}>
              {isPending ? "Signing in..." : "Login"}
            </Button>
          </Field>

          <FieldSeparator>Or continue with</FieldSeparator>

          <Field className="grid gap-4 sm:grid-cols-2">
            <Button
              variant="outline"
              type="button"
              onClick={() => handleSocialLogin("github")}
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 24 24"
                className="size-4"
                fill="currentColor"
              >
                <path d="M12 .297a12 12 0 0 0-3.797 23.383c.6.111.82-.261.82-.577v-2.234c-3.338.726-4.043-1.416-4.043-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.09-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.108-.775.418-1.305.762-1.605-2.665-.3-5.466-1.333-5.466-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.536-1.524.117-3.176 0 0 1.008-.322 3.301 1.23a11.5 11.5 0 0 1 6.004 0c2.291-1.552 3.297-1.23 3.297-1.23.655 1.652.243 2.873.12 3.176.77.84 1.235 1.91 1.235 3.221 0 4.61-2.805 5.628-5.476 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.216.694.825.576A12 12 0 0 0 12 .297" />
              </svg>
              Continue with Github
            </Button>

            <Button
              variant="outline"
              type="button"
              onClick={() => handleSocialLogin("google")}
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 24 24"
                className="size-4"
                fill="currentColor"
              >
                <path d="M12.48 10.92v3.28h7.84c-.24 1.84-.853 3.187-1.787 4.133-1.147 1.147-2.933 2.4-6.053 2.4-4.827 0-8.6-3.893-8.6-8.72s3.773-8.72 8.6-8.72c2.6 0 4.507 1.027 5.907 2.347l2.307-2.307C18.747 1.44 16.133 0 12.48 0 5.867 0 .307 5.387.307 12s5.56 12 12.173 12c3.573 0 6.267-1.173 8.373-3.36 2.16-2.16 2.84-5.213 2.84-7.667 0-.76-.053-1.467-.173-2.053H12.48z" />
              </svg>
              Continue with Google
            </Button>
          </Field>
        </FieldGroup>
      </form>

      <FieldDescription className="px-6 text-center">
        By clicking continue, you agree to our{" "}
        <Link href="/terms" className="underline">
          Terms of Service
        </Link>{" "}
        and{" "}
        <Link href="/privacy" className="underline">
          Privacy Policy
        </Link>
        .
      </FieldDescription>
    </div>
  );
};
