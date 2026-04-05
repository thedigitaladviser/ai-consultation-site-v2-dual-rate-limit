import "./globals.css";
import type { Metadata } from "next";

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
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
