import { randomUUID } from "node:crypto";
import { getDb } from "@/lib/db";
import { createVoiceflowOutboundCall } from "@/lib/voiceflow";

export type CallbackRequestRecord = {
  id: string;
  phoneNumber: string;
  consent: boolean;
  source: string;
  ip: string;
  requestType: "instant" | "scheduled";
  status: "pending" | "scheduled" | "initiated" | "failed";
  scheduledFor: string | null;
  callSid: string | null;
  lastError: string | null;
  createdAt: string;
  updatedAt: string;
};

const callbackRequestRowSelect = `
  SELECT
    id,
    phone_number,
    consent,
    source,
    ip,
    request_type,
    status,
    scheduled_for,
    call_sid,
    last_error,
    created_at,
    updated_at
  FROM callback_requests
`;

function getOutboundCallReference(data: Record<string, unknown> | null) {
  const candidates = ["callID", "callId", "id", "outboundCallId", "traceId"];

  for (const key of candidates) {
    const value = data?.[key];
    if (typeof value === "string" && value) {
      return value;
    }
  }

  return null;
}

export function createCallbackRequest(input: {
  phoneNumber: string;
  consent: boolean;
  source: string;
  ip: string;
  requestType: "instant" | "scheduled";
  scheduledFor: string | null;
}) {
  const db = getDb();
  const now = new Date().toISOString();
  const id = randomUUID();
  const status = input.requestType === "scheduled" ? "scheduled" : "pending";

  db.prepare(`
    INSERT INTO callback_requests (
      id, phone_number, consent, source, ip, request_type, status, scheduled_for, call_sid, last_error, created_at, updated_at
    ) VALUES (
      @id, @phone_number, @consent, @source, @ip, @request_type, @status, @scheduled_for, NULL, NULL, @created_at, @updated_at
    )
  `).run({
    id,
    phone_number: input.phoneNumber,
    consent: input.consent ? 1 : 0,
    source: input.source,
    ip: input.ip,
    request_type: input.requestType,
    status,
    scheduled_for: input.scheduledFor,
    created_at: now,
    updated_at: now
  });

  return getCallbackRequestById(id);
}

export function getCallbackRequestById(id: string) {
  const db = getDb();
  const row = db.prepare(`${callbackRequestRowSelect} WHERE id = ?`).get(id) as
    | {
        id: string;
        phone_number: string;
        consent: number;
        source: string;
        ip: string;
        request_type: "instant" | "scheduled";
        status: "pending" | "scheduled" | "initiated" | "failed";
        scheduled_for: string | null;
        call_sid: string | null;
        last_error: string | null;
        created_at: string;
        updated_at: string;
      }
    | undefined;

  if (!row) {
    throw new Error(`Callback request not found: ${id}`);
  }

  return {
    id: row.id,
    phoneNumber: row.phone_number,
    consent: Boolean(row.consent),
    source: row.source,
    ip: row.ip,
    requestType: row.request_type,
    status: row.status,
    scheduledFor: row.scheduled_for,
    callSid: row.call_sid,
    lastError: row.last_error,
    createdAt: row.created_at,
    updatedAt: row.updated_at
  } satisfies CallbackRequestRecord;
}

export async function initiateCallbackCall(callbackRequestId: string) {
  const callbackRequest = getCallbackRequestById(callbackRequestId);
  const db = getDb();

  try {
    const outboundCall = await createVoiceflowOutboundCall({
      to: callbackRequest.phoneNumber,
      variables: {
        callback_request_id: callbackRequest.id,
        source: callbackRequest.source,
        request_type: callbackRequest.requestType
      }
    });
    const callReference = getOutboundCallReference(outboundCall);

    const updatedAt = new Date().toISOString();
    db.prepare(`
      UPDATE callback_requests
      SET status = 'initiated',
          call_sid = ?,
          last_error = NULL,
          updated_at = ?
      WHERE id = ?
    `).run(callReference, updatedAt, callbackRequestId);

    return {
      ...getCallbackRequestById(callbackRequestId),
      callSid: callReference
    };
  } catch (error) {
    const updatedAt = new Date().toISOString();
    const lastError = error instanceof Error ? error.message : "Unknown callback initiation error";

    db.prepare(`
      UPDATE callback_requests
      SET status = 'failed',
          last_error = ?,
          updated_at = ?
      WHERE id = ?
    `).run(lastError, updatedAt, callbackRequestId);

    throw error;
  }
}

export function claimDueScheduledCallbacks(limit = 20) {
  const db = getDb();
  const now = new Date().toISOString();
  const rows = db.prepare(`
    SELECT id
    FROM callback_requests
    WHERE status = 'scheduled'
      AND scheduled_for IS NOT NULL
      AND scheduled_for <= ?
    ORDER BY scheduled_for ASC
    LIMIT ?
  `).all(now, limit) as Array<{ id: string }>;

  const claim = db.prepare(`
    UPDATE callback_requests
    SET status = 'pending',
        updated_at = ?
    WHERE id = ?
      AND status = 'scheduled'
  `);

  const claimed: CallbackRequestRecord[] = [];

  const transaction = db.transaction(() => {
    for (const row of rows) {
      const result = claim.run(now, row.id);
      if (result.changes > 0) {
        claimed.push(getCallbackRequestById(row.id));
      }
    }
  });

  transaction();
  return claimed;
}

export function recordCtaEvent(input: {
  eventName: string;
  ctaId: string;
  href?: string | null;
  source: string;
  metadata?: Record<string, unknown>;
}) {
  const db = getDb();
  db.prepare(`
    INSERT INTO cta_events (id, event_name, cta_id, href, source, metadata_json, created_at)
    VALUES (?, ?, ?, ?, ?, ?, ?)
  `).run(
    randomUUID(),
    input.eventName,
    input.ctaId,
    input.href ?? null,
    input.source,
    input.metadata ? JSON.stringify(input.metadata) : null,
    new Date().toISOString()
  );
}
