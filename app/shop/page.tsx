import type { Metadata } from "next";
import { InnerPageHero, PageContent } from "@/components/InnerPage";
import { ShopCatalog } from "@/components/ShopCatalog";
import { SiteFooter } from "@/components/SiteFooter";
import styles from "./page.module.css";

export const metadata: Metadata = {
  title: "Colgar Shop — Wear a little good",
  description: "Shop Colgar merchandise and support youth-led community programs in Nigeria."
};

export default function ShopPage() {
  return (
    <div className={styles.page}>
      <main id="main">
        <InnerPageHero
          breadcrumb={[{ label: "Home", href: "/" }, { label: "Shop" }]}
          eyebrow="Good things, good company"
          title={<>Wear a little<br /><em>good.</em></>}
          description="Colgar merch brings our community along for the journey. Browse the current collection and find your new favourite."
        />
        <PageContent>
          <div className="section-heading">
            <div><span className="eyebrow">Colgar community shop</span><h2>Made for showing<br /><em>up together.</em></h2></div>
            <p>Clothing, totes, and small everyday reminders of the work we do together.</p>
          </div>
          <ShopCatalog />
          <p className="shop-note">Prices and availability may change. Product details include the options currently listed for each item.</p>
        </PageContent>
      </main>
      <SiteFooter page="shop" />
    </div>
  );
}
