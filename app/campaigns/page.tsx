import type { Metadata } from "next";
import { AppLink } from "@/components/AppLink";
import { CampaignCard } from "@/components/CampaignCard";
import { InnerPageHero, PageContent } from "@/components/InnerPage";
import { Photo } from "@/components/Photo";
import { SiteFooter } from "@/components/SiteFooter";
import styles from "./page.module.css";

export const metadata: Metadata = {
  title: "Our Campaigns — Colgar Foundation",
  description:
    "Explore Colgar campaigns supporting menstrual health, clothing access, education, and dignity in Nigeria."
};

const campaigns = [
  {
    href: "/campaign-ladies-care",
    image: "https://www.colgar.org/wp-content/uploads/2025/06/COLGA-82-420x300.jpg",
    alt: "Colgar Ladies Care outreach with students",
    location: "Abuja",
    description:
      "Helping girls stay in school with access to menstrual products, health awareness, and a supportive community.",
    meta: ["400 pads raised", "Goal reached"],
    link: "Explore Abuja campaign"
  },
  {
    href: "/campaign-ladies-care-lagos",
    image: "https://www.colgar.org/wp-content/uploads/2023/08/femalecare2-300x208.jpg",
    alt: "Colgar Ladies Care Lagos outreach",
    location: "Lagos",
    description: "A community campaign for menstrual care, confidence, and wellbeing.",
    meta: ["₦600,000 target", "Completed"],
    link: "Explore Lagos campaign"
  }
];

export default function CampaignsPage() {
  return (
    <div className={styles.page}>
      <main id="main">
        <InnerPageHero
          breadcrumb={[{ label: "Home", href: "/" }, { label: "Campaigns" }]}
          eyebrow="Good work, close to home"
          title={<>Small acts.<br /><em>Real impact.</em></>}
          description="Colgar campaigns turn community support into practical care — helping girls stay healthy, confident, and in school."
        />
        <PageContent>
          <AppLink className="campaign-featured" href="/social-construction">
            <div className="campaign-featured-image">
              <Photo
                src="https://www.colgar.org/wp-content/uploads/2025/06/COLGA-82-420x300.jpg"
                alt="Colgar students and community members at an outreach"
                priority
                sizes="(max-width: 620px) 100vw, 450px"
              />
            </div>
            <div className="campaign-featured-copy">
              <span className="campaign-featured-label">Featured · Movie night for a cause</span>
              <h2>Social<br /><em>Construction.</em></h2>
              <p>One night. One ticket. A lifetime of change. Help raise funds for school fees, books, and learning materials.</p>
              <span className="campaign-featured-link">Explore Social Construction <b aria-hidden="true">↗</b></span>
            </div>
          </AppLink>
          <div className="section-heading">
            <div><span className="eyebrow">Our programs</span><h2>Care that keeps<br /><em>showing up.</em></h2></div>
            <p>Meet the initiatives, see what they do, and find a way to be part of the change.</p>
          </div>
          <div className={styles.grid}>
            {campaigns.map((campaign) => (
              <CampaignCard
                key={campaign.href}
                href={campaign.href}
                image={campaign.image}
                alt={campaign.alt}
                location={campaign.location}
                description={campaign.description}
                meta={campaign.meta}
                linkLabel={campaign.link}
                priority={campaign.location === "Abuja"}
              />
            ))}
          </div>
          <p className="shop-note">Campaign descriptions and figures are based on information published by Colgar. Follow the links for the latest program details.</p>
        </PageContent>
      </main>
      <SiteFooter page="campaigns" />
    </div>
  );
}
