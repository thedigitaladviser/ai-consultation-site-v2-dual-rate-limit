import Link from "next/link";
import { findValidPasswordResetToken } from "@/lib/admins";
import { completePasswordReset } from "@/app/admin/reset-password/actions";

type ResetPasswordPageProps = {
  searchParams?: Promise<{
    token?: string;
  }>;
};

export default async function ResetPasswordPage({ searchParams }: ResetPasswordPageProps) {
  const params = await searchParams;
  const token = params?.token || "";
  const resetRecord = token ? findValidPasswordResetToken(token) : null;

  return (
    <main className="min-h-screen bg-slate-950 px-6 py-16 text-white">
      <div className="mx-auto max-w-md rounded-[32px] border border-white/10 bg-white/10 p-8 shadow-2xl shadow-black/30">
        <p className="text-sm font-semibold uppercase tracking-[0.2em] text-emerald-300">Admin portal</p>
        <h1 className="mt-4 text-3xl font-semibold tracking-tight">Reset password</h1>

        {!resetRecord ? (
          <>
            <p className="mt-4 rounded-2xl bg-red-500/15 p-4 text-sm text-red-100">
              This reset link is invalid or expired.
            </p>
            <Link href="/admin/forgot-password" className="mt-5 inline-block text-sm text-emerald-200 hover:text-emerald-100">
              Request a new reset link
            </Link>
          </>
        ) : (
          <>
            <p className="mt-4 text-slate-300">Set a new password for {resetRecord.email}.</p>
            <form action={completePasswordReset} className="mt-6 space-y-3">
              <input type="hidden" name="token" value={resetRecord.token} />
              <input
                type="password"
                name="password"
                required
                minLength={8}
                placeholder="New password"
                className="h-12 w-full rounded-2xl border border-white/20 bg-white/10 px-4 text-white placeholder:text-slate-300 outline-none focus:border-emerald-300"
              />
              <input
                type="password"
                name="confirmPassword"
                required
                minLength={8}
                placeholder="Confirm new password"
                className="h-12 w-full rounded-2xl border border-white/20 bg-white/10 px-4 text-white placeholder:text-slate-300 outline-none focus:border-emerald-300"
              />
              <button
                type="submit"
                className="inline-flex h-12 w-full items-center justify-center rounded-2xl bg-white px-5 text-sm font-semibold text-slate-950 transition hover:bg-emerald-100"
              >
                Reset password
              </button>
            </form>
          </>
        )}
      </div>
    </main>
  );
}
