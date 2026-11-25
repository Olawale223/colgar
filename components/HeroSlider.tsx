"use client";

import { useEffect, useState } from "react";
import { ButtonLink } from "@/components/ButtonLink";
import { Photo } from "@/components/Photo";
import styles from "./HeroSlider.module.css";

const slides = [
  {
    image: "https://images.unsplash.com/photo-1509062522246-3755977927d7?auto=format&fit=crop&w=1800&q=85",
    alt: "Students learning together in a classroom",
    label: "Education"
  },
  {
    image: "https://images.unsplash.com/photo-1531206715517-5c0ba140b2b8?auto=format&fit=crop&w=1800&q=85",
    alt: "Volunteers working together at a community event",
    label: "Community"
  },
  {
    image: "https://images.unsplash.com/photo-1488521787991-ed7bbaae773c?auto=format&fit=crop&w=1800&q=85",
    alt: "A volunteer spending time with children outdoors",
    label: "Care"
  }
];

export function HeroSlider() {
  const [activeSlide, setActiveSlide] = useState(0);

  useEffect(() => {
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      return;
    }

    const intervalId = window.setInterval(() => {
      setActiveSlide((current) => (current + 1) % slides.length);
    }, 2000);

    return () => window.clearInterval(intervalId);
  }, []);

  return (
    <section className={styles.hero} id="home" aria-label="Colgar Foundation welcome">
      <div className={styles.slides}>
        {slides.map((slide, index) => (
          <div
            key={slide.image}
            className={`${styles.slide}${index === activeSlide ? ` ${styles.active}` : ""}`}
            aria-hidden={index !== activeSlide}
          >
            <Photo
              className={styles.image}
              src={slide.image}
              alt={slide.alt}
              priority={index === 0}
              sizes="100vw"
            />
          </div>
        ))}
      </div>
      <div className={styles.overlay} />

      <div className={`container ${styles.content}`}>
        <div className={styles.copy}>
          <p className={`eyebrow ${styles.eyebrow}`}>
            <span className={styles.eyebrowDot} />
            Youth-led. Community-rooted. Nigeria-wide.
          </p>
          <h1 className={styles.title}>Small moments.<br /><em>Lasting change.</em></h1>
          <p className={styles.lede}>
            One night. One ticket. A lifetime of change. Join us for a movie night that helps send
            children to school across Nigeria.
          </p>
          <p className={styles.detail}>
            Every ticket supports school fees, books, and learning materials — helping build brighter
            futures, one child at a time.
          </p>
          <ButtonLink href="/product/social-construction">
            Get a movie ticket <span aria-hidden="true">↗</span>
          </ButtonLink>
          <div className={styles.caption}>
            <span className={styles.captionLine} />
            Good causes can feel good, too.
          </div>
        </div>
      </div>

      <div className={`container ${styles.footer}`}>
        <span className={styles.location}>Ilorin · Lagos · Abuja</span>
        <div className={styles.controls} role="group" aria-label="Hero image slider controls">
          {slides.map((slide, index) => (
            <button
              key={slide.label}
              type="button"
              className={`${styles.indicator}${index === activeSlide ? ` ${styles.indicatorActive}` : ""}`}
              aria-label={`Show ${slide.label} slide`}
              aria-pressed={index === activeSlide}
              onClick={() => setActiveSlide(index)}
            />
          ))}
        </div>
      </div>
    </section>
  );
}
