import { z } from "zod";

export const RawBillSchema = z.object({
  vendor_name: z.string().nullable(),
  vendor_pan: z.string().nullable(),
  bill_number: z.string().nullable(),
  bill_date: z.string().nullable(),
  subtotal: z.string().nullable(),
  vat: z.string().nullable(),
  total: z.string().nullable(),

  items: z.array(
    z.object({
      name: z.string(),
      qty: z.string().nullable(),
      rate: z.string().nullable(),
      amount: z.string().nullable(),
    }),
  ),
});

export type RawBill = z.infer<typeof RawBillSchema>;
