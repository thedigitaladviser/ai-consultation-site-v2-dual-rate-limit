import { randomBytes, randomUUID } from "node:crypto";
import { getDb } from "@/lib/db";

export type AdminRecord = {
  email: string;
  name: string | null;
  image: string | null;
  invitedBy: string | null;
  createdAt: string;
  lastLoginAt: string | null;
};

export type AdminInviteRecord = {
  id: string;
  email: string;
  token: string;
  invitedBy: string;
  status: "pending" | "accepted" | "expired";
  acceptedAt: string | null;
  expiresAt: string;
  createdAt: string;
};

function normalizeEmail(email: string) {
  return email.trim().toLowerCase();
}

function readBootstrapAdmins() {
  return (process.env.ADMIN_EMAILS || "")
    .split(",")
    .map((email) => normalizeEmail(email))
    .filter(Boolean);
}

function mapAdmin(row: {
  email: string;
  name: string | null;
  image: string | null;
  invited_by: string | null;
  created_at: string;
  last_login_at: string | null;
}) {
  return {
    email: row.email,
    name: row.name,
    image: row.image,
    invitedBy: row.invited_by,
    createdAt: row.created_at,
    lastLoginAt: row.last_login_at
  } satisfies AdminRecord;
}

function mapInvite(row: {
  id: string;
  email: string;
  token: string;
  invited_by: string;
  status: "pending" | "accepted" | "expired";
  accepted_at: string | null;
  expires_at: string;
  created_at: string;
}) {
  return {
    id: row.id,
    email: row.email,
    token: row.token,
    invitedBy: row.invited_by,
    status: row.status,
    acceptedAt: row.accepted_at,
    expiresAt: row.expires_at,
    createdAt: row.created_at
  } satisfies AdminInviteRecord;
}

export function isBootstrapAdmin(email: string) {
  return readBootstrapAdmins().includes(normalizeEmail(email));
}

export function findAdmin(email: string) {
  const row = getDb()
    .prepare("SELECT email, name, image, invited_by, created_at, last_login_at FROM admins WHERE email = ?")
    .get(normalizeEmail(email)) as Parameters<typeof mapAdmin>[0] | undefined;

  return row ? mapAdmin(row) : null;
}

export function upsertAdmin(input: {
  email: string;
  name?: string | null;
  image?: string | null;
  invitedBy?: string | null;
}) {
  const now = new Date().toISOString();
  const email = normalizeEmail(input.email);

  getDb()
    .prepare(`
      INSERT INTO admins (email, name, image, invited_by, created_at, last_login_at)
      VALUES (?, ?, ?, ?, ?, ?)
      ON CONFLICT(email) DO UPDATE SET
        name = COALESCE(excluded.name, admins.name),
        image = COALESCE(excluded.image, admins.image),
        last_login_at = excluded.last_login_at
    `)
    .run(email, input.name ?? null, input.image ?? null, input.invitedBy ?? null, now, now);

  return findAdmin(email);
}

export function findPendingInviteByEmail(email: string) {
  const now = new Date().toISOString();
  const row = getDb()
    .prepare(`
      SELECT id, email, token, invited_by, status, accepted_at, expires_at, created_at
      FROM admin_invites
      WHERE email = ?
        AND status = 'pending'
        AND expires_at > ?
      ORDER BY created_at DESC
      LIMIT 1
    `)
    .get(normalizeEmail(email), now) as Parameters<typeof mapInvite>[0] | undefined;

  return row ? mapInvite(row) : null;
}

export function acceptPendingInvite(email: string, profile?: { name?: string | null; image?: string | null }) {
  const invite = findPendingInviteByEmail(email);
  if (!invite) {
    return null;
  }

  const now = new Date().toISOString();
  getDb()
    .prepare("UPDATE admin_invites SET status = 'accepted', accepted_at = ? WHERE id = ?")
    .run(now, invite.id);

  return upsertAdmin({
    email,
    name: profile?.name ?? null,
    image: profile?.image ?? null,
    invitedBy: invite.invitedBy
  });
}

export function canAdminSignIn(email: string, profile?: { name?: string | null; image?: string | null }) {
  if (findAdmin(email)) {
    upsertAdmin({ email, name: profile?.name ?? null, image: profile?.image ?? null });
    return true;
  }

  if (isBootstrapAdmin(email)) {
    upsertAdmin({ email, name: profile?.name ?? null, image: profile?.image ?? null, invitedBy: "bootstrap" });
    return true;
  }

  return Boolean(acceptPendingInvite(email, profile));
}

export function createAdminInvite(input: {
  email: string;
  invitedBy: string;
  expiresInDays?: number;
}) {
  const db = getDb();
  const now = new Date();
  const expiresAt = new Date(now.getTime() + (input.expiresInDays ?? 7) * 24 * 60 * 60 * 1000).toISOString();
  const email = normalizeEmail(input.email);
  const existing = findPendingInviteByEmail(email);

  if (existing) {
    return existing;
  }

  const invite = {
    id: randomUUID(),
    email,
    token: randomBytes(32).toString("hex"),
    invitedBy: normalizeEmail(input.invitedBy),
    status: "pending" as const,
    acceptedAt: null,
    expiresAt,
    createdAt: now.toISOString()
  };

  db.prepare(`
    INSERT INTO admin_invites (id, email, token, invited_by, status, accepted_at, expires_at, created_at)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?)
  `).run(
    invite.id,
    invite.email,
    invite.token,
    invite.invitedBy,
    invite.status,
    invite.acceptedAt,
    invite.expiresAt,
    invite.createdAt
  );

  return invite;
}

export function listAdmins() {
  const rows = getDb()
    .prepare("SELECT email, name, image, invited_by, created_at, last_login_at FROM admins ORDER BY created_at DESC")
    .all() as Array<Parameters<typeof mapAdmin>[0]>;

  return rows.map(mapAdmin);
}

export function listAdminInvites() {
  const rows = getDb()
    .prepare(`
      SELECT id, email, token, invited_by, status, accepted_at, expires_at, created_at
      FROM admin_invites
      ORDER BY created_at DESC
      LIMIT 50
    `)
    .all() as Array<Parameters<typeof mapInvite>[0]>;

  return rows.map(mapInvite);
}

export function listCallbackRequests(limit = 50) {
  return getDb()
    .prepare(`
      SELECT id, phone_number, source, request_type, status, scheduled_for, call_sid, last_error, created_at, updated_at
      FROM callback_requests
      ORDER BY created_at DESC
      LIMIT ?
    `)
    .all(limit) as Array<{
      id: string;
      phone_number: string;
      source: string;
      request_type: string;
      status: string;
      scheduled_for: string | null;
      call_sid: string | null;
      last_error: string | null;
      created_at: string;
      updated_at: string;
    }>;
}
