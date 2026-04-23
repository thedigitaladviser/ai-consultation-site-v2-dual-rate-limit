import { randomBytes, randomUUID } from "node:crypto";
import { getDb } from "@/lib/db";
import { hashPassword, verifyPassword } from "@/lib/password";

export type AdminRecord = {
  email: string;
  name: string | null;
  image: string | null;
  invitedBy: string | null;
  country: string | null;
  city: string | null;
  state: string | null;
  phoneNumber: string | null;
  hasPassword: boolean;
  createdAt: string;
  lastLoginAt: string | null;
};

export type AdminInviteRecord = {
  id: string;
  email: string;
  token: string;
  invitedBy: string;
  status: "pending" | "accepted" | "expired" | "cancelled";
  acceptedAt: string | null;
  expiresAt: string;
  createdAt: string;
};

type AdminPasswordResetRecord = {
  id: string;
  email: string;
  token: string;
  status: "pending" | "used" | "expired";
  expiresAt: string;
  usedAt: string | null;
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
  password_hash: string | null;
  country: string | null;
  city: string | null;
  state: string | null;
  phone_number: string | null;
  created_at: string;
  last_login_at: string | null;
}) {
  return {
    email: row.email,
    name: row.name,
    image: row.image,
    invitedBy: row.invited_by,
    country: row.country,
    city: row.city,
    state: row.state,
    phoneNumber: row.phone_number,
    hasPassword: Boolean(row.password_hash),
    createdAt: row.created_at,
    lastLoginAt: row.last_login_at
  } satisfies AdminRecord;
}

function mapInvite(row: {
  id: string;
  email: string;
  token: string;
  invited_by: string;
  status: "pending" | "accepted" | "expired" | "cancelled";
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

function mapPasswordReset(row: {
  id: string;
  email: string;
  token: string;
  status: "pending" | "used" | "expired";
  expires_at: string;
  used_at: string | null;
  created_at: string;
}) {
  return {
    id: row.id,
    email: row.email,
    token: row.token,
    status: row.status,
    expiresAt: row.expires_at,
    usedAt: row.used_at,
    createdAt: row.created_at
  } satisfies AdminPasswordResetRecord;
}

export function isBootstrapAdmin(email: string) {
  return readBootstrapAdmins().includes(normalizeEmail(email));
}

export function findAdmin(email: string) {
  const row = getDb()
    .prepare(`
      SELECT email, name, image, invited_by, password_hash, country, city, state, phone_number, created_at, last_login_at
      FROM admins
      WHERE email = ?
    `)
    .get(normalizeEmail(email)) as Parameters<typeof mapAdmin>[0] | undefined;

  return row ? mapAdmin(row) : null;
}

export function upsertAdmin(input: {
  email: string;
  name?: string | null;
  image?: string | null;
  invitedBy?: string | null;
  passwordHash?: string | null;
  country?: string | null;
  city?: string | null;
  state?: string | null;
  phoneNumber?: string | null;
}) {
  const now = new Date().toISOString();
  const email = normalizeEmail(input.email);

  getDb()
    .prepare(`
      INSERT INTO admins (
        email, name, image, invited_by, password_hash, country, city, state, phone_number, created_at, last_login_at
      )
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
      ON CONFLICT(email) DO UPDATE SET
        name = COALESCE(excluded.name, admins.name),
        image = COALESCE(excluded.image, admins.image),
        password_hash = COALESCE(excluded.password_hash, admins.password_hash),
        country = COALESCE(excluded.country, admins.country),
        city = COALESCE(excluded.city, admins.city),
        state = COALESCE(excluded.state, admins.state),
        phone_number = COALESCE(excluded.phone_number, admins.phone_number),
        last_login_at = excluded.last_login_at
    `)
    .run(
      email,
      input.name ?? null,
      input.image ?? null,
      input.invitedBy ?? null,
      input.passwordHash ?? null,
      input.country ?? null,
      input.city ?? null,
      input.state ?? null,
      input.phoneNumber ?? null,
      now,
      now
    );

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

export function findInviteByToken(token: string) {
  const now = new Date().toISOString();
  const row = getDb()
    .prepare(`
      SELECT id, email, token, invited_by, status, accepted_at, expires_at, created_at
      FROM admin_invites
      WHERE token = ?
      LIMIT 1
    `)
    .get(token) as Parameters<typeof mapInvite>[0] | undefined;

  if (!row) {
    return null;
  }

  if (row.status === "pending" && row.expires_at <= now) {
    getDb().prepare("UPDATE admin_invites SET status = 'expired' WHERE id = ?").run(row.id);
    return { ...mapInvite(row), status: "expired" as const };
  }

  return mapInvite(row);
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

export function cancelPendingInvite(inviteId: string) {
  const now = new Date().toISOString();
  const result = getDb()
    .prepare(`
      UPDATE admin_invites
      SET status = 'cancelled', accepted_at = ?
      WHERE id = ?
        AND status = 'pending'
    `)
    .run(now, inviteId);

  return result.changes > 0;
}

export function registerAdminFromInvite(input: {
  token: string;
  password: string;
  country: string;
  city: string;
  state: string;
  phoneNumber?: string | null;
}) {
  const invite = findInviteByToken(input.token);
  if (!invite || invite.status !== "pending") {
    throw new Error("This invite is invalid or expired.");
  }

  if (input.password.length < 8) {
    throw new Error("Password must be at least 8 characters.");
  }

  const now = new Date().toISOString();
  const admin = upsertAdmin({
    email: invite.email,
    invitedBy: invite.invitedBy,
    passwordHash: hashPassword(input.password),
    country: input.country.trim(),
    city: input.city.trim(),
    state: input.state.trim(),
    phoneNumber: input.phoneNumber?.trim() || null
  });

  getDb()
    .prepare("UPDATE admin_invites SET status = 'accepted', accepted_at = ? WHERE id = ?")
    .run(now, invite.id);

  return admin;
}

export function authenticateAdminWithPassword(email: string, password: string) {
  const normalizedEmail = normalizeEmail(email);
  const row = getDb()
    .prepare(`
      SELECT email, name, image, invited_by, password_hash, country, city, state, phone_number, created_at, last_login_at
      FROM admins
      WHERE email = ?
      LIMIT 1
    `)
    .get(normalizedEmail) as Parameters<typeof mapAdmin>[0] | undefined;

  if (!row?.password_hash) {
    return null;
  }

  if (!verifyPassword(password, row.password_hash)) {
    return null;
  }

  const now = new Date().toISOString();
  getDb().prepare("UPDATE admins SET last_login_at = ? WHERE email = ?").run(now, normalizedEmail);
  const admin = findAdmin(normalizedEmail);
  if (!admin) {
    return null;
  }

  return {
    email: admin.email,
    name: admin.name,
    image: admin.image
  };
}

export function createPasswordResetToken(email: string) {
  const normalizedEmail = normalizeEmail(email);
  const admin = findAdmin(normalizedEmail);
  if (!admin) {
    return null;
  }

  const db = getDb();
  const now = new Date();
  const expiresAt = new Date(now.getTime() + 60 * 60 * 1000).toISOString();
  const token = randomBytes(32).toString("hex");
  const id = randomUUID();

  db.prepare(`
    UPDATE admin_password_resets
    SET status = 'expired'
    WHERE email = ?
      AND status = 'pending'
  `).run(normalizedEmail);

  db.prepare(`
    INSERT INTO admin_password_resets (id, email, token, status, expires_at, used_at, created_at)
    VALUES (?, ?, ?, 'pending', ?, NULL, ?)
  `).run(id, normalizedEmail, token, expiresAt, now.toISOString());

  return {
    email: normalizedEmail,
    token,
    expiresAt
  };
}

export function findValidPasswordResetToken(token: string) {
  const now = new Date().toISOString();
  const row = getDb()
    .prepare(`
      SELECT id, email, token, status, expires_at, used_at, created_at
      FROM admin_password_resets
      WHERE token = ?
      LIMIT 1
    `)
    .get(token) as Parameters<typeof mapPasswordReset>[0] | undefined;

  if (!row) {
    return null;
  }

  if (row.status !== "pending" || row.expires_at <= now) {
    if (row.status === "pending" && row.expires_at <= now) {
      getDb().prepare("UPDATE admin_password_resets SET status = 'expired' WHERE id = ?").run(row.id);
    }
    return null;
  }

  return mapPasswordReset(row);
}

export function resetPasswordWithToken(token: string, newPassword: string) {
  if (newPassword.length < 8) {
    throw new Error("Password must be at least 8 characters.");
  }

  const resetRecord = findValidPasswordResetToken(token);
  if (!resetRecord) {
    throw new Error("Reset link is invalid or expired.");
  }

  const now = new Date().toISOString();
  upsertAdmin({
    email: resetRecord.email,
    passwordHash: hashPassword(newPassword)
  });

  getDb()
    .prepare("UPDATE admin_password_resets SET status = 'used', used_at = ? WHERE id = ?")
    .run(now, resetRecord.id);

  return true;
}

export function listAdmins() {
  const rows = getDb()
    .prepare(`
      SELECT email, name, image, invited_by, password_hash, country, city, state, phone_number, created_at, last_login_at
      FROM admins
      ORDER BY created_at DESC
    `)
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
