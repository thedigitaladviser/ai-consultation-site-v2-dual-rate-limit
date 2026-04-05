type Entry = {
  count: number;
  resetAt: number;
};

const store = new Map<string, Entry>();

function getPositiveNumber(value: string | undefined, fallback: number) {
  const raw = Number(value ?? fallback);
  return Number.isFinite(raw) && raw > 0 ? raw : fallback;
}

function readEntry(key: string, windowMs: number) {
  const now = Date.now();
  const existing = store.get(key);

  if (!existing || existing.resetAt <= now) {
    const fresh = { count: 0, resetAt: now + windowMs };
    store.set(key, fresh);
    return fresh;
  }

  return existing;
}

export function checkRateLimit(key: string, max: number, windowMs: number) {
  const entry = readEntry(key, windowMs);

  if (entry.count >= max) {
    return {
      allowed: false,
      remaining: 0,
      resetAt: entry.resetAt
    };
  }

  entry.count += 1;
  store.set(key, entry);

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
