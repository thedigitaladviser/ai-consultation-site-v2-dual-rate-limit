import "./globals.css";
import type { Metadata } from "next";
import Script from "next/script";

export const metadata: Metadata = {
  title: "AI Automation Agency",
  description:
    "Instant AI consultation for SMEs. Call now or request an immediate callback to discover the best automation opportunities in your business."
};

export default function RootLayout({
  children
}: Readonly<{
  children: React.ReactNode;
}>) {
  const gtmId = process.env.NEXT_PUBLIC_GTM_ID?.trim();

  return (
    <html lang="en">
      <body suppressHydrationWarning>
        {gtmId ? (
          <>
            <Script id="gtm-init" strategy="afterInteractive">
              {`
                window.dataLayer = window.dataLayer || [];
                window.dataLayer.push({ event: "gtm.js", "gtm.start": new Date().getTime() });
              `}
            </Script>
            <Script
              id="gtm-script"
              strategy="afterInteractive"
              src={`https://www.googletagmanager.com/gtm.js?id=${gtmId}`}
            />
            <noscript>
              <iframe
                src={`https://www.googletagmanager.com/ns.html?id=${gtmId}`}
                height="0"
                width="0"
                style={{ display: "none", visibility: "hidden" }}
              />
            </noscript>
          </>
        ) : null}
        {children}
      </body>
    </html>
  );
}
