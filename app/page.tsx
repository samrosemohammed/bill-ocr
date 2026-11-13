import Link from "next/link";
import {
  ArrowRight,
  CheckCircle2,
  FileCheck2,
  FileText,
  LockKeyhole,
  Sparkles,
} from "lucide-react";

import { Brand } from "@/components/brand";
import { buttonVariants } from "@/components/ui/button";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Simple bill management",
  description:
    "Capture, review, and organize your bills with a faster, simpler workflow.",
};

const features = [
  {
    icon: FileText,
    title: "One organized workspace",
    description:
      "Keep every uploaded bill in one searchable place instead of scattered folders and spreadsheets.",
  },
  {
    icon: Sparkles,
    title: "Less manual data entry",
    description:
      "Turn bill images into structured records quickly, then review the extracted details before saving.",
  },
  {
    icon: LockKeyhole,
    title: "Built with privacy in mind",
    description:
      "Your workspace is protected by secure authentication and clear account controls.",
  },
];

export default function Home() {
  return (
    <main className="min-h-svh overflow-hidden">
      <header className="border-b bg-background/80 backdrop-blur">
        <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 md:px-8">
          <Link href="/" className="flex items-center gap-2.5">
            <Brand />
            <span className="font-heading text-lg font-semibold">Bill OCR</span>
          </Link>

          <nav className="flex items-center gap-2">
            <Link
              className={buttonVariants({ variant: "ghost", size: "sm" })}
              href="/login"
            >
              Log in
            </Link>
            <Link
              className={buttonVariants({ variant: "default", size: "sm" })}
              href="/sign-up"
            >
              Get started
            </Link>
          </nav>
        </div>
      </header>

      <section className="relative">
        <div className="absolute inset-0 -z-10 bg-[radial-gradient(circle_at_top_right,oklch(0.92_0.08_264),transparent_38%)]" />
        <div className="mx-auto grid max-w-7xl gap-12 px-4 py-20 md:px-8 md:py-28 lg:grid-cols-[1.05fr_0.95fr] lg:items-center lg:gap-20">
          <div>
            <div className="mb-6 inline-flex items-center gap-2 rounded-full border bg-background/80 px-3 py-1.5 text-sm text-muted-foreground shadow-sm">
              <span className="size-2 rounded-full bg-emerald-500" />
              Smarter bill management
            </div>
            <h1 className="max-w-3xl font-heading text-5xl font-semibold leading-[1.05] tracking-tight md:text-7xl">
              Your bills,
              <span className="block text-primary">finally organized.</span>
            </h1>
            <p className="mt-6 max-w-xl text-lg leading-8 text-muted-foreground">
              Bill OCR helps you capture, review, and manage bill information
              without the repetitive data entry. Upload a bill and keep your
              records moving.
            </p>
            <div className="mt-8 flex flex-col gap-3 sm:flex-row">
              <Link
                className={buttonVariants({ variant: "default", size: "lg" })}
                href="/sign-up"
              >
                Start for free
                <ArrowRight />
              </Link>
              <Link
                className={buttonVariants({ variant: "outline", size: "lg" })}
                href="/login"
              >
                Sign in to your workspace
              </Link>
            </div>
            <div className="mt-8 flex flex-wrap gap-x-6 gap-y-3 text-sm text-muted-foreground">
              <span className="inline-flex items-center gap-2">
                <CheckCircle2 className="size-4 text-emerald-600" />
                Simple review workflow
              </span>
              <span className="inline-flex items-center gap-2">
                <CheckCircle2 className="size-4 text-emerald-600" />
                Export-ready records
              </span>
            </div>
          </div>

          <div className="relative mx-auto w-full max-w-lg">
            <div className="absolute -inset-4 rounded-[2rem] bg-primary/10 blur-2xl" />
            <div className="relative overflow-hidden rounded-3xl border bg-card p-4 shadow-2xl shadow-primary/10">
              <div className="rounded-2xl bg-muted/50 p-5">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-xs font-medium uppercase tracking-wider text-muted-foreground">
                      Workspace overview
                    </p>
                    <p className="mt-1 font-heading text-xl font-semibold">
                      Your bill activity
                    </p>
                  </div>
                  <div className="flex size-10 items-center justify-center rounded-xl bg-primary text-primary-foreground">
                    <FileCheck2 className="size-5" />
                  </div>
                </div>
                <div className="mt-6 grid grid-cols-2 gap-3">
                  <div className="rounded-xl border bg-background p-4">
                    <p className="text-xs text-muted-foreground">Total bills</p>
                    <p className="mt-2 text-2xl font-semibold">128</p>
                    <p className="mt-1 text-xs text-emerald-600">
                      +12 this month
                    </p>
                  </div>
                  <div className="rounded-xl border bg-background p-4">
                    <p className="text-xs text-muted-foreground">Reviewed</p>
                    <p className="mt-2 text-2xl font-semibold">94%</p>
                    <div className="mt-3 h-1.5 rounded-full bg-muted">
                      <div className="h-full w-[94%] rounded-full bg-primary" />
                    </div>
                  </div>
                </div>
                <div className="mt-3 rounded-xl border bg-background p-4">
                  <div className="flex items-center justify-between">
                    <p className="text-sm font-medium">Recent uploads</p>
                    <span className="text-xs text-muted-foreground">Today</span>
                  </div>
                  {["Himalayan Supplies", "City Mart", "Everest Traders"].map(
                    (vendor, index) => (
                      <div
                        key={vendor}
                        className="mt-4 flex items-center justify-between border-t pt-3"
                      >
                        <div className="flex items-center gap-3">
                          <span className="flex size-8 items-center justify-center rounded-lg bg-primary/10 text-primary">
                            <FileText className="size-4" />
                          </span>
                          <span className="text-sm font-medium">{vendor}</span>
                        </div>
                        <span className="text-xs text-muted-foreground">
                          {index === 0 ? "Confirmed" : "Pending"}
                        </span>
                      </div>
                    ),
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="border-y bg-muted/30">
        <div className="mx-auto grid max-w-7xl gap-4 px-4 py-16 md:grid-cols-3 md:px-8">
          {features.map((feature) => (
            <div key={feature.title} className="rounded-2xl border bg-card p-6">
              <div className="flex size-10 items-center justify-center rounded-xl bg-primary/10 text-primary">
                <feature.icon className="size-5" />
              </div>
              <h2 className="mt-5 font-heading text-lg font-semibold">
                {feature.title}
              </h2>
              <p className="mt-2 text-sm leading-6 text-muted-foreground">
                {feature.description}
              </p>
            </div>
          ))}
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-4 py-20 text-center md:px-8 md:py-28">
        <h2 className="font-heading text-3xl font-semibold tracking-tight md:text-5xl">
          Make every bill easier to manage.
        </h2>
        <p className="mx-auto mt-4 max-w-xl text-muted-foreground">
          Start building a cleaner, more reliable bill workflow today.
        </p>
        <Link
          className={buttonVariants({ variant: "default", size: "lg" })}
          href="/sign-up"
        >
          Create your workspace
          <ArrowRight />
        </Link>
      </section>

      <footer className="border-t">
        <div className="mx-auto flex max-w-7xl flex-col gap-4 px-4 py-8 text-sm text-muted-foreground sm:flex-row sm:items-center sm:justify-between md:px-8">
          <p>© {new Date().getFullYear()} Bill OCR. All rights reserved.</p>
          <div className="flex gap-4">
            <Link href="/terms" className="hover:text-foreground">
              Terms of Service
            </Link>
            <Link href="/privacy" className="hover:text-foreground">
              Privacy Policy
            </Link>
          </div>
        </div>
      </footer>
    </main>
  );
}
