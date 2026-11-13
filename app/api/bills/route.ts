import { NextRequest, NextResponse } from "next/server";
import { randomUUID } from "crypto";
import { UTApi, UTFile } from "uploadthing/server";

import { extractBill } from "@/lib/extract";
import { normalizeBill } from "@/lib/normalize";
import { db } from "@/prisma/db";
import { getSession } from "@/lib/session";

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

const PAGE_SIZES = [10, 20, 50, 100];
const DEFAULT_PAGE_SIZE = 20;

export const GET = async (req: NextRequest) => {
  const session = await getSession();
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const params = req.nextUrl.searchParams;
  const status = params.get("status") === "confirmed" ? "CONFIRMED" : "PENDING_REVIEW";
  const requestedLimit = Number.parseInt(params.get("limit") ?? "", 10);
  const limit = PAGE_SIZES.includes(requestedLimit)
    ? requestedLimit
    : DEFAULT_PAGE_SIZE;

  const [pending, confirmed] = await Promise.all([
    db.orm.public.Bill.where({
      userId: session.user.id,
      status: "PENDING_REVIEW",
    }).aggregate((bill) => ({ count: bill.count() })),
    db.orm.public.Bill.where({
      userId: session.user.id,
      status: "CONFIRMED",
    }).aggregate((bill) => ({ count: bill.count() })),
  ]);

  const total = status === "CONFIRMED" ? confirmed.count : pending.count;
  const totalPages = Math.max(1, Math.ceil(total / limit));
  const requestedPage = Number.parseInt(params.get("page") ?? "1", 10);
  const page = Math.min(
    Math.max(Number.isFinite(requestedPage) ? requestedPage : 1, 1),
    totalPages,
  );

  const bills = await db.orm.public.Bill.where({
    userId: session.user.id,
    status,
  })
    .orderBy([(bill) => bill.createdAt.desc(), (bill) => bill.id.desc()])
    .limit(limit)
    .offset((page - 1) * limit)
    .all();

  return NextResponse.json({
    pending: pending.count,
    confirmed: confirmed.count,
    page,
    limit,
    total,
    totalPages,
    bills,
  });
};

export const POST = async (req: NextRequest) => {
  const session = await getSession();
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const utapi = new UTApi();
  let uploadedFileKey: string | null = null;
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

    // 7. Save image to UploadThing
    stage = "storage";

    const uploadResult = await utapi.uploadFiles(
      new UTFile([buffer], fileName, { type: file.type }),
    );

    if (uploadResult.error) {
      throw new Error(uploadResult.error.message);
    }

    uploadedFileKey = uploadResult.data.key;
    const url = uploadResult.data.ufsUrl;

    // 8. Extract raw bill
    stage = "ocr";

    const raw = await extractBill(buffer, file.type);

    // 9. Normalize and validate bill
    stage = "normalization";

    const { bill, warnings } = normalizeBill(raw);

    // 10. Save bill and items
    stage = "database";

    const saved = await db.orm.public.Bill.create({
      userId: session.user.id,
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
    if (uploadedFileKey && !dbCommitted) {
      await utapi.deleteFiles(uploadedFileKey).catch((cleanupError) => {
        console.error("UploadThing cleanup failed:", cleanupError);
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
