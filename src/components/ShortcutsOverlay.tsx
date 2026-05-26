"use client";
import { useEffect, useState } from "react";

const isMac =
  typeof navigator !== "undefined" && /Mac|iPhone|iPad/.test(navigator.platform);
const MOD = isMac ? "⌘" : "Ctrl";

type Group = {
  title: string;
  items: { keys: string[]; label: string }[];
};

const GROUPS: Group[] = [
  {
    title: "Global",
    items: [
      { keys: [`${MOD}`, "K"], label: "Open command palette" },
      { keys: ["?"], label: "Show this help" },
      { keys: ["Esc"], label: "Close any dialog or dropdown" },
    ],
  },
  {
    title: "Create form",
    items: [
      { keys: [`${MOD}`, "Enter"], label: "Submit and generate paper" },
    ],
  },
  {
    title: "Command palette",
    items: [
      { keys: ["↑", "↓"], label: "Navigate results" },
      { keys: ["Enter"], label: "Open the selected result" },
      { keys: ["Esc"], label: "Close palette" },
    ],
  },
  {
    title: "Output page · question row",
    items: [
      { keys: ["Click"], label: "Inline-edit the question text" },
      { keys: [`${MOD}`, "Enter"], label: "Save inline edit" },
      { keys: ["Esc"], label: "Cancel inline edit" },
    ],
  },
];

const PALETTE_COMMANDS = [
  { group: "Actions", items: ["Create new assignment"] },
  {
    group: "Navigate",
    items: [
      "Assignments",
      "My Library",
      "Analytics",
      "My Groups",
      "Profile",
      "Settings",
    ],
  },
  {
    group: "Library",
    items: ["Up to 8 recent papers — opens that paper directly"],
  },
];

export function ShortcutsOverlay() {
  const [open, setOpen] = useState(false);

  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      const target = e.target as HTMLElement | null;
      const inField =
        target &&
        (target.tagName === "INPUT" ||
          target.tagName === "TEXTAREA" ||
          target.isContentEditable);
      if (e.key === "?" && !inField) {
        e.preventDefault();
        setOpen((v) => !v);
      } else if (e.key === "Escape" && open) {
        setOpen(false);
      }
    }
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [open]);

  if (!open) return null;

  return (
    <div
      onMouseDown={(e) => {
        if (e.target === e.currentTarget) setOpen(false);
      }}
      className="fixed inset-0 z-[100] bg-black/40 backdrop-blur-[2px] flex items-start justify-center pt-[8vh] px-4"
    >
      <div className="w-full max-w-[680px] bg-white rounded-2xl border border-black/5 shadow-[0_30px_60px_rgba(0,0,0,0.25)] overflow-hidden flex flex-col fade-up">
        <div className="flex items-center justify-between px-5 py-4 border-b border-surface-off40/60 bg-gradient-to-br from-white to-surface-off/40">
          <div>
            <h2 className="font-bricolage font-bold text-[18px] text-ink-primary">
              Keyboard shortcuts
            </h2>
            <p className="font-bricolage text-xs text-ink-muted">
              Everything you can do without leaving the keyboard.
            </p>
          </div>
          <button
            type="button"
            onClick={() => setOpen(false)}
            className="w-8 h-8 rounded-full bg-surface-off hover:bg-surface-off40/60 text-ink-secondary flex items-center justify-center"
            aria-label="Close"
          >
            <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
              <path
                d="M3 3l8 8M11 3l-8 8"
                stroke="currentColor"
                strokeWidth="1.7"
                strokeLinecap="round"
              />
            </svg>
          </button>
        </div>

        <div className="grid grid-cols-2 gap-x-8 gap-y-5 p-5 max-h-[70vh] overflow-auto">
          {GROUPS.map((g) => (
            <div key={g.title} className="flex flex-col gap-2">
              <h3 className="font-bricolage font-bold text-[10px] uppercase tracking-wider text-ink-muted">
                {g.title}
              </h3>
              <ul className="flex flex-col gap-2">
                {g.items.map((it, i) => (
                  <li
                    key={i}
                    className="flex items-center justify-between gap-3 text-[13px]"
                  >
                    <span className="font-bricolage text-ink-primary">{it.label}</span>
                    <span className="flex items-center gap-1 shrink-0">
                      {it.keys.map((k, j) => (
                        <kbd
                          key={j}
                          className="font-mono text-[11px] px-1.5 py-0.5 rounded bg-surface-off text-ink-primary border border-black/5 shadow-sm"
                        >
                          {k}
                        </kbd>
                      ))}
                    </span>
                  </li>
                ))}
              </ul>
            </div>
          ))}

          <div className="col-span-2 mt-2 pt-4 border-t border-surface-off40/60">
            <h3 className="font-bricolage font-bold text-[10px] uppercase tracking-wider text-ink-muted mb-3">
              Available in the command palette
              <span className="ml-2 font-mono text-[10px] normal-case px-1.5 py-0.5 rounded bg-surface-off text-ink-secondary border border-black/5">
                {MOD}+K
              </span>
            </h3>
            <div className="grid grid-cols-3 gap-4 text-[12px]">
              {PALETTE_COMMANDS.map((g) => (
                <div key={g.group} className="flex flex-col gap-1">
                  <p className="font-bricolage font-bold text-ink-primary">{g.group}</p>
                  <ul className="flex flex-col gap-0.5">
                    {g.items.map((c) => (
                      <li key={c} className="font-bricolage text-ink-secondary">
                        • {c}
                      </li>
                    ))}
                  </ul>
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="px-5 py-3 border-t border-surface-off40/60 flex items-center justify-between font-bricolage text-[11px] text-ink-muted">
          <span>
            Press <kbd className="font-mono px-1.5 py-0.5 rounded bg-surface-off">?</kbd>{" "}
            anytime to open this.
          </span>
          <span>
            <kbd className="font-mono px-1.5 py-0.5 rounded bg-surface-off">Esc</kbd> to close
          </span>
        </div>
      </div>
    </div>
  );
}
