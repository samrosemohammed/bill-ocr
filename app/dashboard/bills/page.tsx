import { Suspense } from "react";
import { BillContent } from "./_components/bill-content";

type SearchParams = {
  status?: string;
  page?: string;
  limit?: string;
};

function BillsSkeleton() {
  return (
    <div className="mx-auto max-w-6xl space-y-6 p-4 md:p-6 animate-pulse">
      <div className="h-10 w-48 rounded-md bg-muted" />

      <div className="h-12 w-64 rounded-md bg-muted" />

      <div className="rounded-lg border">
        <div className="h-20 border-b bg-muted/50" />
        <div className="space-y-4 p-4">
          {Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className="h-10 rounded bg-muted" />
          ))}
        </div>
      </div>
    </div>
  );
}

export default function BillsPage({
  searchParams,
}: {
  searchParams: Promise<SearchParams>;
}) {
  return (
    <Suspense fallback={<BillsSkeleton />}>
      <BillContent searchParams={searchParams} />
    </Suspense>
  );
}
