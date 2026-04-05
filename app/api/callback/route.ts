import { NextRequest, NextResponse } from "next/server";
import { getTwilioClient, normalizeAndValidatePhoneNumber } from "@/lib/twilio";
import { checkIpRateLimit, checkPhoneRateLimit } from "@/lib/rate-limit";
import { sendLeadToCrm } from "@/lib/crm";

function getRequestIp(request: NextRequest) {
  const forwarded = request.headers.get("x-forwarded-for");
  if (forwarded) {
    return forwarded.split(",")[0].trim();
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

    if (!phoneNumber) {
      return NextResponse.json(
        { ok: false, error: "Please enter a valid phone number." },
        { status: 400 }
      );
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

    const callbackFrom = process.env.TWILIO_CALLBACK_FROM;
    const voiceflowMainNumber = process.env.VOICEFLOW_MAIN_NUMBER;
    const statusCallbackUrl = process.env.TWILIO_STATUS_CALLBACK_URL;

    if (!callbackFrom || !voiceflowMainNumber) {
      return NextResponse.json(
        { ok: false, error: "Twilio environment variables are incomplete." },
        { status: 500 }
      );
    }

    const client = getTwilioClient();

    const twiml = `
<Response>
  <Say voice="alice">Please hold while we connect you to our AI consultation assistant.</Say>
  <Dial answerOnBridge="true">
    <Number>${voiceflowMainNumber}</Number>
  </Dial>
</Response>`.trim();

    const call = await client.calls.create({
      to: phoneNumber,
      from: callbackFrom,
      twiml,
      ...(statusCallbackUrl
        ? {
            statusCallback: statusCallbackUrl,
            statusCallbackMethod: "POST",
            statusCallbackEvent: ["initiated", "ringing", "answered", "completed"]
          }
        : {})
    });

    try {
      await sendLeadToCrm({
        event: "callback_requested",
        source: body.source || "landing-page",
        phoneNumber,
        consent,
        callSid: call.sid,
        requestedAt: new Date().toISOString(),
        ip
      });
    } catch (crmError) {
      console.error("CRM webhook error:", crmError);
    }

    return NextResponse.json({
      ok: true,
      callSid: call.sid,
      message: "Callback initiated."
    });
  } catch (error) {
    console.error("Callback error:", error);

    return NextResponse.json(
      { ok: false, error: "Failed to initiate callback." },
      { status: 500 }
    );
  }
}
