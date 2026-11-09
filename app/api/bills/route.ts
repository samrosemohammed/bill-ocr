import { NextRequest, NextResponse } from "next/server";
import { mkdir, writeFile, unlink } from "fs/promises";
import path from "path";
import { randomUUID } from "crypto";

import { extractBill } from "@/lib/extract";
import { normalizeBill } from "@/lib/normalize";
import { db } from "@/prisma/db";

const MAX_SIZE = 5 * 1024 * 1024;

const EXT_BY_MIME = {
  "image/jpeg": ".jpg",
  "image/png": ".png",
  "image/webp": ".webp",
} as const;

type AllowedMime = keyof typeof EXT_BY_MIME;

const isAllowed = (type: string): type is AllowedMime =>
  Object.hasOwn(EXT_BY_MIME, type);

const SIGNATURES: Record<AllowedMime, number[]> = {
  "image/jpeg": [0xff, 0xd8, 0xff],
  "image/png": [0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a],
  "image/webp": [0x52, 0x49, 0x46, 0x46],
};

const num = (n: number | null): string | null => {
  if (n === null) return null;

  if (!Number.isFinite(n) || n < 0) {
    throw new Error("Invalid numeric value");
  }

  return n.toFixed(2);
};

type Stage = "upload" | "storage" | "ocr" | "normalization" | "database";

export const POST = async (req: NextRequest) => {
  let filePath: string | null = null;
  let dbCommitted = false;
  let stage: Stage = "upload";

  try {
    // 1. Parse form data
    const formData = await req.formData();
    const file = formData.get("file");

    if (!(file instanceof File)) {
      return NextResponse.json({ error: "No file uploaded" }, { status: 400 });
    }

    // 2. Validate MIME
    if (!isAllowed(file.type)) {
      return NextResponse.json(
        { error: "Only JPEG, PNG and WEBP are allowed" },
        { status: 415 },
      );
    }

    // 3. Validate size
    if (file.size === 0) {
      return NextResponse.json(
        { error: "Uploaded file is empty" },
        { status: 400 },
      );
    }

    if (file.size > MAX_SIZE) {
      return NextResponse.json(
        { error: "Maximum file size is 5MB" },
        { status: 413 },
      );
    }

    // 4. Read file
    const buffer = Buffer.from(await file.arrayBuffer());

    if (buffer.length !== file.size) {
      return NextResponse.json(
        { error: "Invalid uploaded file" },
        { status: 400 },
      );
    }

    // 5. Verify image signature
    const signature = SIGNATURES[file.type];

    const validSignature = signature.every(
      (byte, index) => buffer[index] === byte,
    );

    if (!validSignature) {
      return NextResponse.json(
        { error: "Invalid image content" },
        { status: 400 },
      );
    }

    // WEBP additional check
    if (
      file.type === "image/webp" &&
      buffer.toString("ascii", 8, 12) !== "WEBP"
    ) {
      return NextResponse.json(
        { error: "Invalid WEBP image" },
        { status: 400 },
      );
    }

    // 6. Generate filename
    const fileName = `${Date.now()}-${randomUUID()}${EXT_BY_MIME[file.type]}`;

    const uploadDir = path.join(process.cwd(), "public", "upload-file");

    filePath = path.join(uploadDir, fileName);

    // 7. Save image
    stage = "storage";

    await mkdir(uploadDir, { recursive: true });
    await writeFile(filePath, buffer, { flag: "wx" });

    const url = `/upload-file/${fileName}`;

    // 8. Extract raw bill
    stage = "ocr";

    const raw = await extractBill(buffer, file.type);

    // 9. Normalize and validate bill
    stage = "normalization";

    const { bill, warnings } = normalizeBill(raw);

    // 10. Save bill and items
    stage = "database";

    const saved = await db.orm.public.Bill.create({
      imageUrl: url,
      vendorName: bill.vendorName,
      vendorPan: bill.vendorPan,
      billNumber: bill.billNumber,
      billDateBs: bill.billDateBs,
      billDateAd: bill.billDateAd,
      subTotal: num(bill.subtotal),
      vat: num(bill.vat),
      total: num(bill.total),
      rawOcrText: JSON.stringify(raw),

      items: (items) =>
        items.create(
          bill.items.map((item) => ({
            itemName: item.name,
            quantity: num(item.qty),
            unitPrice: num(item.rate),
            totalPrice: num(item.amount),
          })),
        ),
    });

    dbCommitted = true;

    // 11. Return response
    return NextResponse.json(
      {
        success: true,
        id: saved.id,
        url,
        bill: saved,
        warnings,
        needsReview: warnings.length > 0,
      },
      { status: 201 },
    );
  } catch (error) {
    console.error(`Bill upload failed at ${stage}:`, error);

    // 12. Cleanup on failure
    if (filePath && !dbCommitted) {
      await unlink(filePath).catch((cleanupError) => {
        console.error("File cleanup failed:", cleanupError);
      });
    }

    const messages: Record<Stage, string> = {
      upload: "Could not process uploaded file",
      storage: "Could not store uploaded file",
      ocr: "Could not extract bill information",
      normalization: "Could not normalize bill information",
      database: "Could not save bill",
    };

    const status =
      stage === "database" || stage === "storage"
        ? 500
        : stage === "upload"
          ? 400
          : 422;

    return NextResponse.json(
      {
        success: false,
        error: messages[stage],
      },
      { status },
    );
  }
};
