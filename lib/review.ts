import {
  normalizeDate,
  normalizePan,
  parseAmount,
  toEnglishDigits,
  type NormalizedBill,
  type NormalizedItem,
} from "@/lib/normalize";
import type { ReviewInput } from "@/schemas/review";

const MAX_AMOUNT = 9_999_999_999.99; // numeric(12,2)
const near = (a: number, b: number) => Math.abs(a - b) <= 1;

export const toNumeric = (n: number | null): string | null =>
  n === null ? null : n.toFixed(2);

export function parseReviewForm(f: ReviewInput): {
  bill: NormalizedBill;
  errors: string[]; // block confirming
  warnings: string[]; // shown, but confirming is allowed
} {
  const errors: string[] = [];
  const warnings: string[] = [];

  const amount = (label: string, text: string): number | null => {
    if (!text.trim()) return null;
    const n = parseAmount(text);
    if (n === null) {
      errors.push(`${label} is not a valid number`);
      return null;
    }
    if (n < 0 || n > MAX_AMOUNT) {
      errors.push(`${label} is out of range`);
      return null;
    }
    return n;
  };

  const vendorName = f.vendorName.trim() || null;
  if (!vendorName) errors.push("Vendor name is required");

  let vendorPan: string | null = null;
  if (f.vendorPan.trim()) {
    vendorPan = normalizePan(f.vendorPan);
    if (!vendorPan) errors.push("PAN must be 9 digits");
  } else {
    warnings.push("PAN is missing");
  }

  let billDateBs: string | null = null;
  let billDateAd: Date | null = null;
  if (f.billDate.trim()) {
    const d = normalizeDate(f.billDate);
    if (!d.ad) errors.push("Date is not valid. Use BS, like 2083-07-22");
    billDateBs = d.bs;
    billDateAd = d.ad;
  } else {
    warnings.push("Date is missing");
  }

  const subtotal = amount("Subtotal", f.subTotal);
  const vat = amount("VAT", f.vat);
  const total = amount("Total", f.total);
  if (!f.total.trim()) errors.push("Total is required");

  const items: NormalizedItem[] = [];
  f.items.forEach((row, i) => {
    const isEmpty =
      !row.name.trim() &&
      !row.qty.trim() &&
      !row.rate.trim() &&
      !row.amount.trim();
    if (isEmpty) return; // ignore blank rows

    const n = i + 1;
    const name = row.name.trim();
    if (!name) errors.push(`Item ${n}: name is required`);

    const qty = amount(`Item ${n} quantity`, row.qty);
    const rate = amount(`Item ${n} rate`, row.rate);
    const amt = amount(`Item ${n} amount`, row.amount);

    if (
      qty !== null &&
      rate !== null &&
      amt !== null &&
      !near(qty * rate, amt)
    ) {
      warnings.push(`Item ${n}: quantity × rate ≠ amount`);
    }
    items.push({ name, qty, rate, amount: amt });
  });

  if (
    subtotal !== null &&
    vat !== null &&
    total !== null &&
    !near(subtotal + vat, total)
  ) {
    warnings.push("Subtotal + VAT ≠ total");
  }

  if (!items.length) {
    warnings.push("No items entered");
  } else if (items.every((i) => i.amount !== null)) {
    const base =
      subtotal ?? (vat !== null && total !== null ? total - vat : total);
    const sum = items.reduce((s, i) => s + i.amount!, 0);
    if (base !== null && !near(sum, base)) {
      warnings.push("Item amounts don't add up to the subtotal");
    }
  }

  return {
    bill: {
      vendorName,
      vendorPan,
      billNumber: toEnglishDigits(f.billNumber).trim() || null,
      billDateBs,
      billDateAd,
      subtotal,
      vat,
      total,
      items,
    },
    errors,
    warnings,
  };
}
