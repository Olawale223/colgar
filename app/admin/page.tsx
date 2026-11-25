import type { Metadata } from "next";
import { AdminDashboard } from "@/components/AdminDashboard";

export const metadata: Metadata = {
  title: "Admin Studio — Colgar Foundation",
  description: "Manage Colgar Foundation blog stories, shop products, subscribers, and finance records."
};

export default function AdminPage() {
  return <AdminDashboard />;
}
