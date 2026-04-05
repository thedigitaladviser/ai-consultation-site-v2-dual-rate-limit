import { NextRequest, NextResponse } from "next/server";
import { claimDueScheduledCallbacks, initiateCallbackCall } from "@/lib/callbacks";
import { sendLeadToCrm } from "@/lib/crm";

function isAuthorized(request: NextRequest) {
  const secret = process.env.CRON_SECRET;
  if (!secret) {
    return false;
  }

  const authHeader = request.headers.get("authorization");
  return authHeader === `Bearer ${secret}`;
}

export async function POST(request: NextRequest) {
  if (!isAuthorized(request)) {
    return NextResponse.json({ ok: false, error: "Unauthorized" }, { status: 401 });
  }

  const dueCallbacks = claimDueScheduledCallbacks();
  const results: Array<{ id: string; ok: boolean; callSid?: string | null; error?: string }> = [];

  for (const callback of dueCallbacks) {
    try {
      const initiated = await initiateCallbackCall(callback.id);

      try {
        await sendLeadToCrm({
          event: "scheduled_callback_started",
          callbackRequestId: initiated.id,
          phoneNumber: initiated.phoneNumber,
          scheduledFor: initiated.scheduledFor,
          source: initiated.source,
          callSid: initiated.callSid,
          requestedAt: initiated.createdAt,
          processedAt: new Date().toISOString()
        });
      } catch (crmError) {
        console.error("Scheduled callback CRM webhook error:", crmError);
      }

      results.push({
        id: initiated.id,
        ok: true,
        callSid: initiated.callSid
      });
    } catch (error) {
      results.push({
        id: callback.id,
        ok: false,
        error: error instanceof Error ? error.message : "Unknown scheduled callback error"
      });
    }
  }

  return NextResponse.json({
    ok: true,
    processed: results.length,
    results
  });
}
