"use client";

import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { useQuery } from "@tanstack/react-query";
import { format } from "date-fns";

import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { BackButton } from "@/components/back-button";
import { UploadDialog } from "./upload-dialog";
import { PaginationControls } from "./pagination-controls";
import { Export } from "./export";

const PAGE_SIZES = [10, 20, 50, 100];
const DEFAULT_PAGE_SIZE = 20;

type Bill = {
  id: number;
  vendorName: string | null;
  billNumber: string | null;
  billDateBs: string | null;
  billDateAd: string | null;
  total: string | null;
  imageUrl: string;
  createdAt: string;
};

type BillsResponse = {
  pending: number;
  confirmed: number;
  page: number;
  limit: number;
  total: number;
  totalPages: number;
  bills: Bill[];
};

const money = (value: string | null) =>
  value === null
    ? "—"
    : Number(value).toLocaleString("en-IN", {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2,
      });

async function fetchBills(query: string): Promise<BillsResponse> {
  const response = await fetch(`/api/bills?${query}`);
  const data = await response.json();

  if (!response.ok) {
    throw new Error(data.error ?? "Could not load bills");
  }

  return data;
}

export const BillContent = () => {
  const searchParams = useSearchParams();
  const tab = searchParams.get("status") === "confirmed" ? "confirmed" : "pending";
  const requestedLimit = Number.parseInt(searchParams.get("limit") ?? "", 10);
  const limit = PAGE_SIZES.includes(requestedLimit)
    ? requestedLimit
    : DEFAULT_PAGE_SIZE;
  const query = new URLSearchParams({
    status: tab,
    page: searchParams.get("page") ?? "1",
    limit: String(limit),
  });

  const billsQuery = useQuery({
    queryKey: ["bills", query.toString()],
    queryFn: () => fetchBills(query.toString()),
  });

  if (billsQuery.isPending) {
    return <BillsLoading />;
  }

  if (billsQuery.isError) {
    return (
      <div className="mx-auto max-w-6xl p-4 text-sm text-destructive md:p-6">
        {billsQuery.error.message}
      </div>
    );
  }

  const { bills, pending, confirmed, page, total, totalPages } = billsQuery.data;
  const start = total === 0 ? 0 : (page - 1) * limit + 1;
  const end = Math.min(page * limit, total);
  const href = (status: string) =>
    `/dashboard/bills?status=${status}&page=1&limit=${limit}`;

  return (
    <div className="mx-auto max-w-6xl space-y-6 p-4 md:p-6">
      <div className="flex items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <BackButton />
          <div>
            <h1 className="text-2xl font-semibold tracking-tight">Bills</h1>
            <p className="text-sm text-muted-foreground">
              Manage uploaded and confirmed bills.
            </p>
          </div>
        </div>
        <UploadDialog />
      </div>

      <Tabs value={tab}>
        <TabsList>
          <TabsTrigger value="pending">
            <Link href={href("pending")}>
              Pending review
              <Badge variant="secondary" className="ml-2">{pending}</Badge>
            </Link>
          </TabsTrigger>
          <TabsTrigger value="confirmed">
            <Link href={href("confirmed")}>
              Confirmed
              <Badge variant="secondary" className="ml-2">{confirmed}</Badge>
            </Link>
          </TabsTrigger>
        </TabsList>
      </Tabs>

      <div className="rounded-lg border">
        <div className="flex flex-col gap-3 border-b p-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h2 className="font-medium">
              {tab === "pending" ? "Pending bills" : "Confirmed bills"}
            </h2>
            <p className="text-sm text-muted-foreground">
              {total.toLocaleString("en-IN")} total records
            </p>
          </div>
          <div className="flex items-center gap-2 text-sm">
            <span className="whitespace-nowrap text-muted-foreground">Rows per page</span>
            <PaginationControls page={page} totalPages={totalPages} limit={limit} status={tab} pageSizes={PAGE_SIZES} pageSizeOnly />
          </div>
        </div>

        {bills.length === 0 ? (
          <div className="flex min-h-40 items-center justify-center text-sm text-muted-foreground">
            No bills here yet.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Vendor</TableHead>
                  <TableHead>Bill no.</TableHead>
                  <TableHead>Date (BS)</TableHead>
                  <TableHead>Date (AD)</TableHead>
                  <TableHead className="text-right">Total</TableHead>
                  <TableHead>Uploaded</TableHead>
                  <TableHead className="text-right">Action</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {bills.map((bill) => (
                  <TableRow key={bill.id}>
                    <TableCell className="font-medium">{bill.vendorName || <span className="text-muted-foreground">Unknown</span>}</TableCell>
                    <TableCell>{bill.billNumber || "—"}</TableCell>
                    <TableCell>{bill.billDateBs || "—"}</TableCell>
                    <TableCell>{bill.billDateAd ? format(new Date(bill.billDateAd), "yyyy-MM-dd") : "—"}</TableCell>
                    <TableCell className="text-right tabular-nums">{money(bill.total)}</TableCell>
                    <TableCell className="whitespace-nowrap">{new Date(bill.createdAt).toISOString().slice(0, 10)}</TableCell>
                    <TableCell className="text-right">
                      {tab === "pending" ? (
                        <Button variant="link" size="sm"><Link href={`/dashboard/bills/${bill.id}/review`}>Review</Link></Button>
                      ) : (
                        <Button variant="link" size="sm"><a href={bill.imageUrl} target="_blank" rel="noreferrer">View image</a></Button>
                      )}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        )}

        <div className="border-t p-4">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <p className="text-sm text-muted-foreground">
              Showing <span className="font-medium text-foreground">{start.toLocaleString("en-IN")}–{end.toLocaleString("en-IN")}</span> of <span className="font-medium text-foreground">{total.toLocaleString("en-IN")}</span> bills
            </p>
            <PaginationControls page={page} totalPages={totalPages} limit={limit} status={tab} pageSizes={PAGE_SIZES} />
          </div>
        </div>
      </div>
      <Export />
    </div>
  );
};

function BillsLoading() {
  return (
    <div className="mx-auto max-w-6xl space-y-6 p-4 md:p-6 animate-pulse">
      <div className="h-10 w-48 rounded-md bg-muted" />
      <div className="h-12 w-64 rounded-md bg-muted" />
      <div className="rounded-lg border">
        <div className="h-20 border-b bg-muted/50" />
        <div className="space-y-4 p-4">{Array.from({ length: 6 }).map((_, i) => <div key={i} className="h-10 rounded bg-muted" />)}</div>
      </div>
    </div>
  );
}
