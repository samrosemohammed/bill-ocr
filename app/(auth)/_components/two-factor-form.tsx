"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Field, FieldGroup, FieldLabel } from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { authClient } from "@/lib/auth-client";

export function TwoFactorForm() {
  const router = useRouter();
  const [useBackup, setUseBackup] = useState(false);
  const [pending, setPending] = useState(false);
  const [error, setError] = useState("");

  const onSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError("");
    setPending(true);
    const fd = new FormData(e.currentTarget);
    const code = String(fd.get("code")).trim();
    const trustDevice = fd.get("trust") === "on";

    try {
      const { error } = useBackup
        ? await authClient.twoFactor.verifyBackupCode({ code, trustDevice })
        : await authClient.twoFactor.verifyTotp({ code, trustDevice });
      if (error) {
        setError(error.message || "That code didn't work. Please try again.");
        return;
      }
      router.push("/dashboard");
      router.refresh();
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
          <FieldLabel htmlFor="code">
            {useBackup ? "Backup code" : "6-digit code"}
          </FieldLabel>
          <Input
            id="code"
            name="code"
            autoComplete="one-time-code"
            inputMode={useBackup ? "text" : "numeric"}
            required
            autoFocus
          />
        </Field>

        <label className="flex items-center gap-2 text-sm">
          <input type="checkbox" name="trust" className="size-4" />
          Trust this device for 30 days
        </label>

        {error && (
          <p className="text-sm text-destructive" role="alert">
            {error}
          </p>
        )}

        <Field>
          <Button type="submit" disabled={pending}>
            {pending ? "Verifying..." : "Verify"}
          </Button>
          <Button
            type="button"
            variant="ghost"
            onClick={() => {
              setUseBackup(!useBackup);
              setError("");
            }}
          >
            {useBackup ? "Use authenticator app" : "Use a backup code"}
          </Button>
        </Field>
      </FieldGroup>
    </form>
  );
}
