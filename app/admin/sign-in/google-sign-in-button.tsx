"use client";

import { signIn } from "next-auth/react";

export function GoogleSignInButton({ callbackUrl }: { callbackUrl: string }) {
  return (
    <button
      type="button"
      onClick={() => signIn("google", { callbackUrl })}
      className="mt-8 inline-flex h-14 w-full items-center justify-center rounded-2xl bg-white px-6 text-base font-semibold text-slate-950 transition hover:bg-emerald-100"
    >
      Continue with Google
    </button>
  );
}
