import "server-only";
import { Redis } from "@upstash/redis";
import type { Assignment } from "@/types/assignment";

/**
 * Persistent store backed by Upstash Redis when the env vars are present
 * (UPSTASH_REDIS_REST_URL + UPSTASH_REDIS_REST_TOKEN), otherwise falls back
 * to an in-memory Map (good for local dev — does NOT survive serverless
 * cold starts on Vercel, which is exactly the bug this module fixes).
 */

const HAS_UPSTASH =
  !!process.env.UPSTASH_REDIS_REST_URL && !!process.env.UPSTASH_REDIS_REST_TOKEN;

const redis: Redis | null = HAS_UPSTASH
  ? new Redis({
      url: process.env.UPSTASH_REDIS_REST_URL!,
      token: process.env.UPSTASH_REDIS_REST_TOKEN!,
    })
  : null;

const ASSIGN_HASH = "vedaai:assignments";
const ASSIGN_INDEX = "vedaai:assignments:index"; // sorted by createdAt
const NOTIF_LIST = "vedaai:notifs";
const NOTIF_UNREAD = "vedaai:notifs:unread";

/* ---------- In-memory fallback ---------- */

declare global {
  // eslint-disable-next-line no-var
  var __vedaai_store_mem: Map<string, Assignment> | undefined;
  // eslint-disable-next-line no-var
  var __vedaai_notifs_mem: Notification[] | undefined;
}

const memAssign: Map<string, Assignment> =
  globalThis.__vedaai_store_mem ?? (globalThis.__vedaai_store_mem = new Map());
const memNotifs: Notification[] =
  globalThis.__vedaai_notifs_mem ?? (globalThis.__vedaai_notifs_mem = []);

/* ---------- Assignments ---------- */

function unwrap(raw: unknown): Assignment | undefined {
  if (raw == null) return undefined;
  // Upstash returns parsed objects when storing JSON via the SDK; some
  // older versions return strings — handle both.
  if (typeof raw === "string") {
    try {
      return JSON.parse(raw) as Assignment;
    } catch {
      return undefined;
    }
  }
  return raw as Assignment;
}

export const store = {
  async list(): Promise<Assignment[]> {
    if (redis) {
      // Get newest 50 ids from the sorted set
      const ids = (await redis.zrange<string[]>(ASSIGN_INDEX, 0, 49, {
        rev: true,
      })) as string[];
      if (!ids || ids.length === 0) return [];
      const raws = await redis.hmget<Record<string, unknown>>(ASSIGN_HASH, ...ids);
      if (!raws) return [];
      return ids
        .map((id) => unwrap(raws[id]))
        .filter((x): x is Assignment => Boolean(x));
    }
    return [...memAssign.values()].sort((a, b) =>
      (b.createdAt ?? "").localeCompare(a.createdAt ?? "")
    );
  },

  async get(id: string): Promise<Assignment | undefined> {
    if (redis) {
      const raw = await redis.hget(ASSIGN_HASH, id);
      return unwrap(raw);
    }
    return memAssign.get(id);
  },

  async set(a: Assignment): Promise<Assignment> {
    if (redis) {
      await redis.hset(ASSIGN_HASH, { [a._id]: JSON.stringify(a) });
      const score = a.createdAt ? new Date(a.createdAt).getTime() : Date.now();
      await redis.zadd(ASSIGN_INDEX, { score, member: a._id });
    } else {
      memAssign.set(a._id, a);
    }
    return a;
  },

  async update(
    id: string,
    patch: Partial<Assignment>
  ): Promise<Assignment | undefined> {
    const existing = await this.get(id);
    if (!existing) return undefined;
    const next: Assignment = {
      ...existing,
      ...patch,
      updatedAt: new Date().toISOString(),
    };
    await this.set(next);
    return next;
  },

  async delete(id: string): Promise<boolean> {
    if (redis) {
      const removed = await redis.hdel(ASSIGN_HASH, id);
      await redis.zrem(ASSIGN_INDEX, id);
      return removed > 0;
    }
    return memAssign.delete(id);
  },
};

/* ---------- Notifications ---------- */

export type Notification = {
  id: string;
  title: string;
  body: string;
  assignmentId?: string;
  read: boolean;
  createdAt: string;
};

function unwrapNotif(raw: unknown): Notification | undefined {
  if (raw == null) return undefined;
  if (typeof raw === "string") {
    try {
      return JSON.parse(raw) as Notification;
    } catch {
      return undefined;
    }
  }
  return raw as Notification;
}

export const notifications = {
  async list(): Promise<Notification[]> {
    if (redis) {
      const raws = (await redis.lrange(NOTIF_LIST, 0, 49)) as unknown[];
      return raws.map(unwrapNotif).filter((x): x is Notification => Boolean(x));
    }
    return [...memNotifs].sort((a, b) =>
      b.createdAt.localeCompare(a.createdAt)
    );
  },

  async unreadCount(): Promise<number> {
    if (redis) {
      const v = await redis.get<number>(NOTIF_UNREAD);
      return v ?? 0;
    }
    return memNotifs.filter((n) => !n.read).length;
  },

  async push(
    n: Omit<Notification, "id" | "createdAt" | "read">
  ): Promise<Notification> {
    const created: Notification = {
      id: crypto.randomUUID(),
      createdAt: new Date().toISOString(),
      read: false,
      ...n,
    };
    if (redis) {
      await redis.lpush(NOTIF_LIST, JSON.stringify(created));
      await redis.ltrim(NOTIF_LIST, 0, 49);
      await redis.incr(NOTIF_UNREAD);
    } else {
      memNotifs.unshift(created);
      while (memNotifs.length > 50) memNotifs.pop();
    }
    return created;
  },

  async markAllRead(): Promise<void> {
    if (redis) {
      // Re-write each item with read=true. Cheap because the list is capped at 50.
      const raws = (await redis.lrange(NOTIF_LIST, 0, 49)) as unknown[];
      const items = raws
        .map(unwrapNotif)
        .filter((x): x is Notification => Boolean(x))
        .map((n) => ({ ...n, read: true }));
      if (items.length > 0) {
        // delete + re-push (newest first)
        await redis.del(NOTIF_LIST);
        for (let i = items.length - 1; i >= 0; i--) {
          await redis.lpush(NOTIF_LIST, JSON.stringify(items[i]));
        }
      }
      await redis.set(NOTIF_UNREAD, 0);
    } else {
      memNotifs.forEach((n) => (n.read = true));
    }
  },
};

export const STORE_BACKEND: "upstash" | "memory" = redis ? "upstash" : "memory";
