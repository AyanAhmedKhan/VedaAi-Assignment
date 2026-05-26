"use client";
import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { api } from "@/lib/api";
import type { Assignment } from "@/types/assignment";

export function LibraryPanel() {
  const [items, setItems] = useState<Assignment[]>([]);
  const [query, setQuery] = useState("");

  useEffect(() => {
    let alive = true;
    async function load() {
      try {
        const r = await api.listAssignments();
        if (alive) setItems(r.filter((a) => a.status === "ready"));
      } catch {}
    }
    load();
    const i = setInterval(load, 4000);
    return () => {
      alive = false;
      clearInterval(i);
    };
  }, []);

  const { matched, totalHits } = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return { matched: items, totalHits: 0 };
    let hits = 0;
    const out = items
      .map((a) => {
        const top = [a.title, a.subject, a.grade, a.school].some((f) =>
          (f || "").toLowerCase().includes(q)
        );
        const matchingQs =
          a.result?.sections.flatMap((s) =>
            s.questions.filter((qq) => qq.text.toLowerCase().includes(q))
          ) ?? [];
        const score = matchingQs.length + (top ? 1 : 0);
        hits += matchingQs.length;
        return { a, matchingQs, score };
      })
      .filter((x) => x.score > 0)
      .sort((a, b) => b.score - a.score);
    return { matched: out, totalHits: hits };
  }, [items, query]);

  return (
    <div className="absolute left-[327px] top-[90px] w-[1100px] flex flex-col gap-4 z-[1]">
      <div className="flex items-center px-2">
        <div className="w-3 h-3 rounded-full bg-[#1FB95A] mr-3" />
        <div className="flex-1">
          <h1 className="font-bricolage font-bold text-[20px] tracking-[-0.04em] text-ink-primary">
            My Library
          </h1>
          <p className="font-bricolage text-sm text-ink-secondary/55">
            Every paper your AI has finished — search inside questions too.
          </p>
        </div>
      </div>

      <div className="bg-white rounded-[20px] h-16 flex items-center px-4 w-full gap-3">
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
          <circle cx="11" cy="11" r="7" stroke="#303030" strokeWidth="1.6" />
          <path d="m20 20-3.5-3.5" stroke="#303030" strokeWidth="1.6" strokeLinecap="round" />
        </svg>
        <input
          autoFocus
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Search by paper title, subject, school — or a word inside a question…"
          className="flex-1 font-bricolage text-sm text-ink-primary bg-transparent outline-none"
        />
        {query && (
          <span className="font-bricolage text-xs text-ink-muted">
            {Array.isArray(matched) ? matched.length : 0} papers · {totalHits} matching questions
          </span>
        )}
      </div>

      {matched.length === 0 ? (
        <div className="bg-white/70 rounded-2xl p-10 text-center font-bricolage text-ink-muted">
          {query ? (
            <>
              No matches for <span className="text-ink-primary font-semibold">"{query}"</span>.
            </>
          ) : (
            <>
              No completed papers yet. Generate one from{" "}
              <Link className="text-button-primary underline" href="/">
                Home
              </Link>
              .
            </>
          )}
        </div>
      ) : (
        <div className="grid grid-cols-3 gap-4">
          {(query
            ? (matched as { a: Assignment; matchingQs: { text: string }[]; score: number }[])
            : (matched as Assignment[]).map((a) => ({ a, matchingQs: [], score: 0 }))
          ).map(({ a, matchingQs }) => (
            <Link
              key={a._id}
              href={`/output?id=${a._id}`}
              className="bg-white/70 rounded-2xl p-5 flex flex-col gap-2 hover:bg-white transition"
            >
              <span className="font-bricolage font-extrabold text-[18px] text-ink-primary truncate">
                {a.subject} — {a.grade}
              </span>
              <span className="font-bricolage text-xs text-ink-muted">
                {a.school || "Untitled school"}
              </span>
              <div className="flex items-center justify-between mt-1 text-xs">
                <span className="font-bricolage font-semibold text-ink-primary">
                  {a.result?.totalMarks ?? 0} marks
                </span>
                <span className="font-bricolage text-ink-muted">
                  {a.result?.sections.length ?? 0} sections
                </span>
              </div>
              {matchingQs.length > 0 && (
                <div className="mt-2 pt-2 border-t border-surface-off40/60 flex flex-col gap-1">
                  <span className="font-bricolage text-[10px] uppercase tracking-wider text-brand-orange font-bold">
                    {matchingQs.length} matching question
                    {matchingQs.length > 1 ? "s" : ""}
                  </span>
                  {matchingQs.slice(0, 2).map((q, i) => (
                    <p
                      key={i}
                      className="font-bricolage text-[11px] text-ink-secondary leading-snug line-clamp-2"
                    >
                      {highlight(q.text, query)}
                    </p>
                  ))}
                </div>
              )}
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}

function highlight(text: string, q: string): React.ReactNode {
  const lower = text.toLowerCase();
  const needle = q.toLowerCase();
  const idx = lower.indexOf(needle);
  if (idx === -1 || !q) return text;
  const start = Math.max(0, idx - 30);
  const end = Math.min(text.length, idx + q.length + 60);
  const before = (start > 0 ? "…" : "") + text.slice(start, idx);
  const match = text.slice(idx, idx + q.length);
  const after = text.slice(idx + q.length, end) + (end < text.length ? "…" : "");
  return (
    <>
      {before}
      <mark className="bg-amber-200/70 text-ink-primary rounded px-0.5">{match}</mark>
      {after}
    </>
  );
}
