import { DashboardContent } from "./_components/dashboard-content";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Dashboard",
  description: "View your bill activity, review progress, and recent uploads.",
};

export default function DashboardPage() {
  return <DashboardContent />;
}
