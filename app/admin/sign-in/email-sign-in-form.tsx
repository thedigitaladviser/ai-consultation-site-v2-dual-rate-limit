"use client";

import { useState } from "react";
import { signIn } from "next-auth/react";

export function EmailSignInForm({ prefilledEmail }: { prefilledEmail?: string | null }) {
  const [email, setEmail] = useState(prefilledEmail || "");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setLoading(true);
    setError(null);

    const result = await signIn("credentials", {
      email,
      password,
      callbackUrl: "/admin",
      redirect: false
    });

    if (result?.error) {
      setError("Invalid email or password.");
      setLoading(false);
      return;
    }

    window.location.href = "/admin";
  }

  return (
    <form onSubmit={handleSubmit} className="mt-6 space-y-3">
      <input
        type="email"
        required
        value={email}
        onChange={(event) => setEmail(event.target.value)}
        placeholder="name@company.com"
        className="h-12 w-full rounded-2xl border border-white/20 bg-white/10 px-4 text-white placeholder:text-slate-300 outline-none focus:border-emerald-300"
      />
      <input
        type="password"
        required
        value={password}
        onChange={(event) => setPassword(event.target.value)}
        placeholder="Password"
        className="h-12 w-full rounded-2xl border border-white/20 bg-white/10 px-4 text-white placeholder:text-slate-300 outline-none focus:border-emerald-300"
      />
      <button
        type="submit"
        disabled={loading}
        className="inline-flex h-12 w-full items-center justify-center rounded-2xl bg-emerald-400 px-5 text-sm font-semibold text-slate-950 transition hover:bg-emerald-300 disabled:opacity-60"
      >
        {loading ? "Signing in..." : "Sign in with email"}
      </button>
      {error ? <p className="text-sm text-red-200">{error}</p> : null}
      <a href="/admin/forgot-password" className="inline-block text-sm text-emerald-200 hover:text-emerald-100">
        Forgot password?
      </a>
    </form>
  );
}
