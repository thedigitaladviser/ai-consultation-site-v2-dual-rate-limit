import { getServerSession } from "next-auth";
import { redirect } from "next/navigation";
import { authOptions } from "@/lib/auth";
import { GoogleSignInButton } from "@/app/admin/sign-in/google-sign-in-button";
import { EmailSignInForm } from "@/app/admin/sign-in/email-sign-in-form";
import { findInviteByToken } from "@/lib/admins";
import { registerFromInvite } from "@/app/admin/sign-in/actions";

const COUNTRIES = [
  "United States",
  "Canada",
  "United Kingdom",
  "Australia",
  "India",
  "Germany",
  "France",
  "Italy",
  "Spain",
  "Netherlands",
  "Brazil",
  "Mexico",
  "South Africa",
  "United Arab Emirates",
  "Saudi Arabia",
  "Singapore",
  "Japan",
  "South Korea",
  "New Zealand"
];

type SignInPageProps = {
  searchParams?: Promise<{
    error?: string;
    invite?: string;
    registered?: string;
  }>;
};

export default async function AdminSignInPage({ searchParams }: SignInPageProps) {
  const session = await getServerSession(authOptions);
  const params = await searchParams;

  if (session?.user?.email) {
    redirect("/admin");
  }

  const inviteToken = params?.invite || "";
  const invite = inviteToken ? findInviteByToken(inviteToken) : null;
  const callbackUrl = params?.invite ? `/admin?invite=${encodeURIComponent(params.invite)}` : "/admin";
  const errorMessage =
    params?.error === "AccessDenied"
      ? "This Google account is not an invited admin yet."
      : params?.error
        ? "Sign-in failed. Please try again."
        : null;
  const registeredMessage = params?.registered ? "Registration complete. You can sign in with email now." : null;

  return (
    <main className="min-h-screen bg-slate-950 px-6 py-16 text-white">
      <div className="mx-auto max-w-4xl rounded-[32px] border border-white/10 bg-white/10 p-8 shadow-2xl shadow-black/30">
        <p className="text-sm font-semibold uppercase tracking-[0.2em] text-emerald-300">Admin portal</p>
        <h1 className="mt-4 text-3xl font-semibold tracking-tight">Admin sign in</h1>
        <p className="mt-4 text-slate-300">Use Google OAuth or sign in with your admin email and password.</p>

        {errorMessage ? <p className="mt-5 rounded-2xl bg-red-500/15 p-4 text-sm text-red-100">{errorMessage}</p> : null}
        {registeredMessage ? (
          <p className="mt-5 rounded-2xl bg-emerald-500/20 p-4 text-sm text-emerald-100">{registeredMessage}</p>
        ) : null}

        <div className="mt-8 grid gap-8 lg:grid-cols-2">
          <section className="rounded-2xl border border-white/15 bg-white/5 p-5">
            <p className="text-sm font-semibold uppercase tracking-[0.14em] text-emerald-200">Google OAuth</p>
            <GoogleSignInButton callbackUrl={callbackUrl} />
          </section>

          <section className="rounded-2xl border border-white/15 bg-white/5 p-5">
            <p className="text-sm font-semibold uppercase tracking-[0.14em] text-emerald-200">Email + Password</p>
            <EmailSignInForm prefilledEmail={invite?.email ?? null} />
          </section>
        </div>

        {invite && invite.status === "pending" ? (
          <section className="mt-8 rounded-2xl border border-emerald-300/30 bg-emerald-400/10 p-5">
            <p className="text-sm font-semibold uppercase tracking-[0.14em] text-emerald-200">Invite registration</p>
            <p className="mt-2 text-sm text-emerald-50">
              You can register this invited admin account with a password and basic profile details.
            </p>
            <form action={registerFromInvite} className="mt-5 grid gap-3 sm:grid-cols-2">
              <input type="hidden" name="token" value={invite.token} />
              <div className="sm:col-span-2">
                <label className="mb-1 block text-sm text-emerald-50">Email</label>
                <input
                  type="email"
                  name="email"
                  value={invite.email}
                  readOnly
                  className="h-12 w-full rounded-2xl border border-white/15 bg-white/10 px-4 text-white outline-none"
                />
              </div>
              <div className="sm:col-span-2">
                <label className="mb-1 block text-sm text-emerald-50">Password</label>
                <input
                  type="password"
                  name="password"
                  required
                  minLength={8}
                  placeholder="Create a password"
                  className="h-12 w-full rounded-2xl border border-white/15 bg-white/10 px-4 text-white placeholder:text-slate-200 outline-none focus:border-emerald-200"
                />
              </div>
              <div className="sm:col-span-2">
                <label className="mb-1 block text-sm text-emerald-50">Country</label>
                <select
                  name="country"
                  required
                  defaultValue=""
                  className="h-12 w-full rounded-2xl border border-white/15 bg-slate-900 px-4 text-white outline-none focus:border-emerald-200"
                >
                  <option value="" disabled>
                    Select country
                  </option>
                  {COUNTRIES.map((country) => (
                    <option key={country} value={country}>
                      {country}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="mb-1 block text-sm text-emerald-50">City</label>
                <input
                  type="text"
                  name="city"
                  required
                  className="h-12 w-full rounded-2xl border border-white/15 bg-white/10 px-4 text-white outline-none focus:border-emerald-200"
                />
              </div>
              <div>
                <label className="mb-1 block text-sm text-emerald-50">State</label>
                <input
                  type="text"
                  name="state"
                  required
                  className="h-12 w-full rounded-2xl border border-white/15 bg-white/10 px-4 text-white outline-none focus:border-emerald-200"
                />
              </div>
              <div className="sm:col-span-2">
                <label className="mb-1 block text-sm text-emerald-50">Phone number (optional)</label>
                <input
                  type="tel"
                  name="phoneNumber"
                  placeholder="+1 555 123 4567"
                  className="h-12 w-full rounded-2xl border border-white/15 bg-white/10 px-4 text-white placeholder:text-slate-200 outline-none focus:border-emerald-200"
                />
              </div>
              <button
                type="submit"
                className="sm:col-span-2 inline-flex h-12 items-center justify-center rounded-2xl bg-white px-5 text-sm font-semibold text-slate-950 transition hover:bg-emerald-100"
              >
                Complete registration
              </button>
            </form>
          </section>
        ) : null}
      </div>
    </main>
  );
}
