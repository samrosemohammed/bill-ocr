import { BillContent } from "./_components/bill-content";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Bills",
  description: "Manage uploaded, pending, and confirmed bill records.",
};

export default function BillsPage() {
  return (
    <Suspense>
      <BillContent />
    </Suspense>
  );
}
import { Suspense } from "react";
