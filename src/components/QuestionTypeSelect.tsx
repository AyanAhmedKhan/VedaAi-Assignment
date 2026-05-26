"use client";
import { useEffect, useRef, useState } from "react";

export const QUESTION_TYPE_PRESETS: { id: string; label: string }[] = [
  { id: "mcq", label: "Multiple Choice Questions" },
  { id: "true-false", label: "True / False" },
  { id: "fill-blanks", label: "Fill in the Blanks" },
  { id: "short", label: "Short Answer Questions" },
  { id: "long", label: "Long Answer Questions" },
  { id: "diagram", label: "Diagram / Graph-Based Questions" },
  { id: "numerical", label: "Numerical Problems" },
  { id: "case-study", label: "Case Study" },
  { id: "match", label: "Match the Following" },
  { id: "essay", label: "Essay" },
];

export function QuestionTypeSelect({
  value,
  onChange,
  taken,
}: {
  value: { id: string; label: string };
  onChange: (next: { id: string; label: string }) => void;
  taken: string[];
}) {
  const [open, setOpen] = useState(false);
  const [custom, setCustom] = useState(false);
  const wrap = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    function onDown(e: MouseEvent) {
      if (!wrap.current) return;
      if (!wrap.current.contains(e.target as Node)) {
        setOpen(false);
        setCustom(false);
      }
    }
    function onKey(e: KeyboardEvent) {
      if (e.key === "Escape") {
        setOpen(false);
        setCustom(false);
      }
    }
    document.addEventListener("mousedown", onDown);
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("mousedown", onDown);
      document.removeEventListener("keydown", onKey);
    };
  }, []);

  const isCustomValue = !QUESTION_TYPE_PRESETS.find((p) => p.id === value.id);

  return (
    <div ref={wrap} className="relative w-[443px]">
      <button
        type="button"
        onClick={() => {
          setOpen((v) => !v);
          setCustom(false);
        }}
        className={`group bg-white h-11 w-full rounded-pill border transition-all flex items-center justify-between pl-4 pr-3 py-[11px] text-left ${
          open
            ? "border-ink-primary/60 shadow-[0_6px_18px_rgba(0,0,0,0.10)]"
            : "border-transparent hover:border-ink-primary/15 hover:shadow-[0_2px_8px_rgba(0,0,0,0.05)]"
        }`}
        aria-haspopup="listbox"
        aria-expanded={open}
      >
        <span className="flex items-center gap-2.5 min-w-0">
          <span className="w-1.5 h-1.5 rounded-full bg-brand-orange shrink-0" />
          <span className="font-bricolage font-medium text-base tracking-[-0.04em] text-ink-primary truncate">
            {value.label}
          </span>
          {isCustomValue && (
            <span className="font-bricolage text-[10px] uppercase tracking-wider text-ink-muted bg-surface-off px-2 py-0.5 rounded-full shrink-0">
              custom
            </span>
          )}
        </span>
        <span
          className={`w-7 h-7 rounded-full flex items-center justify-center transition-all ${
            open ? "bg-ink-primary text-white" : "bg-surface-off text-ink-secondary"
          }`}
        >
          <svg
            width="14"
            height="14"
            viewBox="0 0 14 14"
            fill="none"
            className={`transition-transform duration-200 ${open ? "rotate-180" : ""}`}
          >
            <path
              d="M3.5 5.25 7 8.75l3.5-3.5"
              stroke="currentColor"
              strokeWidth="1.6"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
        </span>
      </button>

      <div
        role="listbox"
        className={`absolute z-30 left-0 right-0 top-[50px] bg-white rounded-2xl border border-black/5 shadow-[0_20px_44px_rgba(0,0,0,0.18)] p-1.5 flex flex-col origin-top transition-all duration-150 ${
          open
            ? "opacity-100 scale-100 translate-y-0 pointer-events-auto"
            : "opacity-0 scale-[0.98] -translate-y-1 pointer-events-none"
        }`}
      >
        <div className="px-3 pt-2 pb-1.5 flex items-center justify-between">
          <span className="font-bricolage font-bold text-[11px] uppercase tracking-[0.08em] text-ink-muted">
            Question types
          </span>
          <span className="font-bricolage text-[11px] text-ink-muted">
            {QUESTION_TYPE_PRESETS.length} presets
          </span>
        </div>
        <div className="flex flex-col gap-0.5 max-h-[280px] overflow-auto pr-0.5">
          {QUESTION_TYPE_PRESETS.map((p) => {
            const disabled = taken.includes(p.id) && p.id !== value.id;
            const selected = p.id === value.id;
            return (
              <button
                key={p.id}
                type="button"
                role="option"
                aria-selected={selected}
                disabled={disabled}
                onClick={() => {
                  onChange({ id: p.id, label: p.label });
                  setOpen(false);
                }}
                className={`text-left h-9 px-3 rounded-xl font-bricolage text-sm tracking-[-0.04em] flex items-center gap-2 transition-colors ${
                  disabled
                    ? "text-ink-muted cursor-not-allowed opacity-60"
                    : selected
                    ? "bg-ink-primary text-white font-semibold"
                    : "text-ink-primary hover:bg-surface-off"
                }`}
              >
                <span
                  className={`w-1.5 h-1.5 rounded-full shrink-0 ${
                    selected
                      ? "bg-brand-orange"
                      : disabled
                      ? "bg-ink-muted/40"
                      : "bg-ink-muted/40 group-hover:bg-brand-orange"
                  }`}
                />
                <span className="flex-1 truncate">{p.label}</span>
                {disabled && !selected && (
                  <span className="text-[10px] uppercase tracking-wider text-ink-muted">
                    used
                  </span>
                )}
                {selected && (
                  <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
                    <path
                      d="m3 7.4 2.8 2.8L11 4.8"
                      stroke="currentColor"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                  </svg>
                )}
              </button>
            );
          })}
        </div>
        <div className="h-px bg-surface-off40 my-1.5 mx-2" />
        {!custom ? (
          <button
            type="button"
            onClick={() => setCustom(true)}
            className="text-left h-9 px-3 rounded-xl font-bricolage font-semibold text-sm text-ink-primary hover:bg-surface-off flex items-center gap-2"
          >
            <span className="w-5 h-5 rounded-full bg-ink-primary text-white inline-flex items-center justify-center text-base leading-none">
              +
            </span>
            Add custom type…
          </button>
        ) : (
          <div className="flex gap-1.5 p-1">
            <input
              autoFocus
              defaultValue={isCustomValue ? value.label : ""}
              placeholder="Custom question type"
              onKeyDown={(e) => {
                if (e.key === "Enter") {
                  const label = (e.currentTarget.value || "").trim();
                  if (label) {
                    onChange({ id: `custom-${Date.now()}`, label });
                    setOpen(false);
                  }
                } else if (e.key === "Escape") {
                  setCustom(false);
                }
              }}
              className="flex-1 bg-surface-off border border-transparent rounded-pill h-9 px-3 font-bricolage text-sm outline-none focus:border-ink-primary focus:bg-white"
            />
            <button
              type="button"
              onClick={() => setCustom(false)}
              className="font-bricolage text-xs text-ink-muted hover:text-ink-primary px-2 rounded-lg"
            >
              Cancel
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
