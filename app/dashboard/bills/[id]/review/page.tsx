import Link from "next/link";
import { notFound } from "next/navigation";
import { db } from "@/prisma/db";
import type { ReviewInput } from "@/schemas/review";
import ReviewForm from "../../_components/review-form";

export default async function ReviewPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const id = Number((await params).id);
  if (!Number.isInteger(id) || id < 1) notFound();

  const bill = await db.orm.public.Bill.include("items").where({ id }).first();
  if (!bill) notFound();

  if (bill.status === "CONFIRMED") {
    return (
      <div className="p-6">
        <p>This bill is already confirmed.</p>
        <Link href="/" className="underline">
          Back
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
      .map((i) => ({
        name: i.itemName,
        qty: i.quantity ?? "",
        rate: i.unitPrice ?? "",
        amount: i.totalPrice ?? "",
      })),
  };

  return <ReviewForm id={bill.id} imageUrl={bill.imageUrl} initial={initial} />;
}
