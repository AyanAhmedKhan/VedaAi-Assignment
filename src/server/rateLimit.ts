import "server-only";

declare global {
  // eslint-disable-next-line no-var
  var __vedaai_rate: Map<string, { used: number; date: string }> | undefined;
}

const store: Map<string, { used: number; date: string }> =
  globalThis.__vedaai_rate ?? (globalThis.__vedaai_rate = new Map());

export const AI_DAILY_LIMIT = Number(process.env.AI_DAILY_LIMIT ?? 5);

function todayKey(): string {
  // UTC day boundary so the limit is predictable across regions.
  return new Date().toISOString().slice(0, 10);
}

function nextResetISO(): string {
  const d = new Date();
  d.setUTCDate(d.getUTCDate() + 1);
  d.setUTCHours(0, 0, 0, 0);
  return d.toISOString();
}

export type RateStatus = {
  used: number;
  remaining: number;
  limit: number;
  allowed: boolean;
  resetAt: string;
};

export function getRateStatus(identity: string): RateStatus {
  const key = identity || "global";
  const today = todayKey();
  const entry = store.get(key);
  const used = !entry || entry.date !== today ? 0 : entry.used;
  const remaining = Math.max(0, AI_DAILY_LIMIT - used);
  return {
    used,
    remaining,
    limit: AI_DAILY_LIMIT,
    allowed: remaining > 0,
    resetAt: nextResetISO(),
  };
}

/** Records a successful AI call. Should be called only AFTER the LLM succeeds. */
export function recordRateHit(identity: string) {
  const key = identity || "global";
  const today = todayKey();
  const entry = store.get(key);
  if (!entry || entry.date !== today) {
    store.set(key, { used: 1, date: today });
  } else {
    store.set(key, { used: entry.used + 1, date: today });
  }
}

/** Extracts the best-effort caller identity from a Next.js Request. */
export function identityFromRequest(req: Request): string {
  const h = req.headers;
  const fwd = h.get("x-forwarded-for");
  if (fwd) return fwd.split(",")[0].trim();
  return h.get("x-real-ip") ?? h.get("cf-connecting-ip") ?? "global";
}
