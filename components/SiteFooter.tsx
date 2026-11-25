import { AppLink } from "@/components/AppLink";
import styles from "./SiteFooter.module.css";

export type FooterPage =
  | "home"
  | "campaigns"
  | "careAbuja"
  | "careLagos"
  | "shop"
  | "event"
  | "socialConstruction"
  | "blog"
  | "donate"
  | "volunteer";

type FooterLink = { label: string; href: string };

const exploreLinks: Record<FooterPage, FooterLink[]> = {
  home: [
    { label: "Our story", href: "/#about" },
    { label: "Campaigns", href: "/campaigns" },
    { label: "Shop", href: "/shop" },
    { label: "Events", href: "/event" },
    { label: "Social Construction", href: "/social-construction" },
    { label: "Blog", href: "/blog" }
  ],
  campaigns: [
    { label: "Our story", href: "/#about" },
    { label: "Campaigns", href: "/campaigns" },
    { label: "Shop", href: "/shop" },
    { label: "Events", href: "/event" },
    { label: "Social Construction", href: "/social-construction" },
    { label: "Blog", href: "/blog" }
  ],
  careAbuja: [
    { label: "All campaigns", href: "/campaigns" },
    { label: "Ladies Care Lagos", href: "/campaign-ladies-care-lagos" },
    { label: "Shop", href: "/shop" },
    { label: "Blog", href: "/blog" }
  ],
  careLagos: [
    { label: "All campaigns", href: "/campaigns" },
    { label: "Ladies Care Abuja", href: "/campaign-ladies-care" },
    { label: "Shop", href: "/shop" },
    { label: "Blog", href: "/blog" }
  ],
  shop: [
    { label: "Our story", href: "/#about" },
    { label: "Campaigns", href: "/campaigns" },
    { label: "Events", href: "/event" },
    { label: "Social Construction", href: "/social-construction" },
    { label: "Blog", href: "/blog" }
  ],
  event: [
    { label: "Campaigns", href: "/campaigns" },
    { label: "Shop", href: "/shop" },
    { label: "Events", href: "/event" },
    { label: "Social Construction", href: "/social-construction" },
    { label: "Blog", href: "/blog" }
  ],
  socialConstruction: [
    { label: "Campaigns", href: "/campaigns" },
    { label: "Shop", href: "/shop" },
    { label: "Events", href: "/event" },
    { label: "Blog", href: "/blog" }
  ],
  blog: [
    { label: "Our story", href: "/#about" },
    { label: "Campaigns", href: "/campaigns" },
    { label: "Shop", href: "/shop" },
    { label: "Events", href: "/event" },
    { label: "Social Construction", href: "/social-construction" }
  ],
  donate: [
    { label: "Our story", href: "/#about" },
    { label: "Campaigns", href: "/campaigns" },
    { label: "Shop", href: "/shop" },
    { label: "Events", href: "/event" },
    { label: "Social Construction", href: "/social-construction" },
    { label: "Blog", href: "/blog" }
  ],
  volunteer: [
    { label: "Our story", href: "/#about" },
    { label: "Campaigns", href: "/campaigns" },
    { label: "Shop", href: "/shop" },
    { label: "Events", href: "/event" },
    { label: "Social Construction", href: "/social-construction" },
    { label: "Blog", href: "/blog" }
  ]
};

const involvementLinks: FooterLink[] = [
  { label: "Volunteer with us", href: "/volunteer" },
  { label: "Make a donation", href: "/donate" },
  { label: "Become a sponsor", href: "/#contact" }
];

export function SiteFooter({ page }: { page: FooterPage }) {
  return (
    <footer className={styles.footer}>
      <span className={styles.decoration} aria-hidden="true">COLGAR</span>
      <div className={`container ${styles.main}`}>
        <div className={styles.brandColumn}>
          <AppLink className={styles.brand} href="/#home" aria-label="Colgar Foundation home">
            <span className={styles.brandMark}>C</span>
            <span className={styles.brandName}>
              colgar<span>foundation</span>
            </span>
          </AppLink>
          <p>
            A youth-led unity NGO using entertainment to raise funds for the issues that matter to
            young people in Nigeria.
          </p>
          <span className={styles.location}>Lagos, Nigeria</span>
        </div>
        <FooterColumn label="Explore" links={exploreLinks[page]} />
        <FooterColumn label="Get involved" links={involvementLinks} />
        <div className={styles.links}>
          <span className={styles.label}>Say hello</span>
          <AppLink href="mailto:contact@colgar.org">contact@colgar.org</AppLink>
          <AppLink href="tel:+2348151154069">+234 815 115 4069</AppLink>
          <div className={styles.socialLinks}>
            <AppLink href="https://www.instagram.com/colgar_team/" aria-label="Instagram">ig</AppLink>
            <AppLink href="https://twitter.com/COLGAR5" aria-label="Twitter">x</AppLink>
            <AppLink href="https://web.facebook.com/colgarteam" aria-label="Facebook">fb</AppLink>
          </div>
        </div>
      </div>
      <div className={`container ${styles.bottom}`}>
        <span>© {new Date().getFullYear()} Colgar Foundation. Good things grow together.</span>
        <AppLink href="#main">Back to top ↑</AppLink>
        <span>Made with care in Nigeria</span>
      </div>
    </footer>
  );
}

function FooterColumn({ label, links }: { label: string; links: FooterLink[] }) {
  return (
    <div className={styles.links}>
      <span className={styles.label}>{label}</span>
      {links.map(({ label: linkLabel, href }) => (
        <AppLink key={href} href={href}>{linkLabel}</AppLink>
      ))}
    </div>
  );
}
