import { NextRequest, NextResponse } from "next/server";
import { recordCtaEvent } from "@/lib/callbacks";
import { sendCtaWebhook } from "@/lib/webhooks";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const eventName = String(body.eventName || "cta_clicked");
    const ctaId = String(body.ctaId || "");
    const source = String(body.source || "landing-page");
    const href = body.href ? String(body.href) : null;
    const metadata = typeof body.metadata === "object" && body.metadata ? body.metadata : undefined;

    if (!ctaId) {
      return NextResponse.json({ ok: false, error: "CTA id is required." }, { status: 400 });
    }

    recordCtaEvent({
      eventName,
      ctaId,
      href,
      source,
      metadata: metadata as Record<string, unknown> | undefined
    });

    try {
      await sendCtaWebhook({
        event: eventName,
        ctaId,
        href,
        source,
        metadata,
        createdAt: new Date().toISOString()
      });
    } catch (webhookError) {
      console.error("CTA webhook error:", webhookError);
    }

    return NextResponse.json({ ok: true });
  } catch (error) {
    console.error("CTA event error:", error);
    return NextResponse.json({ ok: false, error: "Failed to record CTA event." }, { status: 500 });
  }
}
