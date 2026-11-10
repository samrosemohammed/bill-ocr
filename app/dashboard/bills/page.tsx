import Link from "next/link";
import { db } from "@/prisma/db";
import { UploadDialog } from "./_components/upload-dialog";
import { PaginationControls } from "./_components/pagination-controls";

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
import { Export } from "./_components/export";
import { format } from "date-fns";

const PAGE_SIZES = [10, 20, 50, 100];
const DEFAULT_PAGE_SIZE = 20;

type SearchParams = {
  status?: string;
  page?: string;
  limit?: string;
};

const money = (value: string | null) =>
  value === null
    ? "—"
    : Number(value).toLocaleString("en-IN", {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2,
      });

export default async function BillsPage({
  searchParams,
}: {
  searchParams: Promise<SearchParams>;
}) {
  const sp = await searchParams;

  // Status
  const tab = sp.status === "confirmed" ? "confirmed" : "pending";

  const status = tab === "confirmed" ? "CONFIRMED" : "PENDING_REVIEW";

  // Page size
  const requestedLimit = Number.parseInt(sp.limit ?? "", 10);

  const limit = PAGE_SIZES.includes(requestedLimit)
    ? requestedLimit
    : DEFAULT_PAGE_SIZE;

  // Total records
  const [pending, confirmed] = await Promise.all([
    db.orm.public.Bill.where({
      status: "PENDING_REVIEW",
    }).aggregate((a) => ({
      n: a.count(),
    })),

    db.orm.public.Bill.where({
      status: "CONFIRMED",
    }).aggregate((a) => ({
      n: a.count(),
    })),
  ]);

  const total = tab === "confirmed" ? confirmed.n : pending.n;

  // Pagination
  const totalPages = Math.max(1, Math.ceil(total / limit));

  const requestedPage = Number.parseInt(sp.page ?? "1", 10);

  const page = Math.min(
    Math.max(Number.isFinite(requestedPage) ? requestedPage : 1, 1),
    totalPages,
  );

  // Fetch bills
  const bills = await db.orm.public.Bill.where({ status })
    .orderBy([(b) => b.createdAt.desc(), (b) => b.id.desc()])
    .limit(limit)
    .offset((page - 1) * limit)
    .all();

  // Display range
  const start = total === 0 ? 0 : (page - 1) * limit + 1;
  const end = Math.min(page * limit, total);

  // Preserve query parameters
  const href = (status: string, page = 1, pageSize = limit) =>
    `/dashboard/bills?status=${status}&page=${page}&limit=${pageSize}`;

  return (
    <div className="mx-auto max-w-6xl space-y-6 p-4 md:p-6">
      {/* Header */}
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

      {/* Tabs */}
      <Tabs value={tab}>
        <TabsList>
          <TabsTrigger value="pending">
            <Link href={href("pending")}>
              Pending review
              <Badge variant="secondary" className="ml-2">
                {pending.n}
              </Badge>
            </Link>
          </TabsTrigger>

          <TabsTrigger value="confirmed">
            <Link href={href("confirmed")}>
              Confirmed
              <Badge variant="secondary" className="ml-2">
                {confirmed.n}
              </Badge>
            </Link>
          </TabsTrigger>
        </TabsList>
      </Tabs>

      {/* Table container */}
      <div className="rounded-lg border">
        {/* Table toolbar */}
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
            <span className="whitespace-nowrap text-muted-foreground">
              Rows per page
            </span>

            <PaginationControls
              page={page}
              totalPages={totalPages}
              limit={limit}
              status={tab}
              pageSizes={PAGE_SIZES}
              pageSizeOnly
            />
          </div>
        </div>

        {/* Table */}
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
                    <TableCell className="font-medium">
                      {bill.vendorName || (
                        <span className="text-muted-foreground">Unknown</span>
                      )}
                    </TableCell>

                    <TableCell>{bill.billNumber || "—"}</TableCell>

                    <TableCell>{bill.billDateBs || "—"}</TableCell>
                    <TableCell>
                      {bill.billDateAd
                        ? format(bill.billDateAd, "yyyy-MM-dd")
                        : "—"}
                    </TableCell>
                    <TableCell className="text-right tabular-nums">
                      {money(bill.total)}
                    </TableCell>

                    <TableCell className="whitespace-nowrap">
                      {bill.createdAt.toISOString().slice(0, 10)}
                    </TableCell>

                    <TableCell className="text-right">
                      {tab === "pending" ? (
                        <Button variant="link" size="sm">
                          <Link href={`/dashboard/bills/${bill.id}/review`}>
                            Review
                          </Link>
                        </Button>
                      ) : (
                        <Button variant="link" size="sm">
                          <a
                            href={bill.imageUrl}
                            target="_blank"
                            rel="noreferrer"
                          >
                            View image
                          </a>
                        </Button>
                      )}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        )}

        {/* Pagination footer */}
        <div className="border-t p-4">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <p className="text-sm text-muted-foreground">
              Showing{" "}
              <span className="font-medium text-foreground">
                {start.toLocaleString("en-IN")}–{end.toLocaleString("en-IN")}
              </span>{" "}
              of{" "}
              <span className="font-medium text-foreground">
                {total.toLocaleString("en-IN")}
              </span>{" "}
              bills
            </p>

            <PaginationControls
              page={page}
              totalPages={totalPages}
              limit={limit}
              status={tab}
              pageSizes={PAGE_SIZES}
            />
          </div>
        </div>
      </div>

      {/* CSV Export */}
      <Export />
    </div>
  );
}
