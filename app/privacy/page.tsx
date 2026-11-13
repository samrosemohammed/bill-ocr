import Link from "next/link";
import { ArrowLeft } from "lucide-react";

import { Brand } from "@/components/brand";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Privacy Policy",
  description:
    "Learn how Bill OCR collects, uses, and protects your account and bill information.",
};

export default function PrivacyPage() {
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
            Privacy Policy
          </h1>
          <p className="mt-3 text-sm text-muted-foreground">
            Last updated: November 12, 2026
          </p>
        </div>
        <div className="space-y-8 text-sm leading-7 text-muted-foreground">
          <section>
            <h2 className="mb-2 text-lg font-semibold text-foreground">
              1. Information we collect
            </h2>
            <p>
              We collect account information such as your name and email
              address, authentication information, and the bills or files you
              choose to upload to your workspace.
            </p>
          </section>
          <section>
            <h2 className="mb-2 text-lg font-semibold text-foreground">
              2. How we use information
            </h2>
            <p>
              We use this information to authenticate you, provide bill
              extraction and review features, keep your workspace available,
              protect the service, and communicate important account updates.
            </p>
          </section>
          <section>
            <h2 className="mb-2 text-lg font-semibold text-foreground">
              3. Bill data
            </h2>
            <p>
              Uploaded bill images and extracted details are used to provide
              the features you request. Do not upload information that you are
              not authorized to process.
            </p>
          </section>
          <section>
            <h2 className="mb-2 text-lg font-semibold text-foreground">
              4. Sharing and security
            </h2>
            <p>
              We do not sell your personal information. We may use trusted
              service providers to operate Bill OCR, subject to appropriate
              safeguards. We use reasonable technical and organizational
              measures to protect your information, but no online service can
              guarantee absolute security.
            </p>
          </section>
          <section>
            <h2 className="mb-2 text-lg font-semibold text-foreground">
              5. Your choices
            </h2>
            <p>
              You can manage your account and security settings from your
              dashboard. You may stop using the service at any time; requests
              about account data can be made through the support channel
              provided with your account.
            </p>
          </section>
          <section>
            <h2 className="mb-2 text-lg font-semibold text-foreground">
              6. Policy updates
            </h2>
            <p>
              We may update this policy as the service changes. The updated
              version will be posted on this page with a revised date.
            </p>
          </section>
        </div>
      </article>
    </main>
  );
}
