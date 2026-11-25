import { forwardRef } from "react";
import Link from "next/link";
import type { AnchorHTMLAttributes, ReactNode } from "react";

type AppLinkProps = Omit<AnchorHTMLAttributes<HTMLAnchorElement>, "href"> & {
  href: string;
  children: ReactNode;
};

export const AppLink = forwardRef<HTMLAnchorElement, AppLinkProps>(
  function AppLink({ href, children, ...props }, ref) {
    if (href.startsWith("/") || href.startsWith("#")) {
      return (
        <Link href={href} {...props} ref={ref}>
          {children}
        </Link>
      );
    }

    return (
      <a href={href} {...props} ref={ref}>
        {children}
      </a>
    );
  }
);
