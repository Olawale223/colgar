import type { ReactNode } from "react";
import { AppLink } from "@/components/AppLink";

type ButtonLinkProps = {
  href: string;
  variant?: "dark" | "rust" | "paper";
  size?: "default" | "small";
  className?: string;
  children: ReactNode;
  onClick?: () => void;
};

export function ButtonLink({
  href,
  variant = "rust",
  size = "default",
  className = "",
  children,
  onClick
}: ButtonLinkProps) {
  return (
    <AppLink
      className={`button button-${variant}${size === "small" ? " button-small" : ""} ${className}`.trim()}
      href={href}
      onClick={onClick}
    >
      {children}
    </AppLink>
  );
}
