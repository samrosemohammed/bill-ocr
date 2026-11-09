import { z } from "zod";

const str = z.string().trim().nullable().catch(null);

export const RawBillSchema = z.object({
  vendor_name: str,
  vendor_pan: str,
  bill_number: str,
  bill_date: str, // exactly as printed, BS or AD
  items: z
    .array(
      z.object({
        name: z.string().trim().min(1),
        qty: str,
        rate: str,
        amount: str,
      }),
    )
    .catch([]),
  subtotal: str,
  vat: str,
  total: str,
});

export type RawBill = z.infer<typeof RawBillSchema>;
