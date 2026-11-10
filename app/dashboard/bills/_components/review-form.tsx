"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { parseReviewForm } from "@/lib/review";
import type { ReviewInput } from "@/schemas/review";

const inputClass = "w-full rounded-md border px-3 py-2 text-sm";

type Item = ReviewInput["items"][number];
type TopField = Exclude<keyof ReviewInput, "items">;

function Field({
  label,
  children,
}: {
  label: string;
  children: React.ReactNode;
}) {
  return (
    <label className="block space-y-1">
      <span className="text-sm font-medium">{label}</span>
      {children}
    </label>
  );
}

export default function ReviewForm({
  id,
  imageUrl,
  initial,
}: {
  id: number;
  imageUrl: string;
  initial: ReviewInput;
}) {
  const router = useRouter();
  const [form, setForm] = useState<ReviewInput>(initial);
  const [saving, setSaving] = useState(false);
  const [serverError, setServerError] = useState<string | null>(null);

  const { errors, warnings } = useMemo(() => parseReviewForm(form), [form]);

  const setField = (key: TopField, value: string) =>
    setForm((f) => ({ ...f, [key]: value }));

  const setItem = (index: number, key: keyof Item, value: string) =>
    setForm((f) => ({
      ...f,
      items: f.items.map((it, i) =>
        i === index ? { ...it, [key]: value } : it,
      ),
    }));

  const addItem = () =>
    setForm((f) => ({
      ...f,
      items: [...f.items, { name: "", qty: "", rate: "", amount: "" }],
    }));

  const removeItem = (index: number) =>
    setForm((f) => ({ ...f, items: f.items.filter((_, i) => i !== index) }));

  const confirm = async () => {
    setSaving(true);
    setServerError(null);
    try {
      const res = await fetch(`/api/bills/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      const data = await res.json().catch(() => null);
      if (!res.ok) {
        setServerError(data?.error ?? "Could not confirm this bill");
        return;
      }
      router.push("/bills?tab=confirmed");
      router.refresh();
    } catch {
      setServerError("Network error. Please try again.");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="grid gap-6 p-4 md:grid-cols-2">
      {/* Left: the original bill */}
      <div className="md:sticky md:top-4 md:self-start">
        <div className="max-h-[calc(100vh-2rem)] overflow-auto rounded-md border">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={imageUrl} alt="Uploaded bill" className="w-full" />
        </div>
      </div>

      {/* Right: editable data */}
      <div className="space-y-4">
        <Field label="Vendor name">
          <input
            className={inputClass}
            value={form.vendorName}
            onChange={(e) => setField("vendorName", e.target.value)}
          />
        </Field>

        <div className="grid grid-cols-2 gap-3">
          <Field label="PAN / VAT no.">
            <input
              className={inputClass}
              value={form.vendorPan}
              onChange={(e) => setField("vendorPan", e.target.value)}
            />
          </Field>
          <Field label="Bill no.">
            <input
              className={inputClass}
              value={form.billNumber}
              onChange={(e) => setField("billNumber", e.target.value)}
            />
          </Field>
        </div>

        <Field label="Bill date (BS, e.g. 2083-07-22)">
          <input
            className={inputClass}
            value={form.billDate}
            onChange={(e) => setField("billDate", e.target.value)}
          />
        </Field>

        <div className="space-y-2">
          <div className="text-sm font-medium">Items</div>
          {form.items.map((item, i) => (
            <div
              key={i}
              className="grid grid-cols-[1fr_4rem_5rem_6rem_auto] gap-2"
            >
              <input
                className={inputClass}
                placeholder="Name"
                value={item.name}
                onChange={(e) => setItem(i, "name", e.target.value)}
              />
              <input
                className={inputClass}
                placeholder="Qty"
                value={item.qty}
                onChange={(e) => setItem(i, "qty", e.target.value)}
              />
              <input
                className={inputClass}
                placeholder="Rate"
                value={item.rate}
                onChange={(e) => setItem(i, "rate", e.target.value)}
              />
              <input
                className={inputClass}
                placeholder="Amount"
                value={item.amount}
                onChange={(e) => setItem(i, "amount", e.target.value)}
              />
              <Button
                type="button"
                variant="outline"
                onClick={() => removeItem(i)}
                aria-label={`Remove item ${i + 1}`}
              >
                ✕
              </Button>
            </div>
          ))}
          <Button type="button" variant="outline" onClick={addItem}>
            + Add item
          </Button>
        </div>

        <div className="grid grid-cols-3 gap-3">
          <Field label="Subtotal">
            <input
              className={inputClass}
              value={form.subTotal}
              onChange={(e) => setField("subTotal", e.target.value)}
            />
          </Field>
          <Field label="VAT">
            <input
              className={inputClass}
              value={form.vat}
              onChange={(e) => setField("vat", e.target.value)}
            />
          </Field>
          <Field label="Total">
            <input
              className={inputClass}
              value={form.total}
              onChange={(e) => setField("total", e.target.value)}
            />
          </Field>
        </div>

        {errors.length > 0 && (
          <ul className="space-y-1 rounded-md border border-red-300 bg-red-50 p-3 text-sm text-red-800">
            {errors.map((m) => (
              <li key={m}>✕ {m}</li>
            ))}
          </ul>
        )}
        {warnings.length > 0 && (
          <ul className="space-y-1 rounded-md border border-amber-300 bg-amber-50 p-3 text-sm text-amber-900">
            {warnings.map((m) => (
              <li key={m}>⚠ {m}</li>
            ))}
          </ul>
        )}
        {serverError && <p className="text-sm text-red-700">{serverError}</p>}

        <Button onClick={confirm} disabled={saving || errors.length > 0}>
          {saving ? "Saving..." : "Confirm bill"}
        </Button>
      </div>
    </div>
  );
}
