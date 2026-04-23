import Link from "next/link";
import { requestPasswordReset } from "@/app/admin/forgot-password/actions";

type ForgotPasswordPageProps = {
  searchParams?: Promise<{
    sent?: string;
  }>;
};

export default async function ForgotPasswordPage({ searchParams }: ForgotPasswordPageProps) {
  const params = await searchParams;
  const sent = params?.sent === "1";

  return (
    <main className="min-h-screen bg-slate-950 px-6 py-16 text-white">
      <div className="mx-auto max-w-md rounded-[32px] border border-white/10 bg-white/10 p-8 shadow-2xl shadow-black/30">
        <p className="text-sm font-semibold uppercase tracking-[0.2em] text-emerald-300">Admin portal</p>
        <h1 className="mt-4 text-3xl font-semibold tracking-tight">Forgot password</h1>
        <p className="mt-4 text-slate-300">
          Enter your admin email and we will send a password reset link if the account exists.
        </p>

        {sent ? (
          <p className="mt-5 rounded-2xl bg-emerald-500/20 p-4 text-sm text-emerald-100">
            If that email is registered, a reset link has been sent.
          </p>
        ) : null}

        <form action={requestPasswordReset} className="mt-6 space-y-3">
          <input
            type="email"
            name="email"
            required
            placeholder="name@company.com"
            className="h-12 w-full rounded-2xl border border-white/20 bg-white/10 px-4 text-white placeholder:text-slate-300 outline-none focus:border-emerald-300"
          />
          <button
            type="submit"
            className="inline-flex h-12 w-full items-center justify-center rounded-2xl bg-white px-5 text-sm font-semibold text-slate-950 transition hover:bg-emerald-100"
          >
            Send reset link
          </button>
        </form>

        <Link href="/admin/sign-in" className="mt-5 inline-block text-sm text-emerald-200 hover:text-emerald-100">
          Back to sign in
        </Link>
      </div>
    </main>
  );
}
