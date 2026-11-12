"use client";

import { useState } from "react";

import { Button } from "@/components/ui/button";
import {
  Field,
  FieldDescription,
  FieldGroup,
  FieldLabel,
} from "@/components/ui/field";
import { PasswordInput } from "@/components/password-input";
import { authClient } from "@/lib/auth-client";

export function ChangePassword() {
  const [pending, setPending] = useState(false);
  const [error, setError] = useState("");
  const [done, setDone] = useState(false);

  const [showCurrent, setShowCurrent] = useState(false);
  const [showNew, setShowNew] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);

  const onSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError("");
    setDone(false);

    // Read form values before awaiting
    const form = e.currentTarget;
    const fd = new FormData(form);

    const currentPassword = String(fd.get("current"));
    const newPassword = String(fd.get("new"));
    const confirm = String(fd.get("confirm"));

    if (newPassword.length < 8) {
      return setError("New password must be at least 8 characters.");
    }

    if (newPassword !== confirm) {
      return setError("New passwords do not match.");
    }

    if (newPassword === currentPassword) {
      return setError("New password must be different from the current one.");
    }

    setPending(true);

    try {
      const { error } = await authClient.changePassword({
        currentPassword,
        newPassword,
        revokeOtherSessions: true,
      });

      if (error) {
        setError(error.message || "Could not change your password.");
      } else {
        setDone(true);
        form.reset();

        // Reset password visibility
        setShowCurrent(false);
        setShowNew(false);
        setShowConfirm(false);
      }
    } catch {
      setError("Something went wrong. Please try again.");
    } finally {
      setPending(false);
    }
  };

  return (
    <section className="space-y-4">
      <div>
        <h3 className="font-medium">Password</h3>
        <p className="text-sm text-muted-foreground">
          Changing it signs you out of your other devices.
        </p>
      </div>

      <form onSubmit={onSubmit}>
        <FieldGroup>
          {/* Current password */}
          <Field>
            <FieldLabel htmlFor="current-password">Current password</FieldLabel>

            <PasswordInput
              name="current"
              id="current-password"
              value={undefined}
              onChange={() => {}}
              showPassword={showCurrent}
              onToggle={() => setShowCurrent((prev) => !prev)}
              required
              autoComplete="current-password"
            />
          </Field>

          {/* New password */}
          <Field>
            <FieldLabel htmlFor="new-password">New password</FieldLabel>

            <PasswordInput
              name="new"
              id="new-password"
              value={undefined}
              onChange={() => {}}
              showPassword={showNew}
              onToggle={() => setShowNew((prev) => !prev)}
              required
              minLength={8}
              autoComplete="new-password"
            />

            <FieldDescription>At least 8 characters.</FieldDescription>
          </Field>

          {/* Confirm password */}
          <Field>
            <FieldLabel htmlFor="confirm-password">
              Confirm new password
            </FieldLabel>

            <PasswordInput
              name="confirm"
              id="confirm-password"
              value={undefined}
              onChange={() => {}}
              showPassword={showConfirm}
              onToggle={() => setShowConfirm((prev) => !prev)}
              required
              autoComplete="new-password"
            />
          </Field>

          {/* Error and success messages */}
          {error && (
            <p className="text-sm text-destructive" role="alert">
              {error}
            </p>
          )}

          {done && (
            <p className="text-sm text-muted-foreground">Password changed.</p>
          )}

          <Field>
            <Button type="submit" disabled={pending}>
              {pending ? "Saving..." : "Change password"}
            </Button>
          </Field>
        </FieldGroup>
      </form>
    </section>
  );
}
