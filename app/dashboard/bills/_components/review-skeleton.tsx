import { Skeleton } from "@/components/ui/skeleton";

export function ReviewSkeleton() {
  return (
    <div className="@container mx-auto w-full max-w-6xl space-y-6 p-4 md:p-6">
      <Skeleton className="h-10 w-64" />
      <div className="grid gap-6 @4xl:grid-cols-2">
        <Skeleton className="h-64 @4xl:h-[600px]" />
        <Skeleton className="h-96 @4xl:h-[600px]" />
      </div>
    </div>
  );
}
