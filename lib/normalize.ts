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

export const toEnglishDigits = (value: string): string =>
  value.replace(/[०-९]/g, (digit) => DIGITS[digit]);

// Parse amounts such as:
// Rs. 1,500.00
// रु १५००
// 1500
// -500
export function parseAmount(value: string | null): number | null {
  if (!value?.trim()) return null;

  const cleaned = toEnglishDigits(value)
    .replace(/,/g, "")
    .replace(/Rs\.?|रु\.?|रु/g, "")
    .replace(/\s/g, "")
    .trim();

  if (!cleaned || !/^-?(?:\d+\.?\d*|\.\d+)$/.test(cleaned)) {
    return null;
  }

  const number = Number(cleaned);

  return Number.isFinite(number) ? number : null;
}

// Nepali PAN/VAT registration number
export function normalizePan(value: string | null): string | null {
  if (!value?.trim()) return null;

  const digits = toEnglishDigits(value).replace(/\D/g, "");

  return digits.length === 9 ? digits : null;
}

const pad = (value: number) => String(value).padStart(2, "0");

export function normalizeDate(value: string | null): {
  bs: string | null;
  ad: Date | null;
} {
  if (!value?.trim()) {
    return { bs: null, ad: null };
  }

  const normalized = toEnglishDigits(value);

  // Supports YYYY-MM-DD, YYYY/MM/DD, etc.
  const match = normalized.match(
    /^\s*(\d{4})[-/.]\s*(\d{1,2})[-/.]\s*(\d{1,2})\s*$/,
  );

  if (!match) {
    return { bs: null, ad: null };
  }

  const year = Number(match[1]);
  const month = Number(match[2]);
  const day = Number(match[3]);

  try {
    if (year >= 2060 && year <= 2099) {
      // BS date
      if (month < 1 || month > 12 || day < 1 || day > 32) {
        return { bs: null, ad: null };
      }

      const local = new NepaliDate(year, month - 1, day).toJsDate();
      if (Number.isNaN(local.getTime())) return { bs: null, ad: null };

      // Round-trip check prevents silently accepting invalid BS dates
      const bs = `${year}-${pad(month)}-${pad(day)}`;
      if (new NepaliDate(local).format("YYYY-MM-DD") !== bs) {
        return { bs: null, ad: null };
      }
      // Store the calendar day as UTC midnight so it never shifts with timezone
      const ad = new Date(
        Date.UTC(local.getFullYear(), local.getMonth(), local.getDate()),
      );
      return { bs, ad };
    }

    if (year >= 1990 && year <= 2059) {
      // AD date
      const ad = new Date(Date.UTC(year, month - 1, day));

      // Prevent JS from normalizing invalid dates.
      if (
        ad.getUTCFullYear() !== year ||
        ad.getUTCMonth() !== month - 1 ||
        ad.getUTCDate() !== day
      ) {
        return { bs: null, ad: null };
      }

      const bs = new NepaliDate(new Date(year, month - 1, day)).format(
        "YYYY-MM-DD",
      );
      return { bs, ad };
    }
  } catch {
    // Invalid date or conversion failure
  }

  return { bs: null, ad: null };
}

const moneyEquals = (a: number, b: number, tolerance = 1) =>
  Math.abs(a - b) <= tolerance;

export function normalizeBill(raw: RawBill): {
  bill: NormalizedBill;
  warnings: string[];
} {
  const { bs, ad } = normalizeDate(raw.bill_date);

  const rawItems = Array.isArray(raw.items) ? raw.items : [];

  const items: NormalizedItem[] = rawItems.map((item) => ({
    name: String(item.name ?? "").trim(),
    qty: parseAmount(item.qty),
    rate: parseAmount(item.rate),
    amount: parseAmount(item.amount),
  }));

  const bill: NormalizedBill = {
    vendorName: raw.vendor_name?.trim() || null,
    vendorPan: normalizePan(raw.vendor_pan),
    billNumber: raw.bill_number
      ? toEnglishDigits(raw.bill_number).trim() || null
      : null,
    billDateBs: bs,
    billDateAd: ad,
    subtotal: parseAmount(raw.subtotal),
    vat: parseAmount(raw.vat),
    total: parseAmount(raw.total),
    items,
  };

  return {
    bill,
    warnings: checkBill(raw, bill),
  };
}

function checkBill(raw: RawBill, bill: NormalizedBill): string[] {
  const warnings: string[] = [];

  // Required information
  if (!bill.vendorName) {
    warnings.push("Vendor name missing");
  }

  if (!bill.total && bill.total !== 0) {
    warnings.push("Total missing");
  }

  if (raw.vendor_pan && !bill.vendorPan) {
    warnings.push("PAN is invalid (expected 9 digits)");
  }

  if (raw.bill_date && !bill.billDateAd) {
    warnings.push("Bill date could not be validated");
  }

  if (raw.subtotal && bill.subtotal === null) {
    warnings.push("Subtotal could not be parsed");
  }

  if (raw.vat && bill.vat === null) {
    warnings.push("VAT could not be parsed");
  }

  if (raw.total && bill.total === null) {
    warnings.push("Total could not be parsed");
  }

  // Negative amount checks
  if (
    [bill.subtotal, bill.vat, bill.total].some(
      (amount) => amount !== null && amount < 0,
    )
  ) {
    warnings.push("Negative bill amount detected");
  }

  // Subtotal + VAT = Total
  if (
    bill.subtotal !== null &&
    bill.vat !== null &&
    bill.total !== null &&
    !moneyEquals(bill.subtotal + bill.vat, bill.total)
  ) {
    warnings.push("Subtotal + VAT does not equal total");
  }

  // Item validation
  if (!bill.items.length) {
    warnings.push("No bill items detected");
  }

  bill.items.forEach((item, index) => {
    if (!item.name) {
      warnings.push(`Item ${index + 1}: Name missing`);
    }

    if (
      [item.qty, item.rate, item.amount].some(
        (value) => value !== null && value < 0,
      )
    ) {
      warnings.push(`Item ${index + 1}: Negative value detected`);
    }
  });

  // Compare item sum only when every item amount is available.
  const allAmountsAvailable =
    bill.items.length > 0 && bill.items.every((item) => item.amount !== null);

  if (allAmountsAvailable && bill.subtotal !== null) {
    const itemSum = bill.items.reduce((sum, item) => sum + item.amount!, 0);

    if (!moneyEquals(itemSum, bill.subtotal)) {
      warnings.push("Item amounts do not add up to subtotal");
    }
  }

  return warnings;
}
