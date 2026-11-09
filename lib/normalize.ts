import NepaliDate from "nepali-date-converter";
import type { RawBill } from "@/schemas/extract";

export type NormalizedItem = {
  name: string;
  qty: number | null;
  rate: number | null;
  amount: number | null;
};

export type NormalizedBill = {
  vendorName: string | null;
  vendorPan: string | null;
  billNumber: string | null;
  billDateBs: string | null;
  billDateAd: Date | null;
  subtotal: number | null;
  vat: number | null;
  total: number | null;
  items: NormalizedItem[];
};

const DIGITS: Record<string, string> = {
  "०": "0",
  "१": "1",
  "२": "2",
  "३": "3",
  "४": "4",
  "५": "5",
  "६": "6",
  "७": "7",
  "८": "8",
  "९": "9",
};

export const toEnglishDigits = (s: string) =>
  s.replace(/[०-९]/g, (d) => DIGITS[d]);

export function parseAmount(s: string | null): number | null {
  if (!s) return null;
  const cleaned = toEnglishDigits(s).replace(/[^\d.\-]/g, ""); // drops Rs., रु, commas
  if (!cleaned) return null;
  const n = Number(cleaned);
  return Number.isFinite(n) ? n : null;
}

export function normalizePan(s: string | null): string | null {
  if (!s) return null;
  const digits = toEnglishDigits(s).replace(/\D/g, "");
  return digits.length === 9 ? digits : null; // Nepali PAN/VAT numbers are 9 digits
}

export function normalizeDate(s: string | null) {
  if (!s) return { bs: null, ad: null };
  const m = toEnglishDigits(s).match(/(\d{4})\D+(\d{1,2})\D+(\d{1,2})/);
  if (!m) return { bs: null, ad: null };

  const [y, mo, d] = [Number(m[1]), Number(m[2]), Number(m[3])];
  const pad = (n: number) => String(n).padStart(2, "0");

  try {
    if (y >= 2060) {
      // BS year (currently ~2083)
      const ad = new NepaliDate(y, mo - 1, d).toJsDate(); // month is 0-indexed
      return { bs: `${y}-${pad(mo)}-${pad(d)}`, ad };
    }
    // AD date
    const ad = new Date(Date.UTC(y, mo - 1, d));
    const bs = new NepaliDate(ad);
    return { bs: bs.format("YYYY-MM-DD"), ad };
  } catch {
    return { bs: null, ad: null };
  }
}

export function normalizeBill(raw: RawBill): {
  bill: NormalizedBill;
  warnings: string[];
} {
  const { bs, ad } = normalizeDate(raw.bill_date);

  const items: NormalizedItem[] = raw.items.map((i) => ({
    name: i.name,
    qty: parseAmount(i.qty),
    rate: parseAmount(i.rate),
    amount: parseAmount(i.amount),
  }));

  const bill: NormalizedBill = {
    vendorName: raw.vendor_name,
    vendorPan: normalizePan(raw.vendor_pan),
    billNumber: raw.bill_number ? toEnglishDigits(raw.bill_number) : null,
    billDateBs: bs,
    billDateAd: ad,
    subtotal: parseAmount(raw.subtotal),
    vat: parseAmount(raw.vat),
    total: parseAmount(raw.total),
    items,
  };

  return { bill, warnings: checkBill(raw, bill) };
}

function checkBill(raw: RawBill, b: NormalizedBill): string[] {
  const w: string[] = [];
  if (!b.vendorName) w.push("Vendor name missing");
  if (raw.vendor_pan && !b.vendorPan) w.push("PAN is not 9 digits");
  if (raw.bill_date && !b.billDateAd) w.push("Date could not be read");
  if (b.total == null) w.push("Total missing");

  if (b.subtotal != null && b.vat != null && b.total != null) {
    if (Math.abs(b.subtotal + b.vat - b.total) > 1)
      w.push("Subtotal + VAT ≠ total");
  }
  const itemSum = b.items.reduce((s, i) => s + (i.amount ?? 0), 0);
  const base = b.subtotal ?? b.total;
  if (b.items.length && base != null && Math.abs(itemSum - base) > 1) {
    w.push("Item amounts don't add up");
  }
  return w;
}
