import type { Metadata } from "next";
import { Suspense } from "react";
import { UnsubscribeForm } from "@/components/UnsubscribeForm";

export const metadata: Metadata = {
  title: "Unsubscribe — Colgar Foundation",
  robots: { index: false, follow: false }
};

export default function UnsubscribePage() {
  return (
    <Suspense fallback={<main id="main">Loading subscription preferences…</main>}>
      <UnsubscribeForm />
    </Suspense>
  );
}
