"use client";

import { useMemo, useState } from "react";
import { trackEvent } from "@/lib/analytics";

function isLikelyPhone(value: string) {
  const digits = value.replace(/\D/g, "");
  return digits.length >= 10;
}

export function CallbackForm() {
  const [phoneNumber, setPhoneNumber] = useState("");
  const [consent, setConsent] = useState(false);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const disabled = useMemo(() => loading || !consent || !isLikelyPhone(phoneNumber), [loading, consent, phoneNumber]);

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (disabled) return;

    setLoading(true);
    setError(null);
    setMessage(null);

    trackEvent("callback_submit_attempt");

    try {
      const response = await fetch("/api/callback", {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          phoneNumber,
          consent,
          source: "landing-page"
        })
      });

      const data = await response.json();

      if (!response.ok || !data.ok) {
        throw new Error(data.error || "Unable to start callback.");
      }

      trackEvent("callback_submit_success", { source: "landing-page" });
      setMessage("We’re calling you now. Please answer to connect with our AI consultation assistant.");
      setPhoneNumber("");
      setConsent(false);
    } catch (err) {
      trackEvent("callback_submit_error");
      setError(err instanceof Error ? err.message : "Something went wrong.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="rounded-[28px] border border-slate-200 bg-white p-4 shadow-soft sm:p-5">
      <div className="flex flex-col gap-3 sm:flex-row">
        <input
          type="tel"
          inputMode="tel"
          autoComplete="tel"
          required
          value={phoneNumber}
          onChange={(e) => setPhoneNumber(e.target.value)}
          placeholder="Enter your phone number"
          className="h-14 flex-1 rounded-2xl border border-slate-300 px-4 text-base outline-none transition placeholder:text-slate-400 focus:border-brand"
        />
        <button
          type="submit"
          disabled={disabled}
          className="h-14 rounded-2xl bg-slate-900 px-6 text-base font-semibold text-white transition hover:bg-slate-800 disabled:cursor-not-allowed disabled:opacity-70"
        >
          {loading ? "Calling..." : "Call Me Instantly"}
        </button>
      </div>

      <label className="mt-4 flex items-start gap-3 text-sm text-slate-600">
        <input
          type="checkbox"
          checked={consent}
          onChange={(e) => setConsent(e.target.checked)}
          className="mt-0.5 h-4 w-4 rounded border-slate-300"
        />
        <span>
          I agree to receive a callback for this requested AI consultation at the number provided.
        </span>
      </label>

      {message ? <p className="mt-3 text-sm font-medium text-emerald-700">{message}</p> : null}
      {error ? <p className="mt-3 text-sm font-medium text-red-600">{error}</p> : null}
    </form>
  );
}
