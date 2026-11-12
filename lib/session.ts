import { cache } from "react";
import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { auth } from "@/lib/auth";

export const getSession = cache(async () =>
  auth.api.getSession({ headers: await headers() }),
);

// For pages: redirects to login. For route handlers use getSession() and return 401.
export async function requireUser() {
  const session = await getSession();
  if (!session) redirect("/login");
  return session.user;
}
