"use server";

import { redirect } from "next/navigation";
import { registerAdminFromInvite } from "@/lib/admins";

export async function registerFromInvite(formData: FormData) {
  const token = String(formData.get("token") || "");
  const password = String(formData.get("password") || "");
  const country = String(formData.get("country") || "");
  const city = String(formData.get("city") || "");
  const state = String(formData.get("state") || "");
  const phoneNumber = String(formData.get("phoneNumber") || "");

  registerAdminFromInvite({
    token,
    password,
    country,
    city,
    state,
    phoneNumber
  });

  redirect("/admin/sign-in?registered=1");
}
