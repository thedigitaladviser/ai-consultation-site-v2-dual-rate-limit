"use server";

import { redirect } from "next/navigation";
import { resetPasswordWithToken } from "@/lib/admins";

export async function completePasswordReset(formData: FormData) {
  const token = String(formData.get("token") || "");
  const password = String(formData.get("password") || "");
  const confirmPassword = String(formData.get("confirmPassword") || "");

  if (!token) {
    throw new Error("Reset token is required.");
  }

  if (password !== confirmPassword) {
    throw new Error("Passwords do not match.");
  }

  resetPasswordWithToken(token, password);
  redirect("/admin/sign-in?reset=1");
}
