import type { Metadata, Viewport } from "next";
import type { ReactNode } from "react";
import { AdminContentProvider } from "@/components/AdminContentProvider";
import { CartProvider } from "@/components/CartProvider";
import { SiteChrome } from "@/components/SiteChrome";
import "./globals.css";

export const metadata: Metadata = {
  title: "Colgar Foundation — Small moments. Lasting change.",
  description:
    "Colgar is a youth-led Nigerian NGO using entertainment to raise funds for education, health, and opportunity.",
  metadataBase: new URL("https://www.colgar.org")
};

export const viewport: Viewport = {
  themeColor: "#fefdfd"
};

export default function RootLayout({ children }: Readonly<{ children: ReactNode }>) {
  return (
    <html lang="en">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link
          href="https://fonts.googleapis.com/css2?family=DM+Serif+Display&family=DM+Sans:wght@400;500;600;700&display=swap"
          rel="stylesheet"
        />
      </head>
      <body>
        <AdminContentProvider>
          <CartProvider>
            <a className="skip-link" href="#main">Skip to content</a>
            <SiteChrome />
            {children}
          </CartProvider>
        </AdminContentProvider>
      </body>
    </html>
  );
}
