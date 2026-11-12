"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { Button, buttonVariants } from "@/components/ui/button";
import { authClient } from "@/lib/auth-client";

export function UserMenu({ name }: { name: string }) {
  const router = useRouter();
  return (
    <div className="flex items-center gap-2">
      <span className="hidden text-sm text-muted-foreground sm:inline">
        {name}
      </span>
      <Link
        href="/settings/security"
        className={buttonVariants({ variant: "ghost", size: "sm" })}
      >
        Security
      </Link>
      <Button
        variant="outline"
        size="sm"
        onClick={() =>
          authClient.signOut({
            fetchOptions: { onSuccess: () => router.push("/login") },
          })
        }
      >
        Sign out
      </Button>
    </div>
  );
}
