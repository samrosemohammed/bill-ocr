import { NextRequest, NextResponse } from "next/server";
import { and, all } from "@prisma/orm-postgres/orm-client";
import { db } from "@/prisma/db";

const DAY = /^\d{4}-\d{2}-\d{2}$/;

// null = not provided, "invalid" = provided but malformed
const parseDay = (s: string | null): Date | null | "invalid" => {
  if (!s) return null;
  if (!DAY.test(s)) return "invalid";
  const d = new Date(`${s}T00:00:00Z`);
  return Number.isNaN(d.getTime()) ? "invalid" : d;
};

// Quote cells, and defuse spreadsheet formulas (=, +, -, @) in text from bills
const cell = (v: string | number | null | undefined): string => {
  if (v === null || v === undefined) return "";
  let s = String(v);
  if (/^[=+\-@\t\r]/.test(s)) s = `'${s}`;
  return /[",\r\n]/.test(s) ? `"${s.replace(/"/g, '""')}"` : s;
};

const row = (cells: (string | number | null | undefined)[]) =>
  cells.map(cell).join(",");

const day = (d: Date | null) => (d ? d.toISOString().slice(0, 10) : "");

export const GET = async (req: NextRequest) => {
  const sp = req.nextUrl.searchParams;
  const type = sp.get("type") === "items" ? "items" : "bills";

  const from = parseDay(sp.get("from"));
  const to = parseDay(sp.get("to"));
  if (from === "invalid" || to === "invalid") {
    return NextResponse.json(
      { error: "Dates must look like 2026-11-08" },
      { status: 400 },
    );
  }
  if (from && to && from > to) {
    return NextResponse.json(
      { error: "'From' date is after 'to' date" },
      { status: 400 },
    );
  }

  const bills = await db.orm.public.Bill.include("items")
    .where({ status: "CONFIRMED" })
    .where((b) =>
      and(
        from ? b.billDateAd.gte(from) : all(),
        to ? b.billDateAd.lte(to) : all(),
      ),
    )
    .orderBy([(b) => b.billDateAd.asc(), (b) => b.id.asc()])
    .all();

  const lines: string[] = [];

  if (type === "bills") {
    lines.push(
      row([
        "bill_id",
        "bill_number",
        "vendor_name",
        "vendor_pan",
        "bill_date_bs",
        "bill_date_ad",
        "subtotal",
        "vat",
        "total",
        "item_count",
      ]),
    );
    for (const b of bills) {
      lines.push(
        row([
          b.id,
          b.billNumber,
          b.vendorName,
          b.vendorPan,
          b.billDateBs,
          day(b.billDateAd),
          b.subTotal,
          b.vat,
          b.total,
          b.items.length,
        ]),
      );
    }
  } else {
    lines.push(
      row([
        "bill_id",
        "bill_number",
        "vendor_name",
        "vendor_pan",
        "bill_date_bs",
        "bill_date_ad",
        "item_name",
        "quantity",
        "unit_price",
        "total_price",
      ]),
    );
    for (const b of bills) {
      for (const i of [...b.items].sort((x, y) => x.id - y.id)) {
        lines.push(
          row([
            b.id,
            b.billNumber,
            b.vendorName,
            b.vendorPan,
            b.billDateBs,
            day(b.billDateAd),
            i.itemName,
            i.quantity,
            i.unitPrice,
            i.totalPrice,
          ]),
        );
      }
    }
  }

  // BOM so Excel reads Nepali (UTF-8) text correctly
  const body = "\uFEFF" + lines.join("\r\n") + "\r\n";
  const stamp = new Date().toISOString().slice(0, 10);

  return new NextResponse(body, {
    headers: {
      "Content-Type": "text/csv; charset=utf-8",
      "Content-Disposition": `attachment; filename="bills-${type}-${stamp}.csv"`,
      "Cache-Control": "no-store",
    },
  });
};
