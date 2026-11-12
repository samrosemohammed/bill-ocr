"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";

import { Button, buttonVariants } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

import { Separator } from "@/components/ui/separator";

import { ScrollArea, ScrollBar } from "@/components/ui/scroll-area";

import { BackButton } from "@/components/back-button";
import { parseReviewForm } from "@/lib/review";
import type { ReviewInput } from "@/schemas/review";

const inputClass = "w-full";

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
    <div className="space-y-2">
      <Label>{label}</Label>
      {children}
    </div>
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

  const setField = (key: TopField, value: string) => {
    setForm((f) => ({ ...f, [key]: value }));
  };

  const setItem = (index: number, key: keyof Item, value: string) => {
    setForm((f) => ({
      ...f,
      items: f.items.map((it, i) =>
        i === index ? { ...it, [key]: value } : it,
      ),
    }));
  };

  const addItem = () => {
    setForm((f) => ({
      ...f,
      items: [...f.items, { name: "", qty: "", rate: "", amount: "" }],
    }));
  };

  const removeItem = (index: number) => {
    setForm((f) => ({
      ...f,
      items: f.items.filter((_, i) => i !== index),
    }));
  };

  const confirm = async () => {
    if (saving || errors.length > 0) return;

    setSaving(true);
    setServerError(null);

    try {
      const res = await fetch(`/api/bills/${id}`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
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
    <div className="mx-auto max-w-6xl space-y-6 p-4">
      {/* Page Header */}
      <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
        <div className="flex items-center gap-3">
          <BackButton />

          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-2xl font-semibold tracking-tight">
                Review bill
              </h1>

              <Badge variant="secondary">Pending review</Badge>
            </div>

            <p className="text-sm text-muted-foreground">
              Verify the extracted information before confirming.
            </p>
          </div>
        </div>

        <Link
          className={buttonVariants({ variant: "outline" })}
          href="/dashboard/bills"
        >
          Cancel review
        </Link>
      </div>

      <Separator />

      {/* Main Layout */}
      <div className="grid items-start gap-6 lg:grid-cols-2">
        {/* Left: Original Bill */}
        <Card className="lg:sticky lg:top-4">
          <CardHeader>
            <CardTitle>Original bill</CardTitle>
            <CardDescription>
              Compare the extracted information with the uploaded document.
            </CardDescription>
          </CardHeader>

          <CardContent>
            <ScrollArea className="h-[60vh] rounded-md border bg-muted/30 lg:h-[calc(100vh-16rem)]">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={imageUrl}
                alt="Uploaded bill"
                className="h-auto w-full"
              />

              <ScrollBar orientation="vertical" />
              <ScrollBar orientation="horizontal" />
            </ScrollArea>
          </CardContent>
        </Card>

        {/* Right: Editable Information */}
        <div className="space-y-6">
          {/* Vendor Information */}
          <Card>
            <CardHeader>
              <CardTitle>Bill information</CardTitle>
              <CardDescription>
                Review vendor and invoice details.
              </CardDescription>
            </CardHeader>

            <CardContent className="space-y-4">
              <Field label="Vendor name">
                <Input
                  className={inputClass}
                  value={form.vendorName}
                  onChange={(e) => setField("vendorName", e.target.value)}
                  placeholder="Enter vendor name"
                />
              </Field>

              <div className="grid gap-4 sm:grid-cols-2">
                <Field label="PAN / VAT no.">
                  <Input
                    value={form.vendorPan}
                    onChange={(e) => setField("vendorPan", e.target.value)}
                    placeholder="Enter PAN / VAT number"
                  />
                </Field>

                <Field label="Bill number">
                  <Input
                    value={form.billNumber}
                    onChange={(e) => setField("billNumber", e.target.value)}
                    placeholder="Enter bill number"
                  />
                </Field>
              </div>

              <Field label="Bill date (BS)">
                <Input
                  value={form.billDate}
                  onChange={(e) => setField("billDate", e.target.value)}
                  placeholder="2083-07-22"
                />
                <p className="text-xs text-muted-foreground">
                  Enter the bill date in Bikram Sambat (BS).
                </p>
              </Field>
            </CardContent>
          </Card>

          {/* Bill Items */}
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between gap-3">
                <div>
                  <CardTitle>Bill items</CardTitle>
                  <CardDescription>
                    Verify quantities, rates and amounts.
                  </CardDescription>
                </div>

                <Badge variant="secondary">{form.items.length} items</Badge>
              </div>
            </CardHeader>

            <CardContent className="space-y-4">
              {/* Item column headings */}
              <div className="hidden grid-cols-[minmax(0,1fr)_5rem_6rem_6rem_2.5rem] gap-2 px-1 text-xs font-medium text-muted-foreground sm:grid">
                <span>Item name</span>
                <span>Qty</span>
                <span>Rate</span>
                <span>Amount</span>
                <span />
              </div>

              {form.items.length === 0 ? (
                <div className="rounded-md border border-dashed py-8 text-center">
                  <p className="text-sm text-muted-foreground">
                    No items added yet.
                  </p>
                </div>
              ) : (
                <div className="space-y-3">
                  {form.items.map((item, i) => (
                    <div
                      key={i}
                      className="overflow-x-auto rounded-md border p-3"
                    >
                      <div className="grid min-w-[540px] grid-cols-[minmax(0,1fr)_5rem_6rem_6rem_2.5rem] items-end gap-2">
                        <div className="space-y-2">
                          <Label className="sm:hidden">Item name</Label>
                          <Input
                            value={item.name}
                            onChange={(e) => setItem(i, "name", e.target.value)}
                            placeholder="Item name"
                          />
                        </div>

                        <div className="space-y-2">
                          <Label className="sm:hidden">Qty</Label>
                          <Input
                            value={item.qty}
                            onChange={(e) => setItem(i, "qty", e.target.value)}
                            placeholder="Qty"
                            inputMode="decimal"
                          />
                        </div>

                        <div className="space-y-2">
                          <Label className="sm:hidden">Rate</Label>
                          <Input
                            value={item.rate}
                            onChange={(e) => setItem(i, "rate", e.target.value)}
                            placeholder="Rate"
                            inputMode="decimal"
                          />
                        </div>

                        <div className="space-y-2">
                          <Label className="sm:hidden">Amount</Label>
                          <Input
                            value={item.amount}
                            onChange={(e) =>
                              setItem(i, "amount", e.target.value)
                            }
                            placeholder="Amount"
                            inputMode="decimal"
                          />
                        </div>

                        <Button
                          type="button"
                          variant="outline"
                          size="icon"
                          onClick={() => removeItem(i)}
                          aria-label={`Remove item ${i + 1}`}
                        >
                          ×
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              )}

              <Button
                type="button"
                variant="outline"
                className="w-full"
                onClick={addItem}
              >
                + Add item
              </Button>
            </CardContent>
          </Card>

          {/* Bill Totals */}
          <Card>
            <CardHeader>
              <CardTitle>Bill totals</CardTitle>
              <CardDescription>
                Verify the subtotal, VAT and final amount.
              </CardDescription>
            </CardHeader>

            <CardContent className="space-y-4">
              <div className="grid gap-4 sm:grid-cols-2">
                <Field label="Subtotal">
                  <Input
                    value={form.subTotal}
                    onChange={(e) => setField("subTotal", e.target.value)}
                    placeholder="0.00"
                    inputMode="decimal"
                  />
                </Field>

                <Field label="VAT">
                  <Input
                    value={form.vat}
                    onChange={(e) => setField("vat", e.target.value)}
                    placeholder="0.00"
                    inputMode="decimal"
                  />
                </Field>
              </div>

              <Separator />

              <Field label="Total amount">
                <Input
                  value={form.total}
                  onChange={(e) => setField("total", e.target.value)}
                  placeholder="0.00"
                  inputMode="decimal"
                  className="text-lg font-semibold tabular-nums"
                />
              </Field>

              <p className="text-xs text-muted-foreground">
                Amounts are in NPR (Rs.).
              </p>
            </CardContent>
          </Card>

          {/* Validation Messages */}
          {errors.length > 0 && (
            <div className="rounded-lg border border-destructive/30 bg-destructive/5 p-4">
              <div className="mb-2 flex items-center gap-2 font-medium text-destructive">
                Validation errors
              </div>

              <ul className="space-y-1 text-sm text-destructive">
                {errors.map((message, i) => (
                  <li key={i}>• {message}</li>
                ))}
              </ul>
            </div>
          )}

          {warnings.length > 0 && (
            <div className="rounded-lg border border-amber-500/30 bg-amber-500/5 p-4">
              <div className="mb-2 font-medium text-amber-700 dark:text-amber-400">
                Please review these warnings
              </div>

              <ul className="space-y-1 text-sm text-amber-700 dark:text-amber-400">
                {warnings.map((message, i) => (
                  <li key={i}>• {message}</li>
                ))}
              </ul>
            </div>
          )}

          {/* Server Error */}
          {serverError && (
            <div
              role="alert"
              className="rounded-lg border border-destructive/30 bg-destructive/5 p-4 text-sm text-destructive"
            >
              {serverError}
            </div>
          )}

          {/* Form Actions */}
          <Card>
            <CardContent className="flex flex-col-reverse justify-between gap-3 pt-6 sm:flex-row sm:items-center">
              <p className="text-xs text-muted-foreground">
                Verify all information before confirming.
              </p>

              <div className="flex gap-2">
                <Button
                  onClick={() => {
                    router.push("/dashboard/bills");
                  }}
                  variant="outline"
                  disabled={saving}
                >
                  Cancel
                </Button>

                <Button
                  onClick={confirm}
                  disabled={saving || errors.length > 0}
                >
                  {saving ? "Saving..." : "Confirm bill"}
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
