import type { Metadata } from "next";
import { AppLink } from "@/components/AppLink";
import { InnerPageHero, PageContent } from "@/components/InnerPage";
import { SiteFooter } from "@/components/SiteFooter";
import styles from "./page.module.css";

export const metadata: Metadata = {
  title: "Donate — Colgar Foundation",
  description:
    "Support Colgar's youth programs with a donation toward school fees, menstrual care, and community outreach."
};

export default function DonatePage() {
  return (
    <div className={styles.page}>
      <main id="main">
        <InnerPageHero
          breadcrumb={[{ label: "Home", href: "/" }, { label: "Donate" }]}
          eyebrow="Give what you can"
          title={<>Good things grow<br /><em>when we share.</em></>}
          description="Your support helps Colgar turn community care into real opportunities for young people in Nigeria."
        />
        <PageContent>
          <div className="donation-grid">
            <div className="donation-copy">
              <span className="eyebrow">Your support in action</span>
              <h2>Every contribution helps move care forward.</h2>
              <p>Donations support the work Colgar does with communities: helping children with school fees and learning materials, providing menstrual care, and backing youth empowerment and outreach programs.</p>
              <div className="donation-choices">
                <div className="donation-choice"><strong>School support</strong><span>Fees, books, and learning supplies</span></div>
                <div className="donation-choice"><strong>Ladies Care</strong><span>Menstrual products and awareness</span></div>
                <div className="donation-choice"><strong>Community care</strong><span>Cloth Bank and outreach programs</span></div>
                <div className="donation-choice"><strong>Youth programs</strong><span>Wellbeing and empowerment</span></div>
              </div>
              <AppLink className="text-link text-link-dark" href="/campaigns">Explore current campaigns <span aria-hidden="true">↗</span></AppLink>
            </div>
            <aside>
              <div className="donation-panel">
                <span className="eyebrow">Secure contribution</span>
                <h3>Choose how you’d like to help.</h3>
                <p>Colgar’s donation form accepts one-time or recurring contributions and has a minimum payable amount of ₦2,000.</p>
                <ul>
                  <li>Your name and email are required on the official form.</li>
                  <li>Choose an amount that works for you.</li>
                  <li>Recurring donations are optional.</li>
                </ul>
                <AppLink className="button button-rust" href="https://www.colgar.org/donate/">
                  Continue to Colgar’s donation form <span aria-hidden="true">↗</span>
                </AppLink>
                <p className="preview-notice">Payments are completed on Colgar’s official site. This local redesign preview does not collect or process payment details.</p>
              </div>
              <div className="donation-panel">
                <h3>Prefer another way to support?</h3>
                <p>Become a volunteer, sponsor a program, or get in touch with the team.</p>
                <AppLink className="text-link text-link-dark" href="/volunteer">Explore volunteering <span aria-hidden="true">↗</span></AppLink>
              </div>
            </aside>
          </div>
        </PageContent>
      </main>
      <SiteFooter page="donate" />
    </div>
  );
}
