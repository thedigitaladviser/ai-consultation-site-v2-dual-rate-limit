export function trackEvent(name: string, properties?: Record<string, unknown>) {
  if (typeof window === "undefined") return;

  window.dispatchEvent(
    new CustomEvent("app:analytics", {
      detail: { name, properties }
    })
  );

  if (typeof (window as any).gtag === "function") {
    (window as any).gtag("event", name, properties || {});
  }

  if (Array.isArray((window as any).dataLayer)) {
    (window as any).dataLayer.push({
      event: name,
      ...properties
    });
  }
}
