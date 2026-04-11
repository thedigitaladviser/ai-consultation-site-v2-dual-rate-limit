"use server";

import { revalidatePath } from "next/cache";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { createAdminInvite, findAdmin } from "@/lib/admins";
import { sendAdminInviteEmail } from "@/lib/email";

export async function inviteAdmin(formData: FormData) {
  const session = await getServerSession(authOptions);
  const inviterEmail = session?.user?.email;

  if (!inviterEmail || !findAdmin(inviterEmail)) {
    throw new Error("Unauthorized");
  }

  const email = String(formData.get("email") || "").trim().toLowerCase();
  if (!email || !email.includes("@")) {
    throw new Error("Enter a valid email address.");
  }

  const invite = createAdminInvite({
    email,
    invitedBy: inviterEmail
  });

  await sendAdminInviteEmail({
    to: invite.email,
    invitedBy: inviterEmail,
    token: invite.token
  });

  revalidatePath("/admin");
}
