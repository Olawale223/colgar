import type { Metadata } from "next";
import { AppLink } from "@/components/AppLink";
import { InnerPageHero, PageContent } from "@/components/InnerPage";
import { Photo } from "@/components/Photo";
import { SiteFooter } from "@/components/SiteFooter";
import styles from "./page.module.css";

export const metadata: Metadata = {
  title: "Colgar Events — Gather for good",
  description: "Colgar events bring people together for fundraising, entertainment, and community-led change."
};

export default function EventPage() {
  return (
    <div className={styles.page}>
      <main id="main">
        <InnerPageHero
          breadcrumb={[{ label: "Home", href: "/" }, { label: "Events" }]}
          eyebrow="Gather for good"
          title={<>Good causes.<br /><em>Good company.</em></>}
          description="Colgar events bring people together for a little joy and a lot of community-powered change."
        />
        <PageContent>
          <div className="event-panel">
            <div className="event-panel-image">
              <Photo
                src="https://www.colgar.org/wp-content/uploads/2025/06/COLGA-82-420x300.jpg"
                alt="Colgar community outreach with students"
                priority
                sizes="(max-width: 620px) 100vw, (max-width: 920px) 50vw, 650px"
              />
            </div>
            <div className="event-panel-copy">
              <span className="event-past">Past event · 25 July 2025</span>
              <h2>Social Construction 102</h2>
              <p>An outdoor movie night for a cause. Proceeds support school fees, books, learning aids, and other essentials for children in Nigeria.</p>
              <div className="event-facts">
                <div className="event-fact"><span>Date</span><strong>25 July 2025</strong></div>
                <div className="event-fact"><span>Time</span><strong>5:00 pm – 12:00 am</strong></div>
                <div className="event-fact"><span>Venue</span><strong>Garden 66, Ilorin, Kwara</strong></div>
                <div className="event-fact"><span>Type</span><strong>Party or social gathering</strong></div>
              </div>
              <AppLink className="button button-rust" href="/social-construction">
                About the cause <span aria-hidden="true">↗</span>
              </AppLink>
            </div>
          </div>
          <p className="editorial-note">“One night. One ticket. A lifetime of change.”</p>
          <p className="shop-note center-note">This event listing is kept as an archive. Visit the Social Construction page for the campaign background and current ways to support the work.</p>
        </PageContent>
      </main>
      <SiteFooter page="event" />
    </div>
  );
}
