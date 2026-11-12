"use client";

import { useState } from "react";
import { Download, FileSpreadsheet, CalendarDays, X } from "lucide-react";

import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Calendar } from "@/components/ui/calendar";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";

import { format } from "date-fns";

export const Export = () => {
  const [type, setType] = useState("bills");
  const [from, setFrom] = useState<Date | undefined>();
  const [to, setTo] = useState<Date | undefined>();
  const [error, setError] = useState("");

  const handleSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    if (from && to && from > to) {
      event.preventDefault();
      setError("Start date cannot be later than end date.");
      return;
    }

    setError("");
  };

  const formatDate = (date?: Date) => (date ? format(date, "yyyy-MM-dd") : "");

  return (
    <Card className="w-full shadow-sm">
      <CardHeader>
        <div className="flex items-start gap-3">
          <div className="flex size-11 shrink-0 items-center justify-center rounded-xl bg-primary/10 text-primary">
            <FileSpreadsheet className="size-5" />
          </div>

          <div className="space-y-1">
            <CardTitle className="text-base">Export bills</CardTitle>
            <CardDescription>
              Download confirmed bills for accounting and reporting.
            </CardDescription>
          </div>
        </div>
      </CardHeader>

      <CardContent>
        <form
          method="GET"
          action="/api/export"
          onSubmit={handleSubmit}
          className="space-y-5"
        >
          {/* Hidden fields for native GET form submission */}
          <input type="hidden" name="from" value={formatDate(from)} />
          <input type="hidden" name="to" value={formatDate(to)} />
          <input type="hidden" name="type" value={type} />

          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {/* From date */}
            <div className="space-y-2">
              <Label>Bill date from (AD)</Label>

              <Popover>
                <PopoverTrigger
                  render={
                    <Button
                      type="button"
                      variant="outline"
                      className="w-full justify-start text-left font-normal"
                    >
                      <CalendarDays className="mr-2 size-4" />
                      {from ? format(from, "dd MMM yyyy") : "Select start date"}
                    </Button>
                  }
                ></PopoverTrigger>

                <PopoverContent className="w-auto p-0" align="start">
                  <Calendar
                    mode="single"
                    selected={from}
                    onSelect={(date) => {
                      setFrom(date);
                      setError("");
                    }}
                    disabled={(date) => !!to && date > to}
                  />
                </PopoverContent>
              </Popover>

              {from && (
                <button
                  type="button"
                  onClick={() => setFrom(undefined)}
                  className="text-xs text-muted-foreground hover:text-foreground"
                >
                  Clear start date
                </button>
              )}
            </div>

            {/* To date */}
            <div className="space-y-2">
              <Label>Bill date to (AD)</Label>

              <Popover>
                <PopoverTrigger
                  render={
                    <Button
                      type="button"
                      variant="outline"
                      className="w-full justify-start text-left font-normal"
                    >
                      <CalendarDays className="mr-2 size-4" />
                      {to ? format(to, "dd MMM yyyy") : "Select end date"}
                    </Button>
                  }
                ></PopoverTrigger>

                <PopoverContent className="w-auto p-0" align="start">
                  <Calendar
                    mode="single"
                    selected={to}
                    onSelect={(date) => {
                      setTo(date);
                      setError("");
                    }}
                    disabled={(date) => !!to && date > to}
                  />
                </PopoverContent>
              </Popover>

              {to && (
                <button
                  type="button"
                  onClick={() => setTo(undefined)}
                  className="text-xs text-muted-foreground hover:text-foreground"
                >
                  Clear end date
                </button>
              )}
            </div>

            {/* Export type */}
            <div className="space-y-2">
              <Label>Export rows</Label>

              <Select
                value={type}
                onValueChange={(value) => {
                  if (value) {
                    setType(value);
                  }
                }}
              >
                <SelectTrigger className="w-full">
                  <SelectValue placeholder="Select export type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="bills">One row per bill</SelectItem>
                  <SelectItem value="items">One row per item</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          {error && (
            <div
              role="alert"
              className="flex items-center gap-2 rounded-md border border-destructive/30 bg-destructive/5 p-3 text-sm text-destructive"
            >
              <X className="size-4 shrink-0" />
              {error}
            </div>
          )}

          <Separator />

          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <div className="space-y-1">
              <p className="text-sm font-medium">Export information</p>
              <p className="text-xs leading-relaxed text-muted-foreground">
                Leave dates empty to export all confirmed bills. Bills without
                dates are excluded when a date range is applied.
              </p>
            </div>

            <Button type="submit" className="shrink-0">
              <Download className="mr-2 size-4" />
              Download CSV
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
};
