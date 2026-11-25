import type { Metadata } from "next";
import { Suspense } from "react";
import { AdminLogin } from "@/components/AdminLogin";

export const metadata: Metadata = {
  title: "Staff sign in — Colgar Foundation",
  robots: { index: false, follow: false }
};

export default function AdminLoginPage() {
  return <Suspense fallback={<main id="main" />}>
    <AdminLogin />
  </Suspense>;
}
