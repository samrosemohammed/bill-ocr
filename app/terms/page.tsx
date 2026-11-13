import Link from "next/link";
import { ArrowLeft } from "lucide-react";

import { Brand } from "@/components/brand";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Terms of Service",
  description:
    "Review the terms that apply when you create an account or use Bill OCR.",
};

export default function TermsPage() {
  return (
    <main className="min-h-svh bg-muted/30">
      <header className="border-b bg-background">
        <div className="mx-auto flex h-16 max-w-4xl items-center justify-between px-4 md:px-8">
          <Link href="/" className="flex items-center gap-2.5">
            <Brand />
            <span className="font-heading text-lg font-semibold">Bill OCR</span>
          </Link>
          <Link
            href="/"
            className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground"
          >
            <ArrowLeft className="size-4" />
            Back home
          </Link>
        </div>
      </header>
      <article className="mx-auto max-w-3xl space-y-8 px-4 py-12 md:px-8 md:py-20">
        <div>
          <p className="text-sm font-medium text-primary">Legal</p>
          <h1 className="mt-2 font-heading text-4xl font-semibold tracking-tight">
            Terms of Service
          </h1>
          <p className="mt-3 text-sm text-muted-foreground">
            Last updated: November 12, 2026
          </p>
        </div>
        <div className="space-y-8 text-sm leading-7 text-muted-foreground">
          <section>
            <h2 className="mb-2 text-lg font-semibold text-foreground">
              1. Accepting these terms
            </h2>
            <p>
              By creating an account or using Bill OCR, you agree to these
              Terms of Service. If you do not agree, please do not use the
              service.
            </p>
          </section>
          <section>
            <h2 className="mb-2 text-lg font-semibold text-foreground">
              2. Using Bill OCR
            </h2>
            <p>
              Bill OCR provides tools to upload, extract, review, organize,
              and export bill information. You are responsible for the
              accuracy of information you submit and for using the service in
              compliance with applicable laws.
            </p>
          </section>
          <section>
            <h2 className="mb-2 text-lg font-semibold text-foreground">
              3. Your account
            </h2>
            <p>
              Keep your account credentials confidential and notify us if you
              believe your account has been accessed without permission. You
              are responsible for activity that occurs under your account.
            </p>
          </section>
          <section>
            <h2 className="mb-2 text-lg font-semibold text-foreground">
              4. Your content
            </h2>
            <p>
              You retain ownership of the bills and other content you upload.
              You grant Bill OCR the limited permission needed to process,
              store, and display that content to provide the service.
            </p>
          </section>
          <section>
            <h2 className="mb-2 text-lg font-semibold text-foreground">
              5. Changes and availability
            </h2>
            <p>
              We may improve, change, or temporarily suspend parts of the
              service. We may also update these terms; continued use after an
              update means you accept the revised terms.
            </p>
          </section>
          <section>
            <h2 className="mb-2 text-lg font-semibold text-foreground">
              6. Contact
            </h2>
            <p>
              If you have questions about these terms, contact the Bill OCR
              team through the support channel provided with your account.
            </p>
          </section>
        </div>
      </article>
    </main>
  );
}
