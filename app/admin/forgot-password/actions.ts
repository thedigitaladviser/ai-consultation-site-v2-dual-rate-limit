"use server";

import { redirect } from "next/navigation";
import { createPasswordResetToken } from "@/lib/admins";
import { sendAdminPasswordResetEmail } from "@/lib/email";

export async function requestPasswordReset(formData: FormData) {
  const email = String(formData.get("email") || "").trim().toLowerCase();

  if (email && email.includes("@")) {
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
