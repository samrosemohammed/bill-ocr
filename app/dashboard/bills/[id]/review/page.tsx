import type { Metadata } from "next";

import ReviewContent from "../../_components/review-content";

export const metadata: Metadata = {
  title: "Review bill",
  description: "Review and confirm the extracted details for a bill.",
};

export default async function ReviewPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  return <ReviewContent id={id} />;
}
