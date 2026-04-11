import { getServerSession } from "next-auth";
import { redirect } from "next/navigation";
import { authOptions } from "@/lib/auth";
import { GoogleSignInButton } from "@/app/admin/sign-in/google-sign-in-button";

type SignInPageProps = {
  searchParams?: Promise<{
    error?: string;
    invite?: string;
  }>;
};

export default async function AdminSignInPage({ searchParams }: SignInPageProps) {
  const session = await getServerSession(authOptions);
  const params = await searchParams;

  if (session?.user?.email) {
    redirect("/admin");
  }

  const callbackUrl = params?.invite ? `/admin?invite=${encodeURIComponent(params.invite)}` : "/admin";
  const errorMessage =
    params?.error === "AccessDenied"
      ? "This Google account is not an invited admin yet."
      : params?.error
        ? "Sign-in failed. Please try again."
        : null;

  return (
    <main className="min-h-screen bg-slate-950 px-6 py-16 text-white">
      <div className="mx-auto max-w-md rounded-[32px] border border-white/10 bg-white/10 p-8 shadow-2xl shadow-black/30">
        <p className="text-sm font-semibold uppercase tracking-[0.2em] text-emerald-300">Admin portal</p>
        <h1 className="mt-4 text-3xl font-semibold tracking-tight">Sign in with Google</h1>
        <p className="mt-4 text-slate-300">
          Use an invited Google account to manage scheduled callbacks and admin invites.
        </p>

        {errorMessage ? <p className="mt-5 rounded-2xl bg-red-500/15 p-4 text-sm text-red-100">{errorMessage}</p> : null}

        <GoogleSignInButton callbackUrl={callbackUrl} />
      </div>
    </main>
  );
}
