# AI Consultation Site v2.1

A hardened Next.js landing page for an SME-focused AI consultation funnel.

## Included hardening

- phone number validation with `libphonenumber-js`
- dual rate limiting for `/api/callback`
  - IP-based limit
  - phone-number-based limit
- explicit callback consent checkbox
- optional CRM webhook forwarding
- basic client-side analytics hooks
- Twilio callback bridge to your existing Voiceflow-connected number

## What it does

- lets a visitor call your main Voiceflow-connected toll-free number directly
- lets a visitor submit their phone number for an instant callback
- uses a second Twilio number to place the callback
- bridges the answered caller to your main Twilio number that already routes to the Voiceflow agent

## Required setup

Create a `.env.local` file from `.env.example`.

```bash
cp .env.example .env.local
```

Fill in:

- `NEXT_PUBLIC_TOLL_FREE_NUMBER`
- `TWILIO_ACCOUNT_SID`
- `TWILIO_AUTH_TOKEN`
- `TWILIO_CALLBACK_FROM`
- `VOICEFLOW_MAIN_NUMBER`
- `TWILIO_STATUS_CALLBACK_URL` optional
- `CRM_WEBHOOK_URL` optional
- `CRM_WEBHOOK_BEARER_TOKEN` optional
- `RATE_LIMIT_MAX` optional
- `RATE_LIMIT_WINDOW_MS` optional
- `RATE_LIMIT_PHONE_MAX` optional
- `RATE_LIMIT_PHONE_WINDOW_MS` optional
- `NEXT_PUBLIC_GA_MEASUREMENT_ID` optional

## Install

```bash
npm install
```

## Run locally

```bash
npm run dev
```

## Notes

The current rate limiter is in-memory, which is fine for local dev or a single process. For production across multiple instances, switch it to Redis, Upstash, or another shared store.

Do not use the same Twilio number for both `TWILIO_CALLBACK_FROM` and `VOICEFLOW_MAIN_NUMBER`.
