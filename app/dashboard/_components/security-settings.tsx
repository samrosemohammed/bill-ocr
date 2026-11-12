"use client";

import { useState } from "react";
import QRCode from "react-qr-code";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { authClient } from "@/lib/auth-client";

type Setup = { uri: string; codes: string[] };

function Codes({ codes }: { codes: string[] }) {
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
    </div>
  );
}

export function SecuritySettings() {
  const { data: session, refetch } = authClient.useSession();
  const enabled = !!session?.user.twoFactorEnabled;

  const [password, setPassword] = useState("");
  const [code, setCode] = useState("");
  const [setup, setSetup] = useState<Setup | null>(null);
  const [newCodes, setNewCodes] = useState<string[] | null>(null);
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);

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

  const start = () =>
    run(async () => {
      const { data, error } = await authClient.twoFactor.enable({ password });
      if (error || !data || !("totpURI" in data)) {
        setError(error?.message ?? "Could not start setup.");
        return;
      }
      setSetup({ uri: data.totpURI, codes: data.backupCodes });
      setPassword("");
    });

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

  const disable = () =>
    run(async () => {
      const { error } = await authClient.twoFactor.disable({ password });
      if (error) {
        setError(error.message ?? "Could not turn off 2FA.");
        return;
      }
      setPassword("");
      setNewCodes(null);
      await refetch();
    });

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
      setPassword("");
    });

  return (
    <div className="space-y-4 rounded-lg border bg-card p-6">
      <div>
        <h2 className="font-medium">Two-factor authentication</h2>
        <p className="text-sm text-muted-foreground">
          {enabled
            ? "On. You'll enter a code from your authenticator app when you log in with email and password."
            : "Optional. Adds a code from an authenticator app to email-and-password logins."}
        </p>
      </div>

      {/* Step 2 of enabling: scan, save codes, confirm */}
      {setup && (
        <div className="space-y-4">
          <div className="flex justify-center rounded-md bg-white p-4">
            <QRCode value={setup.uri} size={160} />
          </div>
          <p className="text-sm text-muted-foreground">
            Scan this with Google Authenticator, Authy, or a similar app, then
            enter the 6-digit code.
          </p>
          <Codes codes={setup.codes} />
          <Input
            value={code}
            onChange={(e) => setCode(e.target.value)}
            placeholder="6-digit code"
            inputMode="numeric"
            autoComplete="one-time-code"
          />
          <Button onClick={confirm} disabled={busy || code.trim().length < 6}>
            {busy ? "Verifying..." : "Turn on 2FA"}
          </Button>
        </div>
      )}

      {/* Step 1: ask for password */}
      {!setup && !enabled && (
        <div className="space-y-3">
          <Input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="Your password"
            autoComplete="current-password"
          />
          <Button onClick={start} disabled={busy || !password}>
            {busy ? "Starting..." : "Set up 2FA"}
          </Button>
          <p className="text-xs text-muted-foreground">
            Accounts created only with GitHub or Google have no password here,
            and rely on that provider&apos;s own 2FA.
          </p>
        </div>
      )}

      {!setup && enabled && (
        <div className="space-y-3">
          <Input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="Your password"
            autoComplete="current-password"
          />
          <div className="flex gap-2">
            <Button
              variant="outline"
              onClick={regenerate}
              disabled={busy || !password}
            >
              New backup codes
            </Button>
            <Button
              variant="destructive"
              onClick={disable}
              disabled={busy || !password}
            >
              Turn off 2FA
            </Button>
          </div>
          {newCodes && <Codes codes={newCodes} />}
        </div>
      )}

      {error && (
        <p className="text-sm text-destructive" role="alert">
          {error}
        </p>
      )}
    </div>
  );
}
