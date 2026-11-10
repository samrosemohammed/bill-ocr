import Link from "next/link";

export default function Home() {
  return (
    <div className="container max-w-7xl mx-auto py-4">
      <h1>Landing Page Comming Soon!!</h1>
      <Link href="/dashboard/bills" className="underline">
        View Bills
      </Link>
    </div>
  );
}
