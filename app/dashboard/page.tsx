import { Suspense } from "react";
import { DashboardContent } from "./_components/dashboard-content";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Dashboard",
  description: "View your bill activity, review progress, and recent uploads.",
};

const DashboardSkeleton = () => {
  return (
    <div className="mx-auto max-w-7xl space-y-8 p-4 md:p-8 animate-pulse">
      <div className="h-10 w-64 rounded bg-muted" />

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {Array.from({ length: 4 }).map((_, i) => (
          <div key={i} className="h-32 rounded-xl bg-muted" />
        ))}
      </div>

      <div className="h-80 rounded-xl bg-muted" />
    </div>
  );
};

export default function DashboardPage() {
  return (
    <Suspense fallback={<DashboardSkeleton />}>
      <DashboardContent />
    </Suspense>
  );
}
