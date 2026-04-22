import nodemailer from "nodemailer";

function getRequiredEnv(name: string) {
  const value = process.env[name]?.trim();
  if (!value) {
    throw new Error(`Missing required environment variable: ${name}`);
  }
  return value;
}

function getAppBaseUrl() {
  return (process.env.APP_BASE_URL || process.env.NEXTAUTH_URL || "http://localhost:3000").replace(/\/$/, "");
}

function getTransport() {
  return nodemailer.createTransport({
    service: "gmail",
    auth: {
      user: getRequiredEnv("GMAIL_USER"),
      pass: getRequiredEnv("GMAIL_APP_PASSWORD")
    }
  });
}

export function getInviteUrl(token: string) {
  return `${getAppBaseUrl()}/admin/sign-in?invite=${token}`;
}

export async function sendAdminInviteEmail(input: {
  to: string;
  invitedBy: string;
  token: string;
}) {
  const inviteUrl = getInviteUrl(input.token);
  const from = process.env.GMAIL_FROM || getRequiredEnv("GMAIL_USER");

  await getTransport().sendMail({
    from,
    to: input.to,
    subject: "You're invited to the AI Consultation admin portal",
    text: [
      `${input.invitedBy} invited you to become an admin for the AI Consultation portal.`,
      "",
      `Open your invite link to choose Google OAuth or email registration: ${inviteUrl}`,
      "",
      "This invite expires automatically."
    ].join("\n"),
    html: `
      <p>${input.invitedBy} invited you to become an admin for the AI Consultation portal.</p>
      <p><a href="${inviteUrl}">Open invite and choose a sign-in method</a></p>
      <p>This invite expires automatically.</p>
    `
  });
}
