"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import {
  Field,
  FieldDescription,
  FieldGroup,
  FieldLabel,
} from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { authClient } from "@/lib/auth-client";
import { PasswordInput } from "@/components/password-input";

export function ResetPasswordForm({ initialEmail }: { initialEmail: string }) {
  const router = useRouter();
  const [email, setEmail] = useState(initialEmail);
  const [pending, setPending] = useState(false);
  const [error, setError] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const onSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError("");
    const fd = new FormData(e.currentTarget);
    const otp = String(fd.get("otp")).trim();
    const password = String(fd.get("password"));
    if (password.length < 8)
      return setError("Password must be at least 8 characters.");
    if (password !== String(fd.get("confirm")))
      return setError("Passwords do not match.");

    setPending(true);
    try {
      const { error } = await authClient.emailOtp.resetPassword({
        email: email.trim(),
        otp,
        password,
      });
      if (error)
        setError(error.message || "That code is invalid or has expired.");
      else router.push("/login");
    } catch {
      setError("Something went wrong. Please try again.");
    } finally {
      setPending(false);
    }
  };

  return (
    <form onSubmit={onSubmit}>
      <FieldGroup>
        <Field>
          <FieldLabel htmlFor="email">Email</FieldLabel>
          <Input
            id="email"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            autoComplete="email"
            required
          />
        </Field>
        <Field>
          <FieldLabel htmlFor="otp">Code</FieldLabel>
          <Input
            id="otp"
            name="otp"
            inputMode="numeric"
            autoComplete="one-time-code"
            pattern="[0-9]{6}"
            maxLength={6}
            placeholder="123456"
            required
            autoFocus
          />
        </Field>
        <Field>
          <FieldLabel htmlFor="password">New password</FieldLabel>

          <PasswordInput
            id="password"
            name="password"
            autoComplete="new-password"
            placeholder="Enter your new password"
            minLength={8}
            required
            showPassword={showPassword}
            onToggle={() => setShowPassword((prev) => !prev)}
          />

          <FieldDescription>At least 8 characters.</FieldDescription>
        </Field>
        <Field>
          <FieldLabel htmlFor="confirm">Confirm new password</FieldLabel>

          <PasswordInput
            id="confirm"
            name="confirm"
            autoComplete="new-password"
            placeholder="Confirm your new password"
            required
            showPassword={showConfirmPassword}
            onToggle={() => setShowConfirmPassword((prev) => !prev)}
          />
        </Field>

        {error && (
          <p className="text-sm text-destructive" role="alert">
            {error}
          </p>
        )}

        <Field>
          <Button type="submit" disabled={pending}>
            {pending ? "Saving..." : "Reset password"}
          </Button>
          <FieldDescription className="text-center">
            No code?{" "}
            <a href="/forgot-password" className="underline">
              Send a new one
            </a>
          </FieldDescription>
        </Field>
      </FieldGroup>
    </form>
  );
}
