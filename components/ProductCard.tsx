import { AppLink } from "@/components/AppLink";
import { Photo } from "@/components/Photo";
import styles from "./ProductCard.module.css";

export type ProductCardProps = {
  href: string;
  image: string;
  alt: string;
  title: string;
  price: string;
  option?: boolean;
};

export function ProductCard({ href, image, alt, title, price, option = false }: ProductCardProps) {
  return (
    <article className={styles.card}>
      <AppLink className={styles.image} href={href}>
        <Photo
          className={styles.imagePhoto}
          src={image}
          alt={alt}
          sizes="(max-width: 620px) 50vw, (max-width: 920px) 360px, 380px"
        />
      </AppLink>
      <div className={styles.info}>
        <h2>{title}</h2>
        <span className={styles.price}>{price}</span>
        <AppLink className={styles.link} href={href}>
          {option ? "Choose an option" : "View product"} <span aria-hidden="true">↗</span>
        </AppLink>
      </div>
    </article>
  );
}
