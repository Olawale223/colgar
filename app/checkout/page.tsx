import type { Metadata } from "next";
import { CheckoutContents } from "@/components/CheckoutContents";
import { InnerPageHero, PageContent } from "@/components/InnerPage";
import { SiteFooter } from "@/components/SiteFooter";
import styles from "./page.module.css";

export const metadata: Metadata = {
  title: "Checkout — Colgar Shop",
  description: "Review your Colgar shop order."
};

export default async function CheckoutPage({
  searchParams
}: {
  searchParams: Promise<{ payment?: string | string[] }>;
}) {
  const { payment } = await searchParams;
  const paymentStatus = payment === "success" || payment === "failed" ? payment : undefined;

  return (
    <div className={styles.page}>
      <main id="main">
        <InnerPageHero
          breadcrumb={[{ label: "Home", href: "/" }, { label: "Shop", href: "/shop" }, { label: "Checkout" }]}
          eyebrow="Almost there"
          title={<>A thoughtful<br /><em>next step.</em></>}
          description="Add delivery details and review your order."
        />
        <PageContent><CheckoutContents paymentStatus={paymentStatus} /></PageContent>
      </main>
      <SiteFooter page="shop" />
    </div>
  );
}
