import { NextRequest, NextResponse } from "next/server";
import { normalizeAndValidatePhoneNumber } from "@/lib/twilio";
import { checkIpRateLimit, checkPhoneRateLimit } from "@/lib/rate-limit";
import { sendLeadToCrm } from "@/lib/crm";
import { createCallbackRequest, initiateCallbackCall } from "@/lib/callbacks";

function getRequestIp(request: NextRequest) {
  if (process.env.TRUST_PROXY_HEADERS !== "true") {
    return "proxy-untrusted";
  }

  const preferredHeaders = ["cf-connecting-ip", "x-real-ip", "x-forwarded-for"];

  for (const header of preferredHeaders) {
    const value = request.headers.get(header);
    if (!value) {
      continue;
    }

    return header === "x-forwarded-for" ? value.split(",")[0].trim() : value.trim();
  }

  return "unknown";
}

function retryAfterSeconds(resetAt: number) {
  return String(Math.max(1, Math.ceil((resetAt - Date.now()) / 1000)));
}

export async function POST(request: NextRequest) {
  try {
    const ip = getRequestIp(request);

    const ipRate = checkIpRateLimit(ip);
    if (!ipRate.allowed) {
      return NextResponse.json(
        { ok: false, error: "Too many callback requests from this IP. Please try again later." },
        {
          status: 429,
          headers: {
            "Retry-After": retryAfterSeconds(ipRate.resetAt)
          }
        }
      );
    }

    const body = await request.json();
    const consent = Boolean(body.consent);

    if (!consent) {
      return NextResponse.json(
        { ok: false, error: "Callback consent is required." },
        { status: 400 }
      );
    }

    const rawPhone = String(body.phoneNumber || "");
    const phoneNumber = normalizeAndValidatePhoneNumber(rawPhone, "US");
    const requestType = body.requestType === "scheduled" ? "scheduled" : "instant";
    const source = String(body.source || "landing-page");

    if (!phoneNumber) {
      return NextResponse.json(
        { ok: false, error: "Please enter a valid phone number." },
        { status: 400 }
      );
    }

    let scheduledFor: string | null = null;
    if (requestType === "scheduled") {
      const scheduledInput = String(body.scheduledFor || "");
      const scheduledDate = new Date(scheduledInput);

      if (Number.isNaN(scheduledDate.getTime()) || scheduledDate.getTime() <= Date.now()) {
        return NextResponse.json(
          { ok: false, error: "Please choose a valid future time for the scheduled callback." },
          { status: 400 }
        );
      }

      scheduledFor = scheduledDate.toISOString();
    }

    const phoneRate = checkPhoneRateLimit(phoneNumber);
    if (!phoneRate.allowed) {
      return NextResponse.json(
        { ok: false, error: "This phone number has requested too many callbacks. Please try again later." },
        {
          status: 429,
          headers: {
            "Retry-After": retryAfterSeconds(phoneRate.resetAt)
          }
        }
      );
    }

    const callbackRequest = createCallbackRequest({
      phoneNumber,
      consent,
      source,
      ip,
      requestType,
      scheduledFor
    });

    const processedRequest =
      requestType === "instant" ? await initiateCallbackCall(callbackRequest.id) : callbackRequest;

    try {
      await sendLeadToCrm({
        event: requestType === "instant" ? "callback_requested" : "callback_scheduled",
        source,
        phoneNumber,
        consent,
        requestType,
        scheduledFor,
        callbackRequestId: processedRequest.id,
        callSid: processedRequest.callSid,
        requestedAt: new Date().toISOString(),
        ip
      });
    } catch (crmError) {
      console.error("CRM webhook error:", crmError);
    }

    return NextResponse.json({
      ok: true,
      callbackRequestId: processedRequest.id,
      callSid: processedRequest.callSid,
      message:
        requestType === "instant"
          ? "Callback initiated."
          : "Scheduled callback saved."
    });
  } catch (error) {
    console.error("Callback error:", error);
    const message = error instanceof Error ? error.message : "Failed to initiate callback.";

    return NextResponse.json(
      { ok: false, error: message },
      { status: 500 }
    );
  }
}
