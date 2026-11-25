import type { Metadata } from "next";
import { BlogCatalog } from "@/components/BlogCatalog";
import { InnerPageHero, PageContent } from "@/components/InnerPage";
import { SiteFooter } from "@/components/SiteFooter";
import styles from "./page.module.css";

export const metadata: Metadata = {
  title: "Stories & Updates — Colgar Foundation",
  description: "Stories and updates from Colgar Foundation's outreach, youth, and community programs."
};

export default function BlogPage() {
  return (
    <div className={styles.page}>
      <main id="main">
        <InnerPageHero
          breadcrumb={[{ label: "Home", href: "/" }, { label: "Blog" }]}
          eyebrow="Notes from the field"
          title={<>Stories that<br /><em>stay with you.</em></>}
          description="Meet the people, places, and small moments behind Colgar’s community work."
        />
        <PageContent>
          <div className="section-heading">
            <div><span className="eyebrow">Colgar journal</span><h2>Latest stories<br /><em>&amp; updates.</em></h2></div>
            <p>Outreach notes, campaign updates, and reflections from the Colgar community.</p>
          </div>
          <BlogCatalog />
        </PageContent>
      </main>
      <SiteFooter page="blog" />
    </div>
  );
}
