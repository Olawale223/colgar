"use client";

import { useState, type FormEvent } from "react";
import { useAdminContent } from "@/components/AdminContentProvider";
import { BlogCard } from "@/components/BlogCard";
import styles from "./BlogCatalog.module.css";

export function BlogCatalog() {
  const { blogPosts, ready, subscribe } = useAdminContent();
  const [email, setEmail] = useState("");
  const [message, setMessage] = useState("");
  const [consent, setConsent] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const posts = blogPosts.filter((post) => post.status === "published");

  async function handleSubscribe(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setSubmitting(true);
    setMessage("");
    try {
      const result = await subscribe(email, consent);
      setMessage(result.message);
      if (result.ok) {
        setEmail("");
        setConsent(false);
      }
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <>
      {posts.length > 0 ? (
        <div className={styles.grid}>
          {posts.map((post, index) => <BlogCard key={post.id} {...post} priority={index === 0} />)}
        </div>
      ) : (
        <p className={styles.empty}>No stories are published right now. Please check back soon.</p>
      )}

      <section className={styles.newsletter} aria-labelledby="newsletter-heading">
        <div>
          <span className="eyebrow">Stay in the loop</span>
          <h2 id="newsletter-heading">Stories in your<br /><em>inbox.</em></h2>
          <p>Subscribe for Colgar stories and community updates.</p>
        </div>
        <form className={styles.form} onSubmit={handleSubscribe}>
          <label htmlFor="newsletter-email">Email address</label>
          <div className={styles.formRow}>
            <input
              id="newsletter-email"
              type="email"
              autoComplete="email"
              placeholder="you@example.com"
              value={email}
              onChange={(event) => setEmail(event.target.value)}
              required
            />
            <button className="button button-rust" type="submit" disabled={!ready || submitting || !consent}>
              Subscribe <span aria-hidden="true">↗</span>
            </button>
          </div>
          <label className={styles.consent}>
            <input type="checkbox" checked={consent} onChange={(event) => setConsent(event.target.checked)} />
            I agree to receive Colgar stories and updates by email.
          </label>
          <p className={styles.note} aria-live="polite">
            {message || "You’ll receive a confirmation email before being added to the list."}
          </p>
        </form>
      </section>
    </>
  );
}
