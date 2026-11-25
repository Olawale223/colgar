import type { Metadata } from "next";
import { AppLink } from "@/components/AppLink";
import { InnerPageHero, PageContent } from "@/components/InnerPage";
import { SiteFooter } from "@/components/SiteFooter";
import styles from "./page.module.css";

export const metadata: Metadata = {
  title: "Volunteer with Colgar — Colgar Foundation",
  description:
    "Volunteer with Colgar to support youth empowerment, mental health awareness, and community outreach programs."
};

const roles = [
  "General volunteer",
  "Content & writing",
  "Design & comics",
  "Photography & video",
  "Community management",
  "Research & data",
  "Event planning",
  "Health & outreach",
  "Web & digital",
  "SDG advocacy"
];

export default function VolunteerPage() {
  return (
    <div className={styles.page}>
      <main id="main">
        <InnerPageHero
          breadcrumb={[{ label: "Home", href: "/" }, { label: "Volunteer" }]}
          eyebrow="Bring your time, skills, and ideas"
          title={<>Show up for<br /><em>your community.</em></>}
          description="Colgar welcomes people who want to support youth empowerment, mental health awareness, and community programs for people who need a hand."
        />
        <PageContent>
          <div className="volunteer-grid">
            <div className="volunteer-copy">
              <span className="eyebrow">There’s a place for you</span>
              <h2>Many skills.<br />One community.</h2>
              <p>Whether you can help on the ground, share a professional skill, or support the planning behind an event, your contribution can make a difference.</p>
              <h3>Ways to get involved</h3>
              <div className="role-tags">{roles.map((role) => <span key={role}>{role}</span>)}</div>
            </div>
            <div>
              <div className="volunteer-panel">
                <span className="eyebrow">Volunteer call</span>
                <h3>Help good work reach further.</h3>
                <p>Colgar’s volunteer call is open to people who want to contribute to programs supporting young people and less-privileged communities.</p>
                <ul>
                  <li>Volunteer in person or support both in-person and remote work.</li>
                  <li>Applicants are asked to be 18 or older and to share their state of residence.</li>
                  <li>Areas include Ladies Care, Cloth Bank, mental health awareness, education, and outreach.</li>
                </ul>
                <AppLink className="button button-rust" href="https://forms.gle/epyCTdjS75KDfpfb9">
                  Apply through the volunteer form <span aria-hidden="true">↗</span>
                </AppLink>
                <p className="preview-notice">Applications are collected through Colgar’s official Google Form. This page is a redesigned overview and does not submit applications.</p>
              </div>
              <div className="volunteer-panel">
                <span className="eyebrow">A note on giving</span>
                <h3>Volunteering can look different for everyone.</h3>
                <p>The form asks whether volunteers can contribute a minimum of ₦2,000 monthly; it also offers “No” as an answer. Financial contributions are optional and separate from the skills you bring.</p>
                <AppLink className="text-link text-link-dark" href="/donate">Learn about donations <span aria-hidden="true">↗</span></AppLink>
              </div>
            </div>
          </div>
        </PageContent>
      </main>
      <SiteFooter page="volunteer" />
    </div>
  );
}
