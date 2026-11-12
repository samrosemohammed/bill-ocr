import Link from "next/link";
import { requireUser } from "@/lib/session";
import { SecuritySettings } from "../../_components/security-settings";

export default async function SecurityPage() {
  await requireUser();
  return (
    <main className="mx-auto max-w-lg space-y-6 p-4">
      <div className="flex items-center justify-between">
        <h1 className="text-xl font-semibold">Security</h1>
        <Link href="/" className="text-sm underline">
          Back to app
        </Link>
      </div>
      <SecuritySettings />
    </main>
  );
}
