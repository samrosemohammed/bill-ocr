import Link from "next/link";

const DashboardPage = async () => {
  return (
    <div className="mx-auto max-w-6xl space-y-6 p-4 md:p-6">
      <h1>Overview Page Comming Soon!!</h1>
      <Link href="/dashboard/bills" className="underline">
        View Bills
      </Link>
    </div>
  );
};

export default DashboardPage;
