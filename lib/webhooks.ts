type JsonValue = string | number | boolean | null | JsonValue[] | { [key: string]: JsonValue };

async function postJsonWebhook(url: string, token: string | undefined, payload: JsonValue) {
  const headers: Record<string, string> = {
    "Content-Type": "application/json"
  };

  if (token) {
    headers.Authorization = `Bearer ${token}`;
  }

  const response = await fetch(url, {
    method: "POST",
    headers,
    body: JSON.stringify(payload),
    cache: "no-store"
  });

  if (!response.ok) {
    const body = await response.text().catch(() => "");
    throw new Error(`Webhook failed: ${response.status} ${body}`.trim());
  }
}

export async function sendLeadToCrm(payload: Record<string, unknown>) {
  const url = process.env.CRM_WEBHOOK_URL;
  if (!url) {
    return { ok: true, skipped: true as const };
  }

  await postJsonWebhook(url, process.env.CRM_WEBHOOK_BEARER_TOKEN, payload as JsonValue);
  return { ok: true, skipped: false as const };
}

export async function sendCtaWebhook(payload: Record<string, unknown>) {
  const url = process.env.CTA_WEBHOOK_URL;
  if (!url) {
    return { ok: true, skipped: true as const };
  }

  await postJsonWebhook(url, process.env.CTA_WEBHOOK_BEARER_TOKEN, payload as JsonValue);
  return { ok: true, skipped: false as const };
}
