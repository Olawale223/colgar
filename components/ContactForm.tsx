"use client";

import { useEffect, useRef, useState, type FormEvent } from "react";
import styles from "./ContactForm.module.css";

export function ContactForm() {
  const formRef = useRef<HTMLFormElement>(null);
  const [visible, setVisible] = useState(false);
  const [note, setNote] = useState("This preview will open a message in your email app.");

  useEffect(() => {
    const form = formRef.current;
    if (!form) return;

    if (!("IntersectionObserver" in window)) {
      setVisible(true);
      return;
    }

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setVisible(true);
          observer.disconnect();
        }
      },
      { threshold: 0.12 }
    );
    observer.observe(form);
    return () => observer.disconnect();
  }, []);

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const data = new FormData(event.currentTarget);
    const subject = encodeURIComponent(`Getting involved with Colgar — ${data.get("name")}`);
    const body = encodeURIComponent(
      [
        `Name: ${data.get("name")}`,
        `Email: ${data.get("email")}`,
        `Phone: ${data.get("phone") || "Not provided"}`,
        `Zip code: ${data.get("zip") || "Not provided"}`
      ].join("\n")
    );

    setNote("Your email app is opening with your details. Please send the message to reach Colgar.");
    window.location.href = `mailto:contact@colgar.org?subject=${subject}&body=${body}`;
  }

  return (
    <form
      ref={formRef}
      className={`reveal${visible ? " is-visible" : ""} ${styles.form}`}
      onSubmit={handleSubmit}
    >
      <p className={styles.intro}>Leave us a note and we’ll be in touch.</p>
      <label htmlFor="name">Your name</label>
      <input id="name" name="name" autoComplete="name" placeholder="How should we call you?" required />
      <label htmlFor="email">Email address</label>
      <input id="email" name="email" type="email" autoComplete="email" placeholder="you@example.com" required />
      <div className={styles.row}>
        <div>
          <label htmlFor="phone">Phone number</label>
          <input id="phone" name="phone" type="tel" autoComplete="tel" placeholder="+234" />
        </div>
        <div>
          <label htmlFor="zip">Zip code</label>
          <input id="zip" name="zip" autoComplete="postal-code" placeholder="Optional" />
        </div>
      </div>
      <button className={`button ${styles.submit}`} type="submit">
        Get involved today <span aria-hidden="true">↗</span>
      </button>
      <p className={styles.note} aria-live="polite">{note}</p>
    </form>
  );
}
