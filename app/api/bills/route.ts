import { NextRequest, NextResponse } from "next/server";
import { mkdir, writeFile, unlink } from "fs/promises";
import path from "path";
import { extractBill } from "@/lib/extract";
import { normalizeBill } from "@/lib/normalize";
import { db } from "@/prisma/db";

const MAX_SIZE = 5 * 1024 * 1024; // 5MB

const EXT_BY_MIME = {
  "image/jpeg": ".jpg",
  "image/png": ".png",
  "image/webp": ".webp",
} as const;

type AllowedMime = keyof typeof EXT_BY_MIME;
const isAllowed = (t: string): t is AllowedMime => t in EXT_BY_MIME;

// NumericString columns take strings, e.g. "4800.00"
const num = (n: number | null) => (n == null ? null : n.toFixed(2));

export const POST = async (req: NextRequest) => {
  const formData = await req.formData();
  const file = formData.get("file");

  if (!(file instanceof File)) {
    return NextResponse.json({ error: "No file uploaded" }, { status: 400 });
  }
  if (!isAllowed(file.type)) {
    return NextResponse.json({ error: "Invalid file type" }, { status: 400 });
  }
  if (file.size > MAX_SIZE) {
    return NextResponse.json({ error: "File too large" }, { status: 400 });
  }

  const buffer = Buffer.from(await file.arrayBuffer());
  const fileName = `${Date.now()}-${crypto.randomUUID()}${EXT_BY_MIME[file.type]}`;

  const uploadDir = path.join(process.cwd(), "public", "upload-file");
  const filePath = path.join(uploadDir, fileName);
  await mkdir(uploadDir, { recursive: true });
  await writeFile(filePath, buffer);

  const url = `/upload-file/${fileName}`;

  try {
    const raw = await extractBill(buffer, file.type);
    const { bill, warnings } = normalizeBill(raw);

    const saved = await db.orm.public.Bill.create({
      imageUrl: url,
      vendorName: bill.vendorName, // with Option 2: bill.vendorName ?? ""
      vendorPan: bill.vendorPan, // with Option 2: bill.vendorPan ?? ""
      billDateBs: bill.billDateBs,
      billDateAd: bill.billDateAd,
      subTotal: num(bill.subtotal),
      vat: num(bill.vat),
      total: num(bill.total),
      rawOcrText: JSON.stringify(raw),
      // Nested create on the side without the foreign key: billId is filled in for you
      items: (items) =>
        items.create(
          bill.items.map((i) => ({
            itemName: i.name,
            quantity: num(i.qty),
            unitPrice: num(i.rate),
            totalPrice: num(i.amount),
          })),
        ),
    });

    return NextResponse.json({ id: saved.id, url, warnings });
  } catch (err) {
    console.error(err);
    await unlink(filePath).catch(() => {});
    return NextResponse.json(
      { error: "Could not read this bill" },
      { status: 422 },
    );
  }
};
