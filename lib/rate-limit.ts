type Entry = {
  count: number;
  resetAt: number;
};

import { getDb } from "@/lib/db";

function getPositiveNumber(value: string | undefined, fallback: number) {
  const raw = Number(value ?? fallback);
  return Number.isFinite(raw) && raw > 0 ? raw : fallback;
}

function readEntry(key: string, windowMs: number) {
  const db = getDb();
  const now = Date.now();
  const existing = db
    .prepare("SELECT count, reset_at FROM rate_limit_entries WHERE key = ?")
    .get(key) as { count: number; reset_at: number } | undefined;

  if (!existing || existing.reset_at <= now) {
    const fresh = { count: 0, resetAt: now + windowMs };
    db.prepare(`
      INSERT INTO rate_limit_entries (key, count, reset_at)
      VALUES (?, ?, ?)
      ON CONFLICT(key) DO UPDATE SET
        count = excluded.count,
        reset_at = excluded.reset_at
    `).run(key, fresh.count, fresh.resetAt);
    return fresh;
  }

  return { count: existing.count, resetAt: existing.reset_at } satisfies Entry;
}

export function checkRateLimit(key: string, max: number, windowMs: number) {
  const db = getDb();
  const entry = readEntry(key, windowMs);

  if (entry.count >= max) {
    return {
      allowed: false,
      remaining: 0,
      resetAt: entry.resetAt
    };
  }

  entry.count += 1;
  db.prepare("UPDATE rate_limit_entries SET count = ?, reset_at = ? WHERE key = ?").run(entry.count, entry.resetAt, key);

  return {
    allowed: true,
    remaining: Math.max(0, max - entry.count),
    resetAt: entry.resetAt
  };
}

export function checkIpRateLimit(ip: string) {
  const max = getPositiveNumber(process.env.RATE_LIMIT_MAX, 5);
  const windowMs = getPositiveNumber(process.env.RATE_LIMIT_WINDOW_MS, 900000);
  return checkRateLimit(`callback:ip:${ip}`, max, windowMs);
}

export function checkPhoneRateLimit(phoneNumber: string) {
  const max = getPositiveNumber(process.env.RATE_LIMIT_PHONE_MAX, 3);
  const windowMs = getPositiveNumber(process.env.RATE_LIMIT_PHONE_WINDOW_MS, 3600000);
  return checkRateLimit(`callback:phone:${phoneNumber}`, max, windowMs);
}
