"use client";

import Link from "next/link";
import { useQuery } from "@tanstack/react-query";
import {
  ArrowUpRight,
  CheckCircle2,
  Clock3,
  FileText,
  ReceiptText,
  Upload,
} from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { buttonVariants } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { UploadDialog } from "../bills/_components/upload-dialog";

type RecentBill = {
  id: number;
  vendorName: string | null;
  status: "PENDING_REVIEW" | "CONFIRMED";
  total: string | null;
  createdAt: string;
};

type DashboardResponse = {
  user: { name: string };
  pending: number;
  confirmed: number;
  recentBills: RecentBill[];
};

async function fetchDashboard(): Promise<DashboardResponse> {
  const response = await fetch("/api/dashboard");
  const data = await response.json();

  if (!response.ok) {
    throw new Error(data.error ?? "Could not load dashboard");
  }

  return data;
}

const formatMoney = (value: string | null) =>
  value === null
    ? "—"
    : `Rs. ${Number(value).toLocaleString("en-IN", {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2,
      })}`;

const formatDate = (date: string) =>
  new Date(date).toLocaleDateString("en-IN", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });

export const DashboardContent = () => {
  const dashboardQuery = useQuery({
    queryKey: ["dashboard"],
    queryFn: fetchDashboard,
  });

  if (dashboardQuery.isPending) {
    return <DashboardLoading />;
  }

  if (dashboardQuery.isError) {
    return (
      <div className="mx-auto max-w-7xl p-4 text-sm text-destructive md:p-8">
        {dashboardQuery.error.message}
      </div>
    );
  }

  const { user, pending, confirmed, recentBills } = dashboardQuery.data;
  const total = pending + confirmed;
  const reviewedPercentage =
    total === 0 ? 0 : Math.round((confirmed / total) * 100);

  return (
    <div className="mx-auto max-w-7xl space-y-8 p-4 md:p-8">
      <section className="flex flex-col justify-between gap-5 sm:flex-row sm:items-end">
        <div>
          <p className="text-sm font-medium text-primary">Workspace overview</p>
          <h1 className="mt-1 text-3xl font-semibold tracking-tight">
            Welcome back, {user.name.split(" ")[0]}
          </h1>
          <p className="mt-2 text-muted-foreground">
            Keep your bill records accurate and up to date.
          </p>
        </div>
        <UploadDialog />
      </section>

      <section className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <MetricCard title="Total bills" value={total} icon={<FileText className="size-4" />} description="All uploaded records" />
        <Card>
          <CardHeader className="pb-3">
            <CardDescription>Pending review</CardDescription>
            <CardTitle className="text-3xl">{pending.toLocaleString("en-IN")}</CardTitle>
          </CardHeader>
          <CardContent>
            <Link href="/dashboard/bills?status=pending" className="inline-flex items-center gap-1 text-sm font-medium text-primary hover:underline">
              Review bills <ArrowUpRight className="size-4" />
            </Link>
          </CardContent>
        </Card>
        <MetricCard title="Confirmed bills" value={confirmed} icon={<CheckCircle2 className="size-4 text-emerald-600" />} description="Ready for export" />
        <Card>
          <CardHeader className="pb-3">
            <CardDescription>Review progress</CardDescription>
            <CardTitle className="text-3xl">{reviewedPercentage}%</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-2 overflow-hidden rounded-full bg-muted">
              <div className="h-full rounded-full bg-primary transition-all" style={{ width: `${reviewedPercentage}%` }} />
            </div>
          </CardContent>
        </Card>
      </section>

      <section className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_320px]">
        <Card>
          <CardHeader className="flex flex-row items-start justify-between gap-4">
            <div>
              <CardTitle>Recent bills</CardTitle>
              <CardDescription>Your latest uploaded records.</CardDescription>
            </div>
            <Link href="/dashboard/bills" className={buttonVariants({ variant: "outline", size: "sm" })}>View all</Link>
          </CardHeader>
          <CardContent className="px-0">
            {recentBills.length === 0 ? (
              <div className="flex flex-col items-center gap-3 px-6 py-12 text-center">
                <ReceiptText className="size-10 text-muted-foreground/50" />
                <div>
                  <p className="font-medium">No bills uploaded yet</p>
                  <p className="text-sm text-muted-foreground">Upload your first bill to start tracking records.</p>
                </div>
              </div>
            ) : (
              <Table>
                <TableHeader><TableRow><TableHead>Vendor</TableHead><TableHead>Date</TableHead><TableHead>Status</TableHead><TableHead className="text-right">Total</TableHead></TableRow></TableHeader>
                <TableBody>
                  {recentBills.map((bill) => (
                    <TableRow key={bill.id}>
                      <TableCell className="font-medium"><Link href={`/dashboard/bills/${bill.id}/review`} className="hover:underline">{bill.vendorName || "Unknown vendor"}</Link></TableCell>
                      <TableCell className="text-muted-foreground">{formatDate(bill.createdAt)}</TableCell>
                      <TableCell><Badge variant={bill.status === "CONFIRMED" ? "default" : "secondary"}>{bill.status === "CONFIRMED" ? "Confirmed" : "Pending"}</Badge></TableCell>
                      <TableCell className="text-right tabular-nums">{formatMoney(bill.total)}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader><CardTitle>Quick actions</CardTitle><CardDescription>Common tasks for your workspace.</CardDescription></CardHeader>
          <CardContent className="grid gap-3">
            <UploadDialog />
            <Link href="/dashboard/bills?status=pending" className={buttonVariants({ variant: "outline", className: "justify-start" })}><Clock3 className="size-4" />Review pending bills</Link>
            <Link href="/dashboard/bills?status=confirmed" className={buttonVariants({ variant: "outline", className: "justify-start" })}><CheckCircle2 className="size-4" />Browse confirmed bills</Link>
            <Link href="/dashboard/bills" className={buttonVariants({ variant: "outline", className: "justify-start" })}><Upload className="size-4" />Manage all bills</Link>
          </CardContent>
        </Card>
      </section>
    </div>
  );
};

function MetricCard({
  title,
  value,
  icon,
  description,
}: {
  title: string;
  value: number;
  icon: React.ReactNode;
  description: string;
}) {
  return (
    <Card>
      <CardHeader className="pb-3">
        <CardDescription>{title}</CardDescription>
        <CardTitle className="text-3xl">{value.toLocaleString("en-IN")}</CardTitle>
      </CardHeader>
      <CardContent><div className="flex items-center gap-2 text-sm text-muted-foreground">{icon}{description}</div></CardContent>
    </Card>
  );
}

function DashboardLoading() {
  return (
    <div className="mx-auto max-w-7xl animate-pulse space-y-8 p-4 md:p-8">
      <div className="h-10 w-64 rounded bg-muted" />
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">{Array.from({ length: 4 }).map((_, i) => <div key={i} className="h-32 rounded-xl bg-muted" />)}</div>
      <div className="h-80 rounded-xl bg-muted" />
    </div>
  );
}
