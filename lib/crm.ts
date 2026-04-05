export async function sendLeadToCrm(payload: Record<string, unknown>) {
  const url = process.env.CRM_WEBHOOK_URL;
  if (!url) {
    return { ok: true, skipped: true as const };
  }

  const headers: Record<string, string> = {
    "Content-Type": "application/json"
  };

  const bearer = process.env.CRM_WEBHOOK_BEARER_TOKEN;
  if (bearer) {
    headers.Authorization = `Bearer ${bearer}`;
  }

  const response = await fetch(url, {
    method: "POST",
    headers,
    body: JSON.stringify(payload),
    cache: "no-store"
  });

  if (!response.ok) {
    const body = await response.text().catch(() => "");
    throw new Error(`CRM webhook failed: ${response.status} ${body}`.trim());
  }

  return { ok: true, skipped: false as const };
}
