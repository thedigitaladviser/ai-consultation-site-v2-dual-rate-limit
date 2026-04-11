#!/usr/bin/env bash
set -euo pipefail

APP_URL="${APP_URL:-http://127.0.0.1:3000}"

if [[ -z "${CRON_SECRET:-}" ]]; then
  echo "CRON_SECRET is required" >&2
  exit 1
fi

curl --fail --silent --show-error \
  --request POST \
  --header "Authorization: Bearer ${CRON_SECRET}" \
  "${APP_URL}/api/cron/scheduled-callbacks"
