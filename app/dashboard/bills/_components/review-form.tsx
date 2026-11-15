"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { CircleAlert, Plus, TriangleAlert, X, ZoomIn } from "lucide-react";

import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Button, buttonVariants } from "@/components/ui/button";
import { Dialog, DialogContent, DialogTitle } from "@/components/ui/dialog";
import { Field, FieldGroup, FieldLabel } from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { parseReviewForm } from "@/lib/review";
import type { ReviewInput } from "@/schemas/review";
import { BackButton } from "@/components/back-button";

type Item = ReviewInput["items"][number];
type TopField = Exclude<keyof ReviewInput, "items">;

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
  const [zoom, setZoom] = useState(false);

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
      router.push("/dashboard/bills?status=confirmed");
      router.refresh();
    } catch {
      setServerError("Network error. Please try again.");
    } finally {
      setSaving(false);
    }
  };

  return (
    // @container: children below respond to this element's width, not the screen's
    <div className="@container mx-auto w-full max-w-6xl space-y-6 p-4 md:p-6">
      <div className="flex items-center gap-3">
        <BackButton />
        <div>
          <h1 className="text-xl font-semibold">Review bill</h1>
          <p className="text-sm text-muted-foreground">
            Compare the extracted details with the original, fix anything wrong,
            then confirm.
          </p>
        </div>
      </div>

      <div className="grid gap-6 @4xl:grid-cols-2 @4xl:items-start">
        {/* Original bill: compact on small screens, sticky on wide ones */}
        <div className="@4xl:sticky @4xl:top-4">
          <button
            type="button"
            onClick={() => setZoom(true)}
            aria-label="Enlarge bill image"
            className="relative block w-full cursor-zoom-in overflow-hidden rounded-lg border bg-muted/30 p-2 outline-none focus-visible:ring-2 focus-visible:ring-ring"
          >
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={imageUrl}
              alt="Uploaded bill"
              className="mx-auto max-h-64 w-auto max-w-full object-contain @4xl:max-h-[75svh]"
            />
            <span className="absolute right-3 bottom-3 inline-flex items-center gap-1 rounded-md bg-background/90 px-2 py-1 text-xs shadow">
              <ZoomIn className="size-3.5" />
              Enlarge
            </span>
          </button>
        </div>

        {/* Editable data */}
        <div className="min-w-0 space-y-6">
          <FieldGroup>
            <Field>
              <FieldLabel htmlFor="vendorName">Vendor name</FieldLabel>
              <Input
                id="vendorName"
                autoComplete="off"
                value={form.vendorName}
                onChange={(e) => setField("vendorName", e.target.value)}
              />
            </Field>

            <div className="grid gap-4 @sm:grid-cols-2">
              <Field>
                <FieldLabel htmlFor="vendorPan">PAN / VAT no.</FieldLabel>
                <Input
                  id="vendorPan"
                  inputMode="numeric"
                  autoComplete="off"
                  value={form.vendorPan}
                  onChange={(e) => setField("vendorPan", e.target.value)}
                />
              </Field>
              <Field>
                <FieldLabel htmlFor="billNumber">Bill no.</FieldLabel>
                <Input
                  id="billNumber"
                  autoComplete="off"
                  value={form.billNumber}
                  onChange={(e) => setField("billNumber", e.target.value)}
                />
              </Field>
            </div>

            <Field>
              <FieldLabel htmlFor="billDate">Bill date (BS)</FieldLabel>
              <Input
                id="billDate"
                inputMode="numeric"
                placeholder="2083-07-22"
                autoComplete="off"
                value={form.billDate}
                onChange={(e) => setField("billDate", e.target.value)}
              />
            </Field>
          </FieldGroup>

          {/* Items: one card each, so nothing is squeezed into a row */}
          <section className="space-y-3">
            <h2 className="text-sm font-medium">Items</h2>

            {form.items.length === 0 && (
              <p className="text-sm text-muted-foreground">
                No items. Add one if the bill lists items.
              </p>
            )}

            {form.items.map((item, i) => (
              <div key={i} className="space-y-3 rounded-lg border p-3">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-medium text-muted-foreground">
                    Item {i + 1}
                  </span>
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    className="size-7"
                    onClick={() => removeItem(i)}
                    aria-label={`Remove item ${i + 1}`}
                  >
                    <X />
                  </Button>
                </div>

                <Field>
                  <FieldLabel htmlFor={`item-${i}-name`}>Name</FieldLabel>
                  <Input
                    id={`item-${i}-name`}
                    autoComplete="off"
                    value={item.name}
                    onChange={(e) => setItem(i, "name", e.target.value)}
                  />
                </Field>

                <div className="grid grid-cols-2 gap-3 @md:grid-cols-3">
                  <Field>
                    <FieldLabel htmlFor={`item-${i}-qty`}>Qty</FieldLabel>
                    <Input
                      id={`item-${i}-qty`}
                      inputMode="decimal"
                      autoComplete="off"
                      value={item.qty}
                      onChange={(e) => setItem(i, "qty", e.target.value)}
                    />
                  </Field>
                  <Field>
                    <FieldLabel htmlFor={`item-${i}-rate`}>Rate</FieldLabel>
                    <Input
                      id={`item-${i}-rate`}
                      inputMode="decimal"
                      autoComplete="off"
                      value={item.rate}
                      onChange={(e) => setItem(i, "rate", e.target.value)}
                    />
                  </Field>
                  <Field className="col-span-2 @md:col-span-1">
                    <FieldLabel htmlFor={`item-${i}-amount`}>Amount</FieldLabel>
                    <Input
                      id={`item-${i}-amount`}
                      inputMode="decimal"
                      autoComplete="off"
                      value={item.amount}
                      onChange={(e) => setItem(i, "amount", e.target.value)}
                    />
                  </Field>
                </div>
              </div>
            ))}

            <Button
              type="button"
              variant="outline"
              className="w-full @md:w-auto"
              onClick={addItem}
            >
              <Plus />
              Add item
            </Button>
          </section>

          <div className="grid gap-4 @md:grid-cols-3">
            <Field>
              <FieldLabel htmlFor="subTotal">Subtotal</FieldLabel>
              <Input
                id="subTotal"
                inputMode="decimal"
                autoComplete="off"
                value={form.subTotal}
                onChange={(e) => setField("subTotal", e.target.value)}
              />
            </Field>
            <Field>
              <FieldLabel htmlFor="vat">VAT</FieldLabel>
              <Input
                id="vat"
                inputMode="decimal"
                autoComplete="off"
                value={form.vat}
                onChange={(e) => setField("vat", e.target.value)}
              />
            </Field>
            <Field>
              <FieldLabel htmlFor="total">Total</FieldLabel>
              <Input
                id="total"
                inputMode="decimal"
                autoComplete="off"
                value={form.total}
                onChange={(e) => setField("total", e.target.value)}
              />
            </Field>
          </div>

          {errors.length > 0 && (
            <Alert variant="destructive">
              <CircleAlert />
              <AlertTitle>Fix before confirming</AlertTitle>
              <AlertDescription>
                <ul className="list-disc space-y-1 pl-4">
                  {errors.map((m) => (
                    <li key={m}>{m}</li>
                  ))}
                </ul>
              </AlertDescription>
            </Alert>
          )}

          {warnings.length > 0 && (
            <Alert>
              <TriangleAlert />
              <AlertTitle>Worth a second look</AlertTitle>
              <AlertDescription>
                <ul className="list-disc space-y-1 pl-4">
                  {warnings.map((m) => (
                    <li key={m}>{m}</li>
                  ))}
                </ul>
              </AlertDescription>
            </Alert>
          )}

          {serverError && (
            <p className="text-sm text-destructive" role="alert">
              {serverError}
            </p>
          )}
        </div>
      </div>

      {/* Action bar stays in reach on long forms and small screens */}
      <div className="sticky bottom-0 z-10 -mx-4 flex items-center gap-3 border-t bg-background/95 px-4 py-3 backdrop-blur md:-mx-6 md:px-6">
        <p className="flex-1 text-sm" aria-live="polite">
          {errors.length > 0 ? (
            <span className="text-destructive">
              {errors.length} {errors.length === 1 ? "issue" : "issues"} to fix
            </span>
          ) : warnings.length > 0 ? (
            <span className="text-muted-foreground">
              {warnings.length} {warnings.length === 1 ? "warning" : "warnings"}{" "}
              to check
            </span>
          ) : (
            <span className="text-muted-foreground">Looks good</span>
          )}
        </p>
        <Link
          href="/dashboard/bills?status=pending"
          className={buttonVariants({
            variant: "outline",
            className: "hidden sm:inline-flex",
          })}
        >
          Cancel
        </Link>
        <Button onClick={confirm} disabled={saving || errors.length > 0}>
          {saving ? "Saving..." : "Confirm bill"}
        </Button>
      </div>

      <Dialog open={zoom} onOpenChange={setZoom}>
        <DialogContent className="max-h-[90svh] overflow-auto p-2 sm:max-w-4xl">
          <DialogTitle className="sr-only">Bill image</DialogTitle>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={imageUrl}
            alt="Uploaded bill, enlarged"
            className="h-auto w-full"
          />
        </DialogContent>
      </Dialog>
    </div>
  );
}
