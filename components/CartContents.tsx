"use client";

import { AppLink } from "@/components/AppLink";
import { ButtonLink } from "@/components/ButtonLink";
import { useAdminContent } from "@/components/AdminContentProvider";
import { useCart } from "@/components/CartProvider";
import { Photo } from "@/components/Photo";
import { formatNaira, productCategories } from "@/data/products";
import styles from "./CartContents.module.css";

export function CartContents() {
  const { items, subtotal, ready, setQuantity, removeItem } = useCart();
  const { products } = useAdminContent();

  if (!ready) {
    return <p className={styles.message}>Loading your cart…</p>;
  }

  if (items.length === 0) {
    return (
      <div className={styles.empty}>
        <span className="eyebrow">Your bag is waiting</span>
        <h2>Find a little<br /><em>good to take home.</em></h2>
        <p>Browse Colgar merch and choose something that supports the work.</p>
        <ButtonLink href="/shop">Explore the shop <span aria-hidden="true">↗</span></ButtonLink>
      </div>
    );
  }

  return (
    <div className={styles.layout}>
      <div className={styles.lines}>
        {items.map((item) => {
          const product = products.find((entry) => entry.slug === item.slug);
          if (!product) {
            return (
              <article className={styles.line} key={item.key}>
                <div className={styles.product}>
                  <span className={styles.category}>Unavailable</span>
                  <h2>Item no longer available</h2>
                  <div className={styles.actions}>
                    <button className={styles.remove} type="button" onClick={() => removeItem(item.key)}>
                      Remove from cart
                    </button>
                  </div>
                </div>
                <strong className={styles.lineTotal}>{formatNaira(item.unitPrice * item.quantity)}</strong>
              </article>
            );
          }
          const category = productCategories.find((entry) => entry.value === product.category)?.label;
          const quantityId = `quantity-${item.key.replace(/[^a-zA-Z0-9_-]/g, "-")}`;
          return (
            <article className={styles.line} key={item.key}>
              <AppLink className={styles.image} href={`/product/${product.slug}`} aria-label={`View ${product.title}`}>
                <Photo src={product.image} alt={product.alt} sizes="120px" />
              </AppLink>
              <div className={styles.product}>
                <span className={styles.category}>{category}</span>
                <h2><AppLink href={`/product/${product.slug}`}>{product.title}</AppLink></h2>
                {item.option && <p className={styles.option}>{item.option}</p>}
                <span className={styles.unitPrice}>{formatNaira(item.unitPrice)}</span>
                <div className={styles.actions}>
                  <label htmlFor={quantityId}>Quantity</label>
                  <input
                    id={quantityId}
                    type="number"
                    min={1}
                    max={99}
                    value={item.quantity}
                    onChange={(event) => {
                      const quantity = Number.parseInt(event.target.value, 10);
                      setQuantity(item.key, Number.isFinite(quantity) ? Math.min(99, Math.max(1, quantity)) : 1);
                    }}
                  />
                  <button
                    className={styles.remove}
                    type="button"
                    onClick={() => removeItem(item.key)}
                    aria-label={`Remove ${product.title} from cart`}
                  >
                    Remove
                  </button>
                </div>
              </div>
              <strong className={styles.lineTotal}>{formatNaira(item.unitPrice * item.quantity)}</strong>
            </article>
          );
        })}
      </div>

      <aside className={styles.summary}>
        <span className="eyebrow">Order summary</span>
        <h2>Your total</h2>
        <div className={styles.summaryRow}><span>Subtotal</span><strong>{formatNaira(subtotal)}</strong></div>
        <p>Delivery and any applicable fees are confirmed separately.</p>
        <ButtonLink href="/checkout">Continue to checkout <span aria-hidden="true">↗</span></ButtonLink>
        <AppLink className="text-link text-link-dark" href="/shop">Continue shopping <span aria-hidden="true">↗</span></AppLink>
      </aside>
    </div>
  );
}
