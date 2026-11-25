import { AppLink } from "@/components/AppLink";
import { Photo } from "@/components/Photo";
import styles from "./BlogCard.module.css";

export type BlogCardProps = {
  href: string;
  image: string;
  alt: string;
  meta: string;
  title: string;
  description: string;
  priority?: boolean;
};

export function BlogCard({ href, image, alt, meta, title, description, priority = false }: BlogCardProps) {
  return (
    <article className={styles.card}>
      <AppLink className={styles.image} href={href}>
        <Photo
          className={styles.imagePhoto}
          src={image}
          alt={alt}
          sizes="(max-width: 620px) 50vw, (max-width: 920px) 360px, 380px"
          priority={priority}
        />
      </AppLink>
      <div className={styles.copy}>
        <span className={styles.meta}>{meta}</span>
        <h2>{title}</h2>
        <p>{description}</p>
        <AppLink className="text-link text-link-dark" href={href}>
          Read the story <span aria-hidden="true">↗</span>
        </AppLink>
      </div>
    </article>
  );
}
