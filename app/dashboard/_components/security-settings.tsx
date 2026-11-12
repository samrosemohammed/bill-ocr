import { ChangePassword } from "./change-password";
import { TwoFactorSettings } from "./two-factor-settings";

export function SecuritySettings() {
  return (
    <div className="space-y-8">
      <ChangePassword />
      <div className="border-t" />
      <TwoFactorSettings />
    </div>
  );
}
