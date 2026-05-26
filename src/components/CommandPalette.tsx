"use client";
import { useEffect, useMemo, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { api } from "@/lib/api";

type Command = {
  id: string;
  label: string;
  hint?: string;
  group: "Navigate" | "Actions" | "Library";
  keywords?: string;
  run: () => void | Promise<void>;
};

const isMac =
  typeof navigator !== "undefined" && /Mac|iPhone|iPad/.test(navigator.platform);

export function CommandPalette() {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");
  const [active, setActive] = useState(0);
  const [recent, setRecent] = useState<
    { id: string; subject: string; grade: string }[]
  >([]);
  const inputRef = useRef<HTMLInputElement | null>(null);

  // Global key listener
  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      const mod = isMac ? e.metaKey : e.ctrlKey;
      if (mod && e.key.toLowerCase() === "k") {
        e.preventDefault();
        setOpen((v) => !v);
        setQuery("");
        setActive(0);
        return;
      }
      if (e.key === "Escape" && open) {
        e.preventDefault();
        setOpen(false);
      }
    }
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [open]);

  // When opened, focus + load recent assignments for quick-jump
  useEffect(() => {
    if (!open) return;
    inputRef.current?.focus();
    api
      .listAssignments()
      .then((list) =>
        setRecent(
          list
            .filter((a) => a.status === "ready")
            .slice(0, 8)
            .map((a) => ({ id: a._id, subject: a.subject, grade: a.grade }))
        )
      )
      .catch(() => {});
  }, [open]);

  const commands = useMemo<Command[]>(() => {
    const base: Command[] = [
      {
        id: "new",
        group: "Actions",
        label: "Create new assignment",
        hint: "Go to the create form",
        keywords: "create new paper home generate",
        run: () => router.push("/"),
      },
      {
        id: "assignments",
        group: "Navigate",
        label: "Assignments",
        hint: "List of all papers",
        run: () => router.push("/assignments"),
      },
      {
        id: "library",
        group: "Navigate",
        label: "My Library",
        hint: "Search inside questions",
        run: () => router.push("/library"),
      },
      {
        id: "analytics",
        group: "Navigate",
        label: "Analytics",
        hint: "KPIs and charts",
        run: () => router.push("/analytics"),
      },
      {
        id: "groups",
        group: "Navigate",
        label: "My Groups",
        run: () => router.push("/groups"),
      },
      {
        id: "profile",
        group: "Navigate",
        label: "Profile",
        run: () => router.push("/profile"),
      },
      {
        id: "settings",
        group: "Navigate",
        label: "Settings",
        run: () => router.push("/settings"),
      },
    ];
    const lib: Command[] = recent.map((r) => ({
      id: `open-${r.id}`,
      group: "Library",
      label: `${r.subject} — ${r.grade}`,
      hint: `Open paper`,
      keywords: r.subject + " " + r.grade,
      run: () => router.push(`/output?id=${r.id}`),
    }));
    return [...base, ...lib];
  }, [recent, router]);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return commands;
    return commands.filter((c) =>
      (c.label + " " + (c.keywords || "") + " " + (c.hint || ""))
        .toLowerCase()
        .includes(q)
    );
  }, [commands, query]);

  useEffect(() => {
    if (active >= filtered.length) setActive(0);
  }, [filtered.length, active]);

  function onInputKey(e: React.KeyboardEvent<HTMLInputElement>) {
    if (e.key === "ArrowDown") {
      e.preventDefault();
      setActive((i) => Math.min(filtered.length - 1, i + 1));
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      setActive((i) => Math.max(0, i - 1));
    } else if (e.key === "Enter") {
      e.preventDefault();
      const cmd = filtered[active];
      if (cmd) {
        setOpen(false);
        Promise.resolve(cmd.run());
      }
    }
  }

  if (!open) return null;

  const groups = ["Actions", "Navigate", "Library"] as const;

  return (
    <div
      onMouseDown={(e) => {
        if (e.target === e.currentTarget) setOpen(false);
      }}
      className="fixed inset-0 z-[100] bg-black/40 backdrop-blur-[2px] flex items-start justify-center pt-[12vh] px-4"
    >
      <div className="w-full max-w-[640px] bg-white rounded-2xl border border-black/5 shadow-[0_30px_60px_rgba(0,0,0,0.25)] overflow-hidden flex flex-col fade-up">
        {/* Header / input */}
        <div className="flex items-center gap-3 px-4 py-3 border-b border-surface-off40/60">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
            <circle cx="11" cy="11" r="7" stroke="#303030" strokeWidth="1.6" />
            <path d="m20 20-3.5-3.5" stroke="#303030" strokeWidth="1.6" strokeLinecap="round" />
          </svg>
          <input
            ref={inputRef}
            value={query}
            onChange={(e) => {
              setQuery(e.target.value);
              setActive(0);
            }}
            onKeyDown={onInputKey}
            placeholder="Type a command, page or paper…"
            className="flex-1 bg-transparent font-bricolage text-sm text-ink-primary outline-none"
          />
          <kbd className="font-mono text-[10px] px-1.5 py-0.5 rounded bg-surface-off text-ink-secondary uppercase">
            Esc
          </kbd>
        </div>

        {/* Results */}
        <div className="max-h-[60vh] overflow-y-auto p-1.5">
          {filtered.length === 0 ? (
            <div className="px-3 py-6 text-center font-bricolage text-sm text-ink-muted">
              No matching commands.
            </div>
          ) : (
            groups.map((g) => {
              const inGroup = filtered.filter((c) => c.group === g);
              if (inGroup.length === 0) return null;
              return (
                <div key={g} className="flex flex-col">
                  <p className="px-3 pt-2 pb-1 font-bricolage text-[10px] uppercase tracking-wider text-ink-muted font-bold">
                    {g}
                  </p>
                  {inGroup.map((c) => {
                    const realIdx = filtered.indexOf(c);
                    const isActive = realIdx === active;
                    return (
                      <button
                        key={c.id}
                        type="button"
                        onMouseEnter={() => setActive(realIdx)}
                        onClick={() => {
                          setOpen(false);
                          Promise.resolve(c.run());
                        }}
                        className={`text-left mx-1 px-3 py-2 rounded-xl flex items-center justify-between gap-3 transition-colors ${
                          isActive ? "bg-ink-primary text-white" : "hover:bg-surface-off"
                        }`}
                      >
                        <div className="flex flex-col min-w-0">
                          <span
                            className={`font-bricolage font-medium text-sm tracking-[-0.04em] truncate ${
                              isActive ? "text-white" : "text-ink-primary"
                            }`}
                          >
                            {c.label}
                          </span>
                          {c.hint && (
                            <span
                              className={`font-bricolage text-[11px] truncate ${
                                isActive ? "text-white/70" : "text-ink-muted"
                              }`}
                            >
                              {c.hint}
                            </span>
                          )}
                        </div>
                        {isActive && (
                          <span className="text-[10px] font-mono uppercase opacity-80">
                            ⏎
                          </span>
                        )}
                      </button>
                    );
                  })}
                </div>
              );
            })
          )}
        </div>

        {/* Footer */}
        <div className="px-4 py-2 border-t border-surface-off40/60 flex items-center justify-between font-bricolage text-[11px] text-ink-muted">
          <span className="flex items-center gap-1.5">
            <kbd className="font-mono px-1.5 py-0.5 rounded bg-surface-off text-ink-secondary">↑↓</kbd>{" "}
            navigate
          </span>
          <span className="flex items-center gap-1.5">
            <kbd className="font-mono px-1.5 py-0.5 rounded bg-surface-off text-ink-secondary">↵</kbd>{" "}
            select
          </span>
          <span className="flex items-center gap-1.5">
            <kbd className="font-mono px-1.5 py-0.5 rounded bg-surface-off text-ink-secondary">
              {isMac ? "⌘" : "Ctrl"}+K
            </kbd>{" "}
            open
          </span>
        </div>
      </div>
    </div>
  );
}
