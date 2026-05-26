"use client";
import { useEffect, useRef, useState } from "react";

export type PresetOption = { value: string; label: string };

export const SUBJECT_PRESETS: PresetOption[] = [
  { value: "Science", label: "Science" },
  { value: "Mathematics", label: "Mathematics" },
  { value: "English", label: "English" },
  { value: "Hindi", label: "Hindi" },
  { value: "Social Science", label: "Social Science" },
  { value: "Physics", label: "Physics" },
  { value: "Chemistry", label: "Chemistry" },
  { value: "Biology", label: "Biology" },
  { value: "Computer Science", label: "Computer Science" },
  { value: "Geography", label: "Geography" },
  { value: "History", label: "History" },
];

export const GRADE_PRESETS: PresetOption[] = [
  { value: "Class 1", label: "Class 1" },
  { value: "Class 2", label: "Class 2" },
  { value: "Class 3", label: "Class 3" },
  { value: "Class 4", label: "Class 4" },
  { value: "Class 5", label: "Class 5" },
  { value: "Class 6", label: "Class 6" },
  { value: "Class 7", label: "Class 7" },
  { value: "Class 8", label: "Class 8" },
  { value: "Class 9", label: "Class 9" },
  { value: "Class 10", label: "Class 10" },
  { value: "Class 11", label: "Class 11" },
  { value: "Class 12", label: "Class 12" },
];

export function PresetCombobox({
  value,
  onChange,
  options,
  placeholder = "Select…",
  customLabel = "Add custom…",
  customPrompt = "Enter a custom value",
  size = "md",
  invalid,
}: {
  value: string;
  onChange: (v: string) => void;
  options: PresetOption[];
  placeholder?: string;
  customLabel?: string;
  customPrompt?: string;
  size?: "md" | "sm";
  invalid?: boolean;
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

  const isCustom = value !== "" && !options.find((o) => o.value === value);
  const height = size === "sm" ? "h-10" : "h-11";

  return (
    <div ref={wrap} className="relative w-full">
      <button
        type="button"
        onClick={() => {
          setOpen((v) => !v);
          setCustom(false);
        }}
        className={`group bg-white w-full ${height} rounded-pill border transition-all flex items-center justify-between pl-4 pr-2 py-[11px] text-left ${
          invalid
            ? "border-rose-400/70"
            : open
            ? "border-ink-primary/60 shadow-[0_6px_18px_rgba(0,0,0,0.10)]"
            : "border-surface-off40 hover:border-ink-primary/25"
        }`}
        aria-haspopup="listbox"
        aria-expanded={open}
      >
        <span className="flex items-center gap-2 min-w-0">
          <span
            className={`font-bricolage font-medium text-sm tracking-[-0.04em] truncate ${
              value ? "text-ink-primary" : "text-ink-muted"
            }`}
          >
            {value || placeholder}
          </span>
          {isCustom && (
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
        className={`absolute z-30 left-0 right-0 top-[calc(100%+6px)] bg-white rounded-2xl border border-black/5 shadow-[0_20px_44px_rgba(0,0,0,0.18)] p-1.5 flex flex-col origin-top transition-all duration-150 ${
          open
            ? "opacity-100 scale-100 translate-y-0 pointer-events-auto"
            : "opacity-0 scale-[0.98] -translate-y-1 pointer-events-none"
        }`}
      >
        <div className="flex flex-col gap-0.5 max-h-[260px] overflow-auto pr-0.5">
          {options.map((opt) => {
            const selected = opt.value === value;
            return (
              <button
                key={opt.value}
                type="button"
                role="option"
                aria-selected={selected}
                onClick={() => {
                  onChange(opt.value);
                  setOpen(false);
                }}
                className={`text-left h-9 px-3 rounded-xl font-bricolage text-sm tracking-[-0.04em] flex items-center gap-2 transition-colors ${
                  selected
                    ? "bg-ink-primary text-white font-semibold"
                    : "text-ink-primary hover:bg-surface-off"
                }`}
              >
                <span
                  className={`w-1.5 h-1.5 rounded-full shrink-0 ${
                    selected ? "bg-brand-orange" : "bg-ink-muted/40"
                  }`}
                />
                <span className="flex-1 truncate">{opt.label}</span>
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
            {customLabel}
          </button>
        ) : (
          <div className="flex gap-1.5 p-1">
            <input
              autoFocus
              defaultValue={isCustom ? value : ""}
              placeholder={customPrompt}
              onKeyDown={(e) => {
                if (e.key === "Enter") {
                  const v = (e.currentTarget.value || "").trim();
                  if (v) {
                    onChange(v);
                    setOpen(false);
                    setCustom(false);
                  }
                } else if (e.key === "Escape") {
                  setCustom(false);
                }
              }}
              className="flex-1 bg-white border border-surface-off40 rounded-pill h-9 px-3 font-bricolage text-sm outline-none focus:border-ink-primary"
            />
            <button
              type="button"
              onClick={() => setCustom(false)}
              className="font-bricolage text-xs text-ink-muted px-2"
            >
              Cancel
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
