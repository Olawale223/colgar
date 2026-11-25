import { AppLink } from "@/components/AppLink";
import { Photo } from "@/components/Photo";
import styles from "./CampaignCard.module.css";

export type CampaignCardProps = {
  href: string;
  image: string;
  alt: string;
  location: string;
  description: string;
  meta: readonly string[];
  linkLabel: string;
  priority?: boolean;
};

export function CampaignCard({
  href,
  image,
  alt,
  location,
  description,
  meta,
  linkLabel,
  priority = false
}: CampaignCardProps) {
  return (
    <article className={styles.card}>
      <AppLink className={styles.image} href={href}>
        <Photo
          className={styles.imagePhoto}
          src={image}
          alt={alt}
          priority={priority}
          sizes="(max-width: 620px) 100vw, (max-width: 920px) 50vw, 570px"
        />
      </AppLink>
      <div className={styles.body}>
        <span className={styles.kicker}>Menstrual health · {location}</span>
        <h2>Colgar Ladies Care</h2>
        <p>{description}</p>
        <div className={styles.meta}>{meta.map((item) => <span key={item}>{item}</span>)}</div>
        <AppLink className="text-link text-link-dark" href={href}>
          {linkLabel} <span aria-hidden="true">↗</span>
        </AppLink>
      </div>
    </article>
  );
}
