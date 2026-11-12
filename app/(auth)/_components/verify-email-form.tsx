"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Field, FieldGroup, FieldLabel } from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { authClient } from "@/lib/auth-client";

export function VerifyEmailForm({ initialEmail }: { initialEmail: string }) {
  const router = useRouter();
  const [email, setEmail] = useState(initialEmail);
  const [pending, setPending] = useState(false);
  const [error, setError] = useState("");
  const [info, setInfo] = useState("");
  const [cooldown, setCooldown] = useState(0);

  useEffect(() => {
    if (cooldown <= 0) return;
    const t = setTimeout(() => setCooldown((c) => c - 1), 1000);
    return () => clearTimeout(t);
  }, [cooldown]);

  const verify = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError("");
    setInfo("");
    const otp = String(new FormData(e.currentTarget).get("otp")).trim();

    setPending(true);
    try {
      const { error } = await authClient.emailOtp.verifyEmail({
        email: email.trim(),
        otp,
      });
      if (error) {
        setError(error.message || "That code is invalid or has expired.");
        return;
      }
      // Signed in automatically when the server allows it, otherwise go to login
      const session = await authClient.getSession();
      router.push(session.data ? "/dashboard" : "/login");
      router.refresh();
    } catch {
      setError("Something went wrong. Please try again.");
    } finally {
      setPending(false);
    }
  };

  const resend = async () => {
    setError("");
    setInfo("");
    if (!email.trim()) return setError("Enter your email first.");
    try {
      const { error } = await authClient.emailOtp.sendVerificationOtp({
        email: email.trim(),
        type: "email-verification",
      });
      if (error) {
        setError(error.message || "Could not send a new code.");
      } else {
        setInfo("If that email needs verifying, we sent a new code.");
        setCooldown(60);
      }
    } catch {
      setError("Something went wrong. Please try again.");
    }
  };

  return (
    <form onSubmit={verify}>
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
          <FieldLabel htmlFor="otp">Verification code</FieldLabel>
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

        {error && (
          <p className="text-sm text-destructive" role="alert">
            {error}
          </p>
        )}
        {info && <p className="text-sm text-muted-foreground">{info}</p>}

        <Field>
          <Button type="submit" disabled={pending}>
            {pending ? "Verifying..." : "Verify email"}
          </Button>
          <Button
            type="button"
            variant="ghost"
            onClick={resend}
            disabled={cooldown > 0}
          >
            {cooldown > 0 ? `Resend code in ${cooldown}s` : "Resend code"}
          </Button>
        </Field>
      </FieldGroup>
    </form>
  );
}
