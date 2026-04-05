"use client";

import type React from "react";
import { trackEvent } from "@/lib/analytics";

type CtaLinkProps = React.AnchorHTMLAttributes<HTMLAnchorElement> & {
  ctaId: string;
  source?: string;
};

export function CtaLink({ ctaId, source = "landing-page", onClick, href, children, ...props }: CtaLinkProps) {
  function handleClick(event: React.MouseEvent<HTMLAnchorElement>) {
    trackEvent("cta_clicked", { ctaId, source, href });

    const payload = JSON.stringify({
      eventName: "cta_clicked",
      ctaId,
      source,
      href,
      metadata: {
        text: typeof children === "string" ? children : undefined
      }
    });

    if (navigator.sendBeacon) {
      navigator.sendBeacon("/api/cta", new Blob([payload], { type: "application/json" }));
    } else {
      fetch("/api/cta", {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: payload,
        keepalive: true
      }).catch(() => {});
    }

    onClick?.(event);
  }

  return (
    <a {...props} href={href} onClick={handleClick}>
      {children}
    </a>
  );
}
