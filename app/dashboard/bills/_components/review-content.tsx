"use client";

import Link from "next/link";
import { useQuery } from "@tanstack/react-query";
import { Skeleton } from "@/components/ui/skeleton";

import type { ReviewInput } from "@/schemas/review";
import ReviewForm from "./review-form";

type Bill = {
  id: number;
  status: "PENDING_REVIEW" | "CONFIRMED";
  imageUrl: string;
  vendorName: string | null;
  vendorPan: string | null;
  billNumber: string | null;
  billDateBs: string | null;
  subTotal: string | null;
  vat: string | null;
  total: string | null;
  items: {
    id: number;
    itemName: string;
    quantity: string | null;
    unitPrice: string | null;
    totalPrice: string | null;
  }[];
};

async function fetchBill(id: string): Promise<Bill> {
  const response = await fetch(`/api/bills/${id}`);
  const data = await response.json();

  if (!response.ok) {
    throw new Error(data.error ?? "Could not load bill");
  }

  return data.bill;
}

export default function ReviewContent({ id }: { id: string }) {
  const billQuery = useQuery({
    queryKey: ["bill", id],
    queryFn: () => fetchBill(id),
  });

  if (billQuery.isPending) {
    return (
      <div className="mx-auto max-w-6xl space-y-6 p-4">
        <Skeleton className="h-10 w-64" />
        <div className="grid gap-6 lg:grid-cols-2">
          <Skeleton className="h-[600px]" />
          <Skeleton className="h-[600px]" />
        </div>
      </div>
    );
  }

  if (billQuery.isError) {
    return (
      <div className="space-y-3 p-6 text-sm text-destructive">
        <p>{billQuery.error.message}</p>
        <Link href="/dashboard/bills" className="text-foreground underline">
          Back to bills
        </Link>
      </div>
    );
  }

  const bill = billQuery.data;

  if (bill.status === "CONFIRMED") {
    return (
      <div className="space-y-3 p-6">
        <p>This bill is already confirmed.</p>
        <Link href="/dashboard/bills" className="underline">
          Back to bills
        </Link>
      </div>
    );
  }

  const initial: ReviewInput = {
    vendorName: bill.vendorName ?? "",
    vendorPan: bill.vendorPan ?? "",
    billNumber: bill.billNumber ?? "",
    billDate: bill.billDateBs ?? "",
    subTotal: bill.subTotal ?? "",
    vat: bill.vat ?? "",
    total: bill.total ?? "",
    items: [...bill.items]
      .sort((a, b) => a.id - b.id)
      .map((item) => ({
        name: item.itemName,
        qty: item.quantity ?? "",
        rate: item.unitPrice ?? "",
        amount: item.totalPrice ?? "",
      })),
  };

  return <ReviewForm id={bill.id} imageUrl={bill.imageUrl} initial={initial} />;
}
