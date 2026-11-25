import type { Metadata } from "next";
import { CampaignDetailPage, type CampaignDetailData } from "@/components/CampaignDetailPage";
import styles from "./page.module.css";

export const metadata: Metadata = {
  title: "Social Construction — Colgar Foundation",
  description: "Social Construction is Colgar's outdoor movie night raising funds for children's school fees and learning materials."
};

const data: CampaignDetailData = {
  footerPage: "socialConstruction",
  breadcrumb: [
    { label: "Home", href: "/" },
    { label: "Events", href: "/event" },
    { label: "Social Construction" }
  ],
  eyebrow: "Movie night for a cause",
  title: <>Social<br /><em>Construction.</em></>,
  description: "One movie ticket can help a child take the next step toward a brighter future.",
  image: "https://www.colgar.org/wp-content/uploads/2025/06/COLGA-82-420x300.jpg",
  imageAlt: "Students and community members at a Colgar outreach",
  kicker: "A movie ticket for change",
  heading: "An evening together can open doors to education.",
  paragraphs: [
    "Colgar’s Social Construction is an outdoor movie night raising funds for children’s school fees and essential learning materials.",
    "The event page highlights that children already in school may still lack writing materials, books, learning aids, or certainty about their next school fee. These barriers can make it harder to stay in school.",
    "Colgar’s campaign page cites an estimate of 18.3 million children out of school in Nigeria, and notes that public-school fees may range from free to ₦1,000–₦35,000."
  ],
  stats: [
    { value: "School fees", label: "Support to help children continue learning" },
    { value: "Learning kits", label: "Books, writing materials, and learning aids" }
  ],
  action: {
    label: "View movie night ticket",
    href: "/product/social-construction"
  },
  section: {
    eyebrow: "The idea",
    heading: "Make giving feel like coming together.",
    description: "Social Construction turns an outdoor movie night into a shared act of support. Ticket proceeds go toward school fees and essential learning materials, helping children stay in school with the tools they need.",
    link: { label: "See event details", href: "/event" }
  }
};

export default function SocialConstructionPage() {
  return <div className={styles.page}><CampaignDetailPage data={data} /></div>;
}
