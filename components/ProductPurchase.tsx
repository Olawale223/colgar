"use client";

import { useState } from "react";
import { AppLink } from "@/components/AppLink";
import { useCart } from "@/components/CartProvider";
import { formatNaira, type Product } from "@/data/products";
import styles from "./ProductPurchase.module.css";

export function ProductPurchase({ product }: { product: Product }) {
  const [selectedOption, setSelectedOption] = useState("");
  const [quantity, setQuantity] = useState(1);
  const [added, setAdded] = useState(false);
  const { addItem, ready } = useCart();
  const option = product.options?.find((item) => item.label === selectedOption);
  const unitPrice = option?.price ?? product.price;

  function handleAdd() {
    if (!ready || (product.options && !option)) return;
    addItem({
      slug: product.slug,
      quantity,
      unitPrice,
      option: option?.label
    });
    setAdded(true);
  }

  return (
    <div className={styles.purchase}>
      {product.options && (
        <div className={styles.field}>
          <label htmlFor="product-option">
            {product.category === "movie-tickets" ? "Choose your impact" : product.category === "tote-bags" ? "Choose a size" : "Choose a shirt size"}
          </label>
          <select
            id="product-option"
            value={selectedOption}
            onChange={(event) => {
              setSelectedOption(event.target.value);
              setAdded(false);
            }}
          >
            <option value="">Select an option</option>
            {product.options.map((item) => (
              <option key={item.label} value={item.label}>
                {item.label} · {formatNaira(item.price)}
              </option>
            ))}
          </select>
          {option?.impact && <p className={styles.impact}>{option.impact}</p>}
        </div>
      )}

      <div className={styles.quantityField}>
        <label htmlFor="product-quantity">Quantity</label>
        <input
          id="product-quantity"
          type="number"
          min={1}
          max={99}
          value={quantity}
          onChange={(event) => {
            const value = Number.parseInt(event.target.value, 10);
            setQuantity(Number.isFinite(value) ? Math.min(99, Math.max(1, value)) : 1);
            setAdded(false);
          }}
        />
      </div>

      <button
        className={`button button-rust ${styles.addButton}`}
        type="button"
        disabled={!ready || Boolean(product.options && !option)}
        onClick={handleAdd}
      >
        Add to cart · {formatNaira(unitPrice)} <span aria-hidden="true">↗</span>
      </button>

      <div className={styles.feedback} aria-live="polite">
        {added && (
          <>
            <span>Added to your cart.</span>
            <AppLink href="/cart">View cart <span aria-hidden="true">↗</span></AppLink>
          </>
        )}
      </div>
    </div>
  );
}
