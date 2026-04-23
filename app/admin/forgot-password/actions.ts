"use server";

import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { createPasswordResetToken } from "@/lib/admins";
import { sendAdminPasswordResetEmail } from "@/lib/email";
import { checkPasswordResetEmailRateLimit, checkPasswordResetIpRateLimit } from "@/lib/rate-limit";

async function getRequestIp() {
  const requestHeaders = await headers();
  const trustedProxy = process.env.TRUST_PROXY_HEADERS === "true";

  if (!trustedProxy) {
    return "proxy-untrusted";
  }

  const preferredHeaders = ["cf-connecting-ip", "x-real-ip", "x-forwarded-for"];

  for (const header of preferredHeaders) {
    const value = requestHeaders.get(header);
    if (!value) {
      continue;
    }

    return header === "x-forwarded-for" ? value.split(",")[0].trim() : value.trim();
  }

  return "unknown";
}

export async function requestPasswordReset(formData: FormData) {
  const email = String(formData.get("email") || "").trim().toLowerCase();
  const ip = await getRequestIp();

  const ipRate = checkPasswordResetIpRateLimit(ip);
  if (!ipRate.allowed) {
    redirect("/admin/forgot-password?throttled=1");
  }

  if (email && email.includes("@")) {
    const emailRate = checkPasswordResetEmailRateLimit(email);
    if (!emailRate.allowed) {
      redirect("/admin/forgot-password?throttled=1");
    }

    const reset = createPasswordResetToken(email);
    if (reset) {
      await sendAdminPasswordResetEmail({
        to: reset.email,
        token: reset.token
      });
    }
  }

  redirect("/admin/forgot-password?sent=1");
}
