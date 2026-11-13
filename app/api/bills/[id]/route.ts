import { NextRequest, NextResponse } from "next/server";
import { db } from "@/prisma/db";
import { ReviewSchema } from "@/schemas/review";
import { parseReviewForm, toNumeric } from "@/lib/review";
import { getSession } from "@/lib/session";

class NotPendingError extends Error {}

export const GET = async (
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) => {
  const session = await getSession();
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const id = Number((await params).id);
  if (!Number.isInteger(id) || id < 1) {
    return NextResponse.json({ error: "Invalid bill id" }, { status: 400 });
  }

  const bill = await db.orm.public.Bill.include("items")
    .where({ id, userId: session.user.id })
    .first();

  if (!bill) {
    return NextResponse.json({ error: "Bill not found" }, { status: 404 });
  }

  return NextResponse.json({ bill });
};

export const PATCH = async (
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) => {
  const session = await getSession();
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const id = Number((await params).id);
  if (!Number.isInteger(id) || id < 1) {
    return NextResponse.json({ error: "Invalid bill id" }, { status: 400 });
  }

  const body = ReviewSchema.safeParse(await req.json().catch(() => null));
  if (!body.success) {
    return NextResponse.json({ error: "Invalid request" }, { status: 400 });
  }

  const { bill, errors } = parseReviewForm(body.data);
  if (errors.length) {
    return NextResponse.json({ error: errors[0], errors }, { status: 422 });
  }

  try {
    await db.transaction(async (tx) => {
      // Only a pending bill can be confirmed; this also stops double-confirming
      const updated = await tx.orm.public.Bill.where({
        id,
        userId: session.user.id,
        status: "PENDING_REVIEW",
      }).update({
        vendorName: bill.vendorName,
        vendorPan: bill.vendorPan,
        billNumber: bill.billNumber,
        billDateBs: bill.billDateBs,
        billDateAd: bill.billDateAd,
        subTotal: toNumeric(bill.subtotal),
        vat: toNumeric(bill.vat),
        total: toNumeric(bill.total),
        status: "CONFIRMED",
      });
      if (!updated) throw new NotPendingError();

      // Replace the items with what the reviewer sees
      await tx.orm.public.BillItem.where({ billId: id }).deleteAndCount();
      if (bill.items.length) {
        await tx.orm.public.BillItem.createAndCount(
          bill.items.map((i) => ({
            billId: id,
            itemName: i.name,
            quantity: toNumeric(i.qty),
            unitPrice: toNumeric(i.rate),
            totalPrice: toNumeric(i.amount),
          })),
        );
      }
    });

    return NextResponse.json({ success: true });
  } catch (err) {
    if (err instanceof NotPendingError) {
      return NextResponse.json(
        { error: "Bill not found or already confirmed" },
        { status: 409 },
      );
    }
    console.error("Confirm failed:", err);
    return NextResponse.json({ error: "Could not save bill" }, { status: 500 });
  }
};
