"use client";
import { useEffect, useState } from "react";
import { api } from "@/lib/api";

type Status = {
  used: number;
  remaining: number;
  limit: number;
  allowed: boolean;
  resetAt: string;
};

/** Small live badge: "AI: 3/5 today". Refreshes every 8s. */
export function AIQuotaBadge({ className }: { className?: string }) {
  const [s, setS] = useState<Status | null>(null);

  useEffect(() => {
    let alive = true;
    async function load() {
      try {
        const r = await api.rateLimit();
        if (alive) setS(r);
      } catch {}
    }
    load();
    const i = setInterval(load, 8000);
    return () => {
      alive = false;
      clearInterval(i);
    };
  }, []);

  if (!s) return null;

  const tone = !s.allowed
    ? "bg-rose-50 border-rose-200 text-rose-700"
    : s.remaining <= 1
    ? "bg-amber-50 border-amber-200 text-amber-700"
    : "bg-emerald-50 border-emerald-200 text-emerald-700";

  return (
    <div
      title={
        s.allowed
          ? `${s.remaining} AI generations remaining today. Resets at ${new Date(
              s.resetAt
            ).toLocaleString()}.`
          : `Daily limit reached. Resets at ${new Date(s.resetAt).toLocaleString()}. Offline generator will be used.`
      }
      className={`inline-flex items-center gap-1.5 px-2.5 h-7 rounded-full border font-bricolage text-[11px] font-semibold ${tone} ${className ?? ""}`}
    >
      <svg width="12" height="12" viewBox="0 0 14 14" fill="currentColor">
        <path d="M7 1.5 8 5l3.5 1L8 7l-1 3.5L6 7 2.5 6 6 5z" />
      </svg>
      <span>
        AI {s.used}/{s.limit} today
      </span>
      {!s.allowed && (
        <span className="ml-1 px-1.5 py-0 bg-rose-200/60 rounded-full uppercase tracking-wider text-[9px]">
          limit
        </span>
      )}
    </div>
  );
}
