import type { Metadata } from "next";
import { CartContents } from "@/components/CartContents";
import { InnerPageHero, PageContent } from "@/components/InnerPage";
import { SiteFooter } from "@/components/SiteFooter";
import styles from "./page.module.css";

export const metadata: Metadata = {
  title: "Your Cart — Colgar Shop",
  description: "Review your Colgar shop items."
};

export default function CartPage() {
  return (
    <div className={styles.page}>
      <main id="main">
        <InnerPageHero
          breadcrumb={[{ label: "Home", href: "/" }, { label: "Shop", href: "/shop" }, { label: "Cart" }]}
          eyebrow="Your Colgar shop bag"
          title={<>A little good,<br /><em>all together.</em></>}
          description="Review your picks before you continue."
        />
        <PageContent><CartContents /></PageContent>
      </main>
      <SiteFooter page="shop" />
    </div>
  );
}
