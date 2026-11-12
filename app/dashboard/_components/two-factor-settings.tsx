"use client";

import { useState } from "react";
import QRCode from "react-qr-code";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { PasswordInput } from "@/components/password-input";
import { authClient } from "@/lib/auth-client";

type Setup = { uri: string; codes: string[] };

function BackupCodes({ codes }: { codes: string[] }) {
  const [copied, setCopied] = useState(false);

  const copy = async () => {
    try {
      await navigator.clipboard.writeText(codes.join("\n"));
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      /* clipboard blocked: the codes are still on screen */
    }
  };

  return (
    <div className="space-y-2">
      <p className="text-sm font-medium">Backup codes</p>
      <p className="text-xs text-muted-foreground">
        Save these somewhere safe. Each code works once if you lose your phone.
      </p>

      <div className="grid grid-cols-2 gap-1 rounded-md bg-muted p-3 font-mono text-sm">
        {codes.map((c) => (
          <span key={c}>{c}</span>
        ))}
      </div>

      <Button type="button" variant="outline" size="sm" onClick={copy}>
        {copied ? "Copied" : "Copy codes"}
      </Button>
    </div>
  );
}

export function TwoFactorSettings() {
  const { data: session, refetch } = authClient.useSession();
  const enabled = !!session?.user.twoFactorEnabled;

  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [code, setCode] = useState("");
  const [setup, setSetup] = useState<Setup | null>(null);
  const [newCodes, setNewCodes] = useState<string[] | null>(null);
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);

  const clearPassword = () => {
    setPassword("");
    setShowPassword(false);
  };

  const run = async (fn: () => Promise<void>) => {
    setBusy(true);
    setError("");

    try {
      await fn();
    } catch {
      setError("Something went wrong. Please try again.");
    } finally {
      setBusy(false);
    }
  };

  // Step 1: Confirm password and generate QR code + backup codes
  const start = () =>
    run(async () => {
      const { data, error } = await authClient.twoFactor.enable({
        password,
      });

      if (error || !data || !("totpURI" in data)) {
        setError(error?.message ?? "Could not start setup.");
        return;
      }

      setSetup({
        uri: data.totpURI,
        codes: data.backupCodes,
      });

      clearPassword();
    });

  // Step 2: Verify authenticator code to activate 2FA
  const confirm = () =>
    run(async () => {
      const { error } = await authClient.twoFactor.verifyTotp({ code });

      if (error) {
        setError(error.message ?? "That code didn't work.");
        return;
      }

      setSetup(null);
      setCode("");
      await refetch();
    });

  // Disable 2FA
  const disable = () =>
    run(async () => {
      const { error } = await authClient.twoFactor.disable({
        password,
      });

      if (error) {
        setError(error.message ?? "Could not turn off 2FA.");
        return;
      }

      clearPassword();
      setNewCodes(null);
      await refetch();
    });

  // Generate new backup codes
  const regenerate = () =>
    run(async () => {
      const { data, error } = await authClient.twoFactor.generateBackupCodes({
        password,
      });

      if (error || !data) {
        setError(error?.message ?? "Could not create new codes.");
        return;
      }

      setNewCodes(data.backupCodes);
      clearPassword();
    });

  const submitWith = (fn: () => void) => (e: React.FormEvent) => {
    e.preventDefault();
    fn();
  };

  return (
    <section className="space-y-4">
      <div>
        <h3 className="font-medium">Two-factor authentication</h3>
        <p className="text-sm text-muted-foreground">
          {enabled
            ? "On. You'll enter a code from your authenticator app when you log in with email and password."
            : "Optional. Adds a code from an authenticator app to email-and-password logins."}
        </p>
      </div>

      {/* Setup, step 2: Scan QR code, save backup codes and confirm */}
      {setup && (
        <form onSubmit={submitWith(confirm)} className="space-y-4">
          <div className="flex justify-center rounded-md bg-white p-4">
            <QRCode value={setup.uri} size={160} />
          </div>

          <p className="text-sm text-muted-foreground">
            Scan this with Google Authenticator, Authy, or a similar app, then
            enter the 6-digit code.
          </p>

          <BackupCodes codes={setup.codes} />

          <Input
            value={code}
            onChange={(e) => setCode(e.target.value)}
            placeholder="6-digit code"
            inputMode="numeric"
            autoComplete="one-time-code"
            maxLength={6}
          />

          <Button type="submit" disabled={busy || code.trim().length < 6}>
            {busy ? "Verifying..." : "Turn on 2FA"}
          </Button>
        </form>
      )}

      {/* Setup, step 1: Ask for password */}
      {!setup && !enabled && (
        <form onSubmit={submitWith(start)} className="space-y-3">
          <PasswordInput
            value={password}
            onChange={setPassword}
            showPassword={showPassword}
            onToggle={() => setShowPassword((prev) => !prev)}
          />

          <Button type="submit" disabled={busy || !password}>
            {busy ? "Starting..." : "Set up 2FA"}
          </Button>

          <p className="text-xs text-muted-foreground">
            Accounts created only with GitHub or Google have no password here,
            and rely on that provider&apos;s own 2FA.
          </p>
        </form>
      )}

      {/* Already enabled: Manage 2FA */}
      {!setup && enabled && (
        <div className="space-y-3">
          <PasswordInput
            value={password}
            onChange={setPassword}
            showPassword={showPassword}
            onToggle={() => setShowPassword((prev) => !prev)}
          />

          <div className="flex gap-2">
            <Button
              type="button"
              variant="outline"
              onClick={regenerate}
              disabled={busy || !password}
            >
              New backup codes
            </Button>

            <Button
              type="button"
              variant="destructive"
              onClick={disable}
              disabled={busy || !password}
            >
              Turn off 2FA
            </Button>
          </div>

          {newCodes && <BackupCodes codes={newCodes} />}
        </div>
      )}

      {error && (
        <p className="text-sm text-destructive" role="alert">
          {error}
        </p>
      )}
    </section>
  );
}
