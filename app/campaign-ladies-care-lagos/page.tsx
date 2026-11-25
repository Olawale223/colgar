import type { Metadata } from "next";
import { CampaignDetailPage, type CampaignDetailData } from "@/components/CampaignDetailPage";
import styles from "./page.module.css";

export const metadata: Metadata = {
  title: "Colgar Ladies Care Lagos — Colgar Foundation",
  description: "Colgar Ladies Care Lagos supported menstrual care and wellbeing for girls."
};

const data: CampaignDetailData = {
  footerPage: "careLagos",
  breadcrumb: [
    { label: "Home", href: "/" },
    { label: "Campaigns", href: "/campaigns" },
    { label: "Lagos" }
  ],
  eyebrow: "Menstrual health · Lagos",
  title: <>Colgar Ladies<br /><em>Care.</em></>,
  description: "Care, confidence, and wellbeing — so every girl can feel supported in school and in her community.",
  image: "https://www.colgar.org/wp-content/uploads/2023/08/femalecare2-300x208.jpg",
  imageAlt: "Colgar Ladies Care campaign outreach in Lagos",
  kicker: "Menstrual care · Lagos",
  heading: "Every girl deserves to learn with confidence.",
  paragraphs: [
    "Colgar Ladies Care supports menstrual health and helps address barriers that can affect girls’ attendance, wellbeing, and confidence. The campaign pairs practical care with awareness and community involvement.",
    "The Lagos campaign is listed as completed on Colgar’s homepage."
  ],
  stats: [
    { value: "₦600,000", label: "campaign fundraising target" },
    { value: "Completed", label: "campaign status listed by Colgar" }
  ],
  progress: {
    label: "Campaign date listed by Colgar",
    value: "8 April 2025",
    ariaLabel: "Campaign completed"
  },
  action: { label: "Support Colgar’s work", href: "/donate" },
  palette: true,
  section: {
    eyebrow: "The work continues",
    heading: "Menstrual health is part of education.",
    description: "Colgar’s broader Ladies Care program works to provide menstrual products, encourage open conversations, and build a more supportive environment for girls in school.",
    features: [
      "Menstrual health awareness",
      "Practical access to care",
      "Confidence and dignity",
      "Community participation",
      "Support for girls’ education",
      "Sustainable menstrual solutions"
    ]
  },
  note: "Campaign status, target, and date are reproduced from the Colgar homepage. Contact the foundation for current campaign information."
};

export default function LadiesCareLagosPage() {
  return <div className={styles.page}><CampaignDetailPage data={data} /></div>;
}
