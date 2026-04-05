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
  const [requestType, setRequestType] = useState<"instant" | "scheduled">("instant");
  const [scheduledFor, setScheduledFor] = useState("");
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const disabled = useMemo(() => {
    if (loading || !consent || !isLikelyPhone(phoneNumber)) {
      return true;
    }

    if (requestType === "scheduled") {
      return !scheduledFor;
    }

    return false;
  }, [loading, consent, phoneNumber, requestType, scheduledFor]);

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
          source: "landing-page",
          requestType,
          scheduledFor: requestType === "scheduled" ? new Date(scheduledFor).toISOString() : null
        })
      });

      const data = await response.json();

      if (!response.ok || !data.ok) {
        throw new Error(data.error || "Unable to start callback.");
      }

      trackEvent("callback_submit_success", { source: "landing-page", requestType });
      setMessage(
        requestType === "instant"
          ? "We’re calling you now. Please answer to connect with our AI consultation assistant."
          : "Your call has been scheduled. We’ll ring you at the selected time."
      );
      setPhoneNumber("");
      setConsent(false);
      setScheduledFor("");
      setRequestType("instant");
    } catch (err) {
      trackEvent("callback_submit_error", { requestType });
      setError(err instanceof Error ? err.message : "Something went wrong.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="rounded-[28px] border border-slate-200 bg-white p-4 shadow-soft sm:p-5">
      <div className="mb-4 grid gap-2 sm:grid-cols-2">
        <button
          type="button"
          onClick={() => setRequestType("instant")}
          className={`rounded-2xl border px-4 py-3 text-left transition ${
            requestType === "instant"
              ? "border-slate-900 bg-slate-900 text-white"
              : "border-slate-200 bg-slate-50 text-slate-700 hover:border-slate-300"
          }`}
        >
          <span className="block text-sm font-semibold">Call me instantly</span>
          <span className={`mt-1 block text-sm ${requestType === "instant" ? "text-slate-200" : "text-slate-500"}`}>
            Start the callback flow right away.
          </span>
        </button>
        <button
          type="button"
          onClick={() => setRequestType("scheduled")}
          className={`rounded-2xl border px-4 py-3 text-left transition ${
            requestType === "scheduled"
              ? "border-slate-900 bg-slate-900 text-white"
              : "border-slate-200 bg-slate-50 text-slate-700 hover:border-slate-300"
          }`}
        >
          <span className="block text-sm font-semibold">Schedule for later</span>
          <span className={`mt-1 block text-sm ${requestType === "scheduled" ? "text-slate-200" : "text-slate-500"}`}>
            Queue a callback for a future time.
          </span>
        </button>
      </div>

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
          {loading ? (requestType === "instant" ? "Calling..." : "Scheduling...") : requestType === "instant" ? "Call Me Instantly" : "Schedule This Call"}
        </button>
      </div>

      {requestType === "scheduled" ? (
        <div className="mt-3">
          <input
            type="datetime-local"
            required
            min={new Date(Date.now() + 15 * 60 * 1000).toISOString().slice(0, 16)}
            value={scheduledFor}
            onChange={(e) => setScheduledFor(e.target.value)}
            className="h-14 w-full rounded-2xl border border-slate-300 px-4 text-base outline-none transition focus:border-brand"
          />
        </div>
      ) : null}

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
