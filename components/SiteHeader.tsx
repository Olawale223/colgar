"use client";

import { useState } from "react";
import { AppLink } from "@/components/AppLink";
import { ButtonLink } from "@/components/ButtonLink";
import { useCart } from "@/components/CartProvider";
import styles from "./SiteHeader.module.css";

const navigation = [
  { label: "Our story", href: "/#about" },
  { label: "Campaigns", href: "/campaigns" },
  { label: "Shop", href: "/shop" },
  { label: "Events", href: "/event" },
  { label: "Blog", href: "/blog" },
  { label: "Contact", href: "/#contact" }
];

export function SiteHeader() {
  const [open, setOpen] = useState(false);
  const { itemCount } = useCart();

  return (
    <>
      <div className={styles.utilityBar}>
        <div className={`container ${styles.utilityInner}`}>
          <div className={styles.utilityContact}>
            <AppLink href="tel:+2348151154069">+234 815 115 4069</AppLink>
            <AppLink href="mailto:contact@colgar.org">contact@colgar.org</AppLink>
            <span>Lagos, Nigeria</span>
          </div>
          <AppLink className={styles.utilityNote} href="/donate">
            Good things happen when we show up <span aria-hidden="true">↗</span>
          </AppLink>
        </div>
      </div>
      <header className={styles.siteHeader}>
        <div className={`container ${styles.navWrap}`}>
          <AppLink className={styles.brand} href="/#home" aria-label="Colgar Foundation home">
            <span className={styles.brandMark}>C</span>
            <span className={styles.brandName}>
              colgar<span>foundation</span>
            </span>
          </AppLink>
          <button
            className={styles.menuToggle}
            type="button"
            aria-expanded={open}
            aria-controls="primary-nav"
            aria-label={open ? "Close menu" : "Open menu"}
            onClick={() => setOpen((isOpen) => !isOpen)}
          >
            <span />
            <span />
          </button>
          <nav
            className={`${styles.primaryNav}${open ? ` ${styles.isOpen}` : ""}`}
            id="primary-nav"
            aria-label="Primary navigation"
          >
            {navigation.map((item) => (
              <AppLink key={item.href} href={item.href} onClick={() => setOpen(false)}>
                {item.label}
              </AppLink>
            ))}
            <AppLink
              className={styles.cartLink}
              href="/cart"
              onClick={() => setOpen(false)}
              aria-label={`Cart, ${itemCount} ${itemCount === 1 ? "item" : "items"}`}
            >
              Cart <span aria-hidden="true">{itemCount}</span>
            </AppLink>
            <ButtonLink
              variant="dark"
              size="small"
              className={styles.navDonate}
              href="/donate"
              onClick={() => setOpen(false)}
            >
              Donate <span aria-hidden="true">↗</span>
            </ButtonLink>
          </nav>
        </div>
      </header>
    </>
  );
}
