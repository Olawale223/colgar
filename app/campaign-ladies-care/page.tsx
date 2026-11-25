import type { Metadata } from "next";
import { CampaignDetailPage, type CampaignDetailData } from "@/components/CampaignDetailPage";
import styles from "./page.module.css";

export const metadata: Metadata = {
  title: "Colgar Ladies Care Abuja — Colgar Foundation",
  description: "Colgar Ladies Care Abuja supported menstrual health and raised 400 sanitary pads for girls."
};

const data: CampaignDetailData = {
  footerPage: "careAbuja",
  breadcrumb: [
    { label: "Home", href: "/" },
    { label: "Campaigns", href: "/campaigns" },
    { label: "Abuja" }
  ],
  eyebrow: "Menstrual health · Abuja",
  title: <>Colgar Ladies<br /><em>Care.</em></>,
  description: "When girls have the care and confidence they need, their education doesn’t have to pause.",
  image: "https://www.colgar.org/wp-content/uploads/2025/06/COLGA-82-420x300.jpg",
  imageAlt: "Colgar Ladies Care outreach with students in Abuja",
  kicker: "A mission of empowerment · Abuja",
  heading: "Period care belongs in every classroom.",
  paragraphs: [
    "Lack of access to menstrual products can interrupt girls’ attendance and affect their school experience. Colgar Ladies Care works to provide sustainable menstrual solutions, promote health awareness, and break the stigma around menstruation.",
    "The Abuja campaign raised sanitary pads for girls and supported menstrual-health awareness in the community."
  ],
  stats: [
    { value: "400", label: "sanitary pads raised" },
    { value: "400", label: "campaign target" }
  ],
  progress: {
    label: "Sanitary pad target",
    value: "100% reached",
    ariaLabel: "Sanitary pad target reached"
  },
  action: { label: "Support Ladies Care", href: "/donate" },
  palette: true,
  section: {
    eyebrow: "The work we do",
    heading: "Care, confidence, and the freedom to learn.",
    description: "Colgar’s goals include menstrual health awareness, sustainable solutions, data-informed outreach, and strong community participation — so girls can continue their education with dignity.",
    features: [
      "Promote menstrual health awareness",
      "Reduce barriers to school attendance",
      "Encourage sustainable solutions",
      "Support confidence and dignity",
      "Bring communities into the conversation",
      "Use data to guide outreach"
    ]
  },
  note: "The Abuja campaign figures and end date reflect information published on Colgar’s website."
};

export default function LadiesCarePage() {
  return <div className={styles.page}><CampaignDetailPage data={data} /></div>;
}
