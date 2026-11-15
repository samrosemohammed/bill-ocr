import type { Metadata } from "next";
import { Suspense } from "react";

import ReviewContent from "../../_components/review-content";
import { ReviewSkeleton } from "../../_components/review-skeleton";

export const metadata: Metadata = {
  title: "Review bill",
  description: "Review and confirm the extracted details for a bill.",
};

export default function ReviewPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  return (
    <Suspense fallback={<ReviewSkeleton />}>
      <Review params={params} />
    </Suspense>
  );
}

// Reads the URL data inside the Suspense boundary
async function Review({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  return <ReviewContent id={id} />;
}
