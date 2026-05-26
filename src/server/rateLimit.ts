import "server-only";
import { Redis } from "@upstash/redis";

const HAS_UPSTASH =
  !!process.env.UPSTASH_REDIS_REST_URL && !!process.env.UPSTASH_REDIS_REST_TOKEN;

const redis: Redis | null = HAS_UPSTASH
  ? new Redis({
      url: process.env.UPSTASH_REDIS_REST_URL!,
      token: process.env.UPSTASH_REDIS_REST_TOKEN!,
    })
  : null;

declare global {
  // eslint-disable-next-line no-var
  var __vedaai_rate_mem: Map<string, { used: number; date: string }> | undefined;
}

const mem: Map<string, { used: number; date: string }> =
  globalThis.__vedaai_rate_mem ?? (globalThis.__vedaai_rate_mem = new Map());

export const AI_DAILY_LIMIT = Number(process.env.AI_DAILY_LIMIT ?? 5);

function todayKey(): string {
  return new Date().toISOString().slice(0, 10);
}

function nextResetISO(): string {
  const d = new Date();
  d.setUTCDate(d.getUTCDate() + 1);
  d.setUTCHours(0, 0, 0, 0);
  return d.toISOString();
}

function redisKey(identity: string): string {
  return `vedaai:rate:${identity || "global"}:${todayKey()}`;
}

export type RateStatus = {
  used: number;
  remaining: number;
  limit: number;
  allowed: boolean;
  resetAt: string;
};

export async function getRateStatus(identity: string): Promise<RateStatus> {
  let used = 0;
  if (redis) {
    const v = await redis.get<number>(redisKey(identity));
    used = v ?? 0;
  } else {
    const today = todayKey();
    const entry = mem.get(identity || "global");
    used = !entry || entry.date !== today ? 0 : entry.used;
  }
  const remaining = Math.max(0, AI_DAILY_LIMIT - used);
  return {
    used,
    remaining,
    limit: AI_DAILY_LIMIT,
    allowed: remaining > 0,
    resetAt: nextResetISO(),
  };
}

export async function recordRateHit(identity: string): Promise<void> {
  if (redis) {
    const key = redisKey(identity);
    const next = await redis.incr(key);
    if (next === 1) {
      // First hit of the day — TTL to next UTC midnight.
      const ttl = Math.ceil((new Date(nextResetISO()).getTime() - Date.now()) / 1000);
      await redis.expire(key, ttl);
    }
    return;
  }
  const today = todayKey();
  const key = identity || "global";
  const entry = mem.get(key);
  if (!entry || entry.date !== today) {
    mem.set(key, { used: 1, date: today });
  } else {
    mem.set(key, { used: entry.used + 1, date: today });
  }
}

/** Extracts the best-effort caller identity from a Next.js Request. */
export function identityFromRequest(req: Request): string {
  const h = req.headers;
  const fwd = h.get("x-forwarded-for");
  if (fwd) return fwd.split(",")[0].trim();
  return h.get("x-real-ip") ?? h.get("cf-connecting-ip") ?? "global";
}
