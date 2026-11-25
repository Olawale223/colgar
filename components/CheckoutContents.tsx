"use client";

import { useEffect, useState, type FormEvent } from "react";
import { AppLink } from "@/components/AppLink";
import { ButtonLink } from "@/components/ButtonLink";
import { useAdminContent } from "@/components/AdminContentProvider";
import { useCart } from "@/components/CartProvider";
import { formatNaira } from "@/data/products";
import styles from "./CheckoutContents.module.css";

export function CheckoutContents({ paymentStatus }: { paymentStatus?: "success" | "failed" }) {
  const { items, subtotal, ready, clearCart } = useCart();
  const { products } = useAdminContent();
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    if (paymentStatus === "success") clearCart();
  }, [clearCart, paymentStatus]);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setSubmitting(true);
    setError("");
    const values = new FormData(event.currentTarget);
    try {
      const response = await fetch("/api/public/checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          fullName: values.get("name"),
          email: values.get("email"),
          phone: values.get("phone"),
          delivery: {
            state: values.get("state"),
            address: values.get("address"),
            note: values.get("note")
          },
          items: items.map(({ slug, quantity, option }) => ({ slug, quantity, option }))
        })
      });
      const result = await response.json() as { authorizationUrl?: string; error?: string };
      if (!response.ok || !result.authorizationUrl) {
        setError(result.error ?? "Payment could not be started. Please try again.");
        return;
      }

      const paymentUrl = new URL(result.authorizationUrl);
      if (paymentUrl.protocol !== "https:" || paymentUrl.hostname !== "checkout.paystack.com") {
        setError("The payment service returned an invalid checkout address.");
        return;
      }
      window.location.assign(paymentUrl.toString());
    } catch (requestError) {
      console.error("Could not start Colgar checkout.", requestError);
      setError("Checkout could not be reached. Please try again.");
    } finally {
      setSubmitting(false);
    }
  }

  if (!ready) return <p className={styles.message}>Loading your order…</p>;

  if (paymentStatus === "success") {
    return (
      <div className={styles.empty}>
        <span className="eyebrow">Payment confirmed</span>
        <p>Thank you. Your Colgar order has been paid and is being processed.</p>
        <ButtonLink href="/shop">Continue shopping <span aria-hidden="true">↗</span></ButtonLink>
      </div>
    );
  }

  if (items.length === 0) {
    return (
      <div className={styles.empty}>
        <span className="eyebrow">Nothing to check out yet</span>
        <p>Your cart is empty. Add an item before continuing.</p>
        <ButtonLink href="/shop">Explore the shop <span aria-hidden="true">↗</span></ButtonLink>
      </div>
    );
  }

  return (
    <div className={styles.layout}>
      <form className={styles.form} onSubmit={handleSubmit}>
        <div className={styles.formHeading}>
          <span className="eyebrow">Delivery details</span>
          <h2>Where should we<br /><em>send your order?</em></h2>
        </div>
        <div className={styles.formGrid}>
          <div className={styles.field}>
            <label htmlFor="checkout-name">Full name</label>
            <input id="checkout-name" name="name" autoComplete="name" required />
          </div>
          <div className={styles.field}>
            <label htmlFor="checkout-email">Email address</label>
            <input id="checkout-email" name="email" type="email" autoComplete="email" required />
          </div>
          <div className={styles.field}>
            <label htmlFor="checkout-phone">Phone number</label>
            <input id="checkout-phone" name="phone" type="tel" autoComplete="tel" required />
          </div>
          <div className={styles.field}>
            <label htmlFor="checkout-state">State</label>
            <input id="checkout-state" name="state" autoComplete="address-level1" required />
          </div>
          <div className={`${styles.field} ${styles.fullWidth}`}>
            <label htmlFor="checkout-address">Delivery address</label>
            <textarea id="checkout-address" name="address" autoComplete="street-address" rows={3} required />
          </div>
          <div className={`${styles.field} ${styles.fullWidth}`}>
            <label htmlFor="checkout-note">Order note <span>(optional)</span></label>
            <textarea id="checkout-note" name="note" rows={2} />
          </div>
        </div>
        <p className={styles.previewNotice}>
          Your payment is processed securely by Paystack. Colgar does not store your card details.
        </p>
        {paymentStatus === "failed" && (
          <p className={styles.error} role="alert">Payment was not confirmed. You can review your details and try again.</p>
        )}
        {error && <p className={styles.error} role="alert">{error}</p>}
        <button className={`button button-rust ${styles.submit}`} type="submit" disabled={submitting}>
          {submitting ? "Connecting to Paystack…" : "Continue to payment"} <span aria-hidden="true">↗</span>
        </button>
      </form>

      <aside className={styles.summary}>
        <span className="eyebrow">Your order</span>
        <h2>Order summary</h2>
        <div className={styles.items}>
          {items.map((item) => {
            const product = products.find((entry) => entry.slug === item.slug);
            return (
              <div className={styles.item} key={item.key}>
                <span className={styles.quantity}>{item.quantity}</span>
                <div>
                  <strong>{product?.title ?? "Unavailable item"}</strong>
                  {item.option && <span>{item.option}</span>}
                </div>
                <b>{formatNaira(item.unitPrice * item.quantity)}</b>
              </div>
            );
          })}
        </div>
        <div className={styles.total}><span>Subtotal</span><strong>{formatNaira(subtotal)}</strong></div>
        <p>Delivery and applicable fees are confirmed separately.</p>
        <AppLink className="text-link text-link-dark" href="/cart">Edit cart <span aria-hidden="true">↗</span></AppLink>
      </aside>
    </div>
  );
}
