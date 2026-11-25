"use client";

import { useState, type FormEvent } from "react";
import { useSearchParams } from "next/navigation";
import styles from "./UnsubscribeForm.module.css";

export function UnsubscribeForm() {
  const searchParams = useSearchParams();
  const token = searchParams.get("token") ?? "";
  const [message, setMessage] = useState("");
  const [busy, setBusy] = useState(false);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setBusy(true);
    setMessage("");
    try {
      const response = await fetch("/api/public/newsletter/unsubscribe", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ token })
      });
      const result = await response.json() as { message?: string; error?: string };
      setMessage(response.ok ? result.message ?? "You have been unsubscribed." : result.error ?? "We could not process this request.");
    } catch (error) {
      console.error("Colgar unsubscribe request could not be reached.", error);
      setMessage("The unsubscribe service could not be reached. Please try again.");
    } finally {
      setBusy(false);
    }
  }

  return (
    <main id="main" className={styles.main}>
      <section>
        <span className="eyebrow">Colgar updates</span>
        <h1>Manage your subscription.</h1>
        <p>Confirm below if you no longer want to receive Colgar Foundation stories by email.</p>
        {token ? (
          <form onSubmit={handleSubmit}>
            <button type="submit" disabled={busy}>{busy ? "Updating…" : "Unsubscribe"}</button>
            {message && <p role="status">{message}</p>}
          </form>
        ) : <p role="alert">This unsubscribe link is invalid or incomplete.</p>}
      </section>
    </main>
  );
}
