import type { ReactNode } from "react";
import { AppLink } from "@/components/AppLink";
import { ButtonLink } from "@/components/ButtonLink";
import { InnerPageHero, PageContent, type BreadcrumbItem } from "@/components/InnerPage";
import { Photo } from "@/components/Photo";
import { SiteFooter, type FooterPage } from "@/components/SiteFooter";
import styles from "./CampaignDetailPage.module.css";

export type CampaignDetailData = {
  footerPage: FooterPage;
  breadcrumb: BreadcrumbItem[];
  eyebrow: string;
  title: ReactNode;
  description: string;
  image: string;
  imageAlt: string;
  kicker: string;
  heading: string;
  paragraphs: string[];
  stats: { value: string; label: string }[];
  progress?: { label: string; value: string; ariaLabel: string };
  action: { label: string; href: string };
  palette?: boolean;
  section: {
    eyebrow: string;
    heading: string;
    description: string;
    features?: string[];
    link?: { label: string; href: string };
  };
  note?: string;
};

export function CampaignDetailPage({ data }: { data: CampaignDetailData }) {
  return (
    <>
      <main id="main">
        <InnerPageHero
          breadcrumb={data.breadcrumb}
          eyebrow={data.eyebrow}
          title={data.title}
          description={data.description}
        />
        <PageContent className={styles.detailPage}>
          <div className="detail-grid">
            <div className="detail-photo">
              <Photo
                src={data.image}
                alt={data.imageAlt}
                priority
                sizes="(max-width: 620px) 100vw, (max-width: 920px) 720px, 570px"
              />
            </div>
            <div className="detail-copy">
              <span className="detail-kicker">{data.kicker}</span>
              <h2>{data.heading}</h2>
              {data.paragraphs.map((paragraph) => <p key={paragraph}>{paragraph}</p>)}
              <div className="detail-stats">
                {data.stats.map((stat) => (
                  <div className="detail-stat" key={stat.label}>
                    <strong>{stat.value}</strong>
                    <span>{stat.label}</span>
                  </div>
                ))}
              </div>
              {data.progress && (
                <>
                  <div className="goal-copy">
                    <span>{data.progress.label}</span>
                    <strong>{data.progress.value}</strong>
                  </div>
                  <div
                    className="goal-bar"
                    role="progressbar"
                    aria-label={data.progress.ariaLabel}
                    aria-valuenow={100}
                    aria-valuemin={0}
                    aria-valuemax={100}
                  >
                    <span style={{ width: "100%" }} />
                  </div>
                </>
              )}
              <ButtonLink href={data.action.href}>
                {data.action.label} <span aria-hidden="true">↗</span>
              </ButtonLink>
              {data.palette && (
                <div className="palette-bar" aria-label="Colgar Female Care color palette">
                  <span />
                  <span />
                  <span />
                  <span />
                  <span />
                </div>
              )}
            </div>
          </div>
          <section className="detail-section">
            <span className="eyebrow">{data.section.eyebrow}</span>
            <h2>{data.section.heading}</h2>
            <p>{data.section.description}</p>
            {data.section.features && (
              <ul className="feature-list">
                {data.section.features.map((feature) => <li key={feature}>{feature}</li>)}
              </ul>
            )}
            {data.section.link && (
              <AppLink className="text-link text-link-dark" href={data.section.link.href}>
                {data.section.link.label} <span aria-hidden="true">↗</span>
              </AppLink>
            )}
          </section>
          {data.note && <p className="shop-note">{data.note}</p>}
        </PageContent>
      </main>
      <SiteFooter page={data.footerPage} />
    </>
  );
}
