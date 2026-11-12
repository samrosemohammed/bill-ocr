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
import type { MenuUser } from "@/components/user-menu";
import { authClient } from "@/lib/auth-client";

export function AccountSettings({ user }: { user: MenuUser }) {
  const router = useRouter();
  const [name, setName] = useState(user.name);
  const [pending, setPending] = useState(false);
  const [error, setError] = useState("");
  const [saved, setSaved] = useState(false);

  const trimmed = name.trim();
  const dirty = trimmed !== user.name;

  const save = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError("");
    setSaved(false);

    if (!trimmed || trimmed.length > 100) {
      return setError("Name must be between 1 and 100 characters.");
    }

    setPending(true);
    try {
      const { error } = await authClient.updateUser({ name: trimmed });
      if (error) {
        setError(error.message || "Could not update your name.");
      } else {
        setSaved(true);
        router.refresh(); // re-renders the layout so the menu shows the new name
      }
    } catch {
      setError("Something went wrong. Please try again.");
    } finally {
      setPending(false);
    }
  };

  return (
    <form onSubmit={save}>
      <FieldGroup>
        <Field>
          <FieldLabel htmlFor="settings-name">Name</FieldLabel>
          <Input
            id="settings-name"
            value={name}
            onChange={(e) => {
              setName(e.target.value);
              setSaved(false);
            }}
            autoComplete="name"
          />
        </Field>
        <Field>
          <FieldLabel htmlFor="settings-email">Email</FieldLabel>
          <Input id="settings-email" value={user.email} readOnly disabled />
          <FieldDescription>Email can&apos;t be changed yet.</FieldDescription>
        </Field>

        {error && (
          <p className="text-sm text-destructive" role="alert">
            {error}
          </p>
        )}
        {saved && <p className="text-sm text-muted-foreground">Saved.</p>}

        <Field>
          <Button type="submit" disabled={!dirty || pending}>
            {pending ? "Saving..." : "Save changes"}
          </Button>
        </Field>
      </FieldGroup>
    </form>
  );
}
