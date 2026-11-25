"use client";

import { AppLink } from "@/components/AppLink";
import { ButtonLink } from "@/components/ButtonLink";
import { useAdminContent } from "@/components/AdminContentProvider";
import { Photo } from "@/components/Photo";
import { ProductPurchase } from "@/components/ProductPurchase";
import { productCategories } from "@/data/products";
import styles from "./page.module.css";

export function ProductDetail({ slug }: { slug: string }) {
  const { products, ready } = useAdminContent();
  const product = products.find((item) => item.slug === slug);

  if (!ready) {
    return <main id="main" className={styles.main}><p className="container">Loading product…</p></main>;
  }

  if (!product || !product.visible) {
    return (
      <main id="main" className={styles.main}>
        <section className={`container ${styles.moreInfo}`}>
          <span className="eyebrow">Colgar community shop</span>
          <h1>This item is no longer available.</h1>
          <p>Browse the current collection to find something else.</p>
          <ButtonLink href="/shop">Back to the shop <span aria-hidden="true">↗</span></ButtonLink>
        </section>
      </main>
    );
  }

  const categoryLabel = productCategories.find((category) => category.value === product.category)?.label;

  return (
    <main id="main" className={styles.main}>
      <div className={`container ${styles.breadcrumb}`}>
        <AppLink href="/">Home</AppLink><span aria-hidden="true">/</span>
        <AppLink href="/shop">Shop</AppLink><span aria-hidden="true">/</span>
        <span>{product.title}</span>
      </div>

      <section className={`container ${styles.productLayout}`}>
        <div className={styles.productImage}>
          <Photo
            className={styles.productPhoto}
            src={product.image}
            alt={product.alt}
            sizes="(max-width: 760px) 100vw, 55vw"
            priority
          />
          <span className={styles.imageCaption}>Colgar community shop</span>
        </div>

        <div className={styles.productInfo}>
          <span className="eyebrow">{categoryLabel}</span>
          <h1>{product.title}</h1>
          <p className={styles.price}>{product.priceLabel}</p>
          <p className={styles.description}>{product.description}</p>
          {product.slug === "social-construction" && (
            <div className={styles.impactNote}>
              <strong>One night. One ticket. A lifetime of change.</strong>
              <p>Every ticket supports school fees, books, and learning materials for children across Nigeria.</p>
            </div>
          )}
          <ProductPurchase product={product} />
          <ul className={styles.productDetails}>
            {product.details.map((detail) => <li key={detail}>{detail}</li>)}
          </ul>
          <p className={styles.previewNote}>Checkout verifies current prices and processes payment securely through Paystack.</p>
        </div>
      </section>

      <section className={`container ${styles.moreInfo}`}>
        <span className="eyebrow">Good things, good company</span>
        <h2>Every purchase helps<br /><em>Colgar show up.</em></h2>
        <p>Colgar merch brings the community along for youth-led programs and positive change across Nigeria.</p>
        <AppLink className="text-link text-link-dark" href="/shop">Back to the shop <span aria-hidden="true">↗</span></AppLink>
      </section>
    </main>
  );
}
