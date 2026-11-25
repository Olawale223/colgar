import type { ReactNode } from "react";
import { AppLink } from "@/components/AppLink";
import styles from "./InnerPage.module.css";
import contentStyles from "./InteriorContent.module.css";

export type BreadcrumbItem = { label: string; href?: string };

type InnerPageHeroProps = {
  breadcrumb: BreadcrumbItem[];
  eyebrow: string;
  title: ReactNode;
  description: string;
};

export function InnerPageHero({
  breadcrumb,
  eyebrow,
  title,
  description
}: InnerPageHeroProps) {
  return (
    <section className={styles.hero}>
      <div className="container">
        <nav className={styles.breadcrumb} aria-label="Breadcrumb">
          {breadcrumb.map((item, index) => (
            <span className={styles.breadcrumbItem} key={`${item.label}-${index}`}>
              {index > 0 && <span aria-hidden="true">/</span>}
              {item.href ? <AppLink href={item.href}>{item.label}</AppLink> : <span>{item.label}</span>}
            </span>
          ))}
        </nav>
        <p className="eyebrow">{eyebrow}</p>
        <h1>{title}</h1>
        <p className={styles.description}>{description}</p>
      </div>
    </section>
  );
}

export function PageContent({
  children,
  className = ""
}: {
  children: ReactNode;
  className?: string;
}) {
  return (
    <section className={`container ${styles.pageContent} ${contentStyles.scope} ${className}`}>
      {children}
    </section>
  );
}
