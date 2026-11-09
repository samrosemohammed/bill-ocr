import { GoogleGenAI } from "@google/genai";
import { RawBillSchema, type RawBill } from "@/schemas/extract";

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY! });

const PROMPT = `You read Nepali and English paper bills/invoices.
Return ONLY a JSON object, no markdown, with exactly these keys:
vendor_name, vendor_pan, bill_number, bill_date, items, subtotal, vat, total.
items is an array of { name, qty, rate, amount }.

Rules:
- Copy values exactly as printed. Do NOT convert numerals or dates; keep Nepali digits and BS dates as written.
- All values are strings, except items which is an array.
- If a field is missing or unreadable, use null. Never guess.
- vendor_pan is the PAN/VAT number of the seller issuing the bill.
- Keep item names in the original language.`;

export async function extractBill(
  buffer: Buffer,
  mimeType: string,
): Promise<RawBill> {
  const res = await ai.models.generateContent({
    model: process.env.GEMINI_MODEL!,
    contents: [
      {
        role: "user",
        parts: [
          { inlineData: { mimeType, data: buffer.toString("base64") } },
          { text: PROMPT },
        ],
      },
    ],
    config: { responseMimeType: "application/json" },
  });

  const text = res.text ?? "";
  const start = text.indexOf("{");
  const end = text.lastIndexOf("}");
  if (start === -1 || end === -1) throw new Error("Model returned no JSON");

  const parsed = RawBillSchema.safeParse(
    JSON.parse(text.slice(start, end + 1)),
  );
  if (!parsed.success) throw new Error("Extraction failed validation");
  return parsed.data;
}
