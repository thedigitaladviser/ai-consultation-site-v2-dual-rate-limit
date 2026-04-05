# AI Consultation Site v2.1

A hardened Next.js landing page for an SME-focused AI consultation funnel.

## Included hardening

- phone number validation with `libphonenumber-js`
- SQLite-backed dual rate limiting for `/api/callback`
  - IP-based limit
  - phone-number-based limit
- explicit callback consent checkbox
- optional CRM webhook forwarding
- optional CTA webhook forwarding for dial/callback buttons
- basic client-side analytics hooks
- Voiceflow outbound callback trigger for instant and scheduled calls
- persisted scheduled callbacks with a cron-safe runner endpoint

## What it does

- lets a visitor call your main Voiceflow-connected toll-free number directly
- lets a visitor submit their phone number for an instant callback
- lets a visitor schedule a callback for later
- uses the Voiceflow runtime outbound API to place the callback

## Required setup

Create a `.env.local` file from `.env.example`.

```bash
cp .env.example .env.local
```

Fill in:

- `NEXT_PUBLIC_TOLL_FREE_NUMBER`
- `VOICEFLOW_PHONE_NUMBER_ID`
- `DM_API_KEY`
- `VOICEFLOW_RUNTIME_API_BASE_URL` optional
- `CRM_WEBHOOK_URL` optional
- `CRM_WEBHOOK_BEARER_TOKEN` optional
- `CTA_WEBHOOK_URL` optional
- `CTA_WEBHOOK_BEARER_TOKEN` optional
- `RATE_LIMIT_MAX` optional
- `RATE_LIMIT_WINDOW_MS` optional
- `RATE_LIMIT_PHONE_MAX` optional
- `RATE_LIMIT_PHONE_WINDOW_MS` optional
- `SQLITE_DB_PATH` optional
- `TRUST_PROXY_HEADERS=true` when Traefik/Cloudflare is sanitizing client IP headers
- `CRON_SECRET` required if you want to run scheduled callbacks
- `NEXT_PUBLIC_GA_MEASUREMENT_ID` optional

## Install

```bash
npm install
```

Use Node `20.9.0+` for local dev and deployment.

## Run locally

```bash
npm run dev
```

## Notes

- SQLite persistence now stores callback requests, CTA events, and rate limit counters in `data/app.db` by default.
- To process scheduled callbacks on your VPS, have cron call `POST /api/cron/scheduled-callbacks` with `Authorization: Bearer $CRON_SECRET`.
- Only enable `TRUST_PROXY_HEADERS=true` when Traefik is stripping client-supplied forwarding headers and you trust the Cloudflare/Traefik chain.
- Instant and scheduled callback jobs now call `POST /v1/phone-number/{VOICEFLOW_PHONE_NUMBER_ID}/outbound` on the Voiceflow runtime API.
