function getRequiredEnv(name: string) {
  const value = process.env[name]?.trim();
  if (!value) {
    throw new Error(`Missing required environment variable: ${name}`);
  }
  return value;
}

function getVoiceflowOutboundConfig() {
  const apiKey = getRequiredEnv("DM_API_KEY");
  const phoneNumberId = getRequiredEnv("VOICEFLOW_PHONE_NUMBER_ID");
  const baseUrl = process.env.VOICEFLOW_RUNTIME_API_BASE_URL?.trim() || "https://runtime-api.voiceflow.com";

  return {
    apiKey,
    phoneNumberId,
    baseUrl
  };
}

export async function createVoiceflowOutboundCall(input: {
  to: string;
  variables?: Record<string, string>;
}) {
  const { apiKey, phoneNumberId, baseUrl } = getVoiceflowOutboundConfig();
  const response = await fetch(`${baseUrl}/v1/phone-number/${phoneNumberId}/outbound`, {
    method: "POST",
    headers: {
      Authorization: apiKey,
      "Content-Type": "application/json"
    },
    body: JSON.stringify({
      to: input.to,
      variables: input.variables || {}
    }),
    cache: "no-store"
  });

  const data = (await response.json().catch(() => null)) as Record<string, unknown> | null;

  if (!response.ok) {
    throw new Error(
      `Voiceflow outbound call failed: ${response.status} ${
        typeof data?.message === "string" ? data.message : "Unknown error"
      }`.trim()
    );
  }

  return data;
}
