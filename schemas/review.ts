import { z } from "zod";

const short = z.string().max(50);

export const ReviewSchema = z.object({
  vendorName: z.string().max(300),
  vendorPan: short,
  billNumber: short,
  billDate: short,
  subTotal: short,
  vat: short,
  total: short,
  items: z
    .array(
      z.object({
        name: z.string().max(300),
        qty: short,
        rate: short,
        amount: short,
      }),
    )
    .max(200),
});

export type ReviewInput = z.infer<typeof ReviewSchema>;
