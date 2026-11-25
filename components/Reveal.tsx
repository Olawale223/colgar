"use client";

import { useEffect, useRef, useState } from "react";
import type { HTMLAttributes, ReactNode } from "react";
import { AppLink } from "@/components/AppLink";

type RevealTag = "div" | "section" | "article" | "a";

type RevealProps = HTMLAttributes<HTMLElement> & {
  as?: RevealTag;
  href?: string;
  children: ReactNode;
};

export function Reveal({ as = "div", href, className = "", children, ...props }: RevealProps) {
  const elementRef = useRef<HTMLElement>(null);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const element = elementRef.current;
    if (!element) return;

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

    observer.observe(element);
    return () => observer.disconnect();
  }, []);

  const observedClassName = `${className} reveal${visible ? " is-visible" : ""}`.trim();
  const setObservedElement = (element: HTMLElement | null) => {
    elementRef.current = element;
  };

  if (as === "a") {
    if (!href) {
      throw new Error("Reveal with as=\"a\" requires an href.");
    }
    return <AppLink {...props} href={href} ref={setObservedElement} className={observedClassName}>{children}</AppLink>;
  }
  if (as === "article") {
    return <article {...props} ref={setObservedElement} className={observedClassName}>{children}</article>;
  }
  if (as === "section") {
    return <section {...props} ref={setObservedElement} className={observedClassName}>{children}</section>;
  }
  return <div {...props} ref={setObservedElement} className={observedClassName}>{children}</div>;
}
