"use client";
import { useEffect, useRef, useState } from "react";
import type { ReactNode } from "react";

export type SelectOption<T extends string> = {
  value: T;
  label: string;
  hint?: string;
  swatch?: string;
};

export function Select<T extends string>({
  value,
  options,
  onChange,
  className = "",
  width = 200,
  align = "left",
  ariaLabel,
  leading,
}: {
  value: T;
  options: SelectOption<T>[];
  onChange: (v: T) => void;
  className?: string;
  width?: number;
  align?: "left" | "right";
  ariaLabel?: string;
  leading?: ReactNode;
}) {
  const [open, setOpen] = useState(false);
  const wrap = useRef<HTMLDivElement | null>(null);
  const current = options.find((o) => o.value === value) ?? options[0];

  useEffect(() => {
    function onDown(e: MouseEvent) {
      if (!wrap.current) return;
      if (!wrap.current.contains(e.target as Node)) setOpen(false);
    }
    function onKey(e: KeyboardEvent) {
      if (e.key === "Escape") setOpen(false);
    }
    document.addEventListener("mousedown", onDown);
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("mousedown", onDown);
      document.removeEventListener("keydown", onKey);
    };
  }, []);

  return (
    <div ref={wrap} className={`relative ${className}`} style={{ width }}>
      <button
        type="button"
        aria-label={ariaLabel}
        aria-haspopup="listbox"
        aria-expanded={open}
        onClick={() => setOpen((v) => !v)}
        className={`group bg-white h-10 w-full rounded-pill border border-surface-off40 hover:border-ink-primary/40 flex items-center justify-between gap-2 px-4 text-left transition ${
          open ? "border-ink-primary/60 shadow-[0_4px_14px_rgba(0,0,0,0.08)]" : ""
        }`}
      >
        <span className="flex items-center gap-2 min-w-0">
          {leading}
          {current?.swatch && (
            <span
              className="w-2 h-2 rounded-full shrink-0"
              style={{ background: current.swatch }}
            />
          )}
          <span className="font-bricolage font-semibold text-sm tracking-[-0.04em] text-ink-primary truncate">
            {current?.label}
          </span>
        </span>
        <svg
          width="14"
          height="14"
          viewBox="0 0 14 14"
          fill="none"
          className={`shrink-0 text-ink-secondary transition-transform duration-200 ${
            open ? "rotate-180 text-ink-primary" : ""
          }`}
        >
          <path
            d="M3.5 5.25 7 8.75l3.5-3.5"
            stroke="currentColor"
            strokeWidth="1.6"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
      </button>

      <div
        role="listbox"
        className={`absolute z-30 top-[44px] bg-white rounded-2xl border border-black/5 shadow-[0_18px_40px_rgba(0,0,0,0.16)] p-1.5 flex flex-col gap-0.5 origin-top transition-all duration-150 ${
          align === "right" ? "right-0" : "left-0"
        } ${
          open
            ? "opacity-100 scale-100 translate-y-0 pointer-events-auto"
            : "opacity-0 scale-[0.97] -translate-y-1 pointer-events-none"
        }`}
        style={{ minWidth: width }}
      >
        {options.map((o) => {
          const selected = o.value === value;
          return (
            <button
              key={o.value}
              type="button"
              role="option"
              aria-selected={selected}
              onClick={() => {
                onChange(o.value);
                setOpen(false);
              }}
              className={`text-left h-9 px-3 rounded-xl font-bricolage text-sm tracking-[-0.04em] flex items-center gap-2 transition-colors ${
                selected
                  ? "bg-ink-primary text-white font-semibold"
                  : "text-ink-primary hover:bg-surface-off"
              }`}
            >
              {o.swatch && (
                <span
                  className="w-2 h-2 rounded-full shrink-0"
                  style={{ background: o.swatch }}
                />
              )}
              <span className="flex-1 truncate">{o.label}</span>
              {o.hint && (
                <span
                  className={`text-[11px] ${
                    selected ? "text-white/70" : "text-ink-muted"
                  }`}
                >
                  {o.hint}
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
    </div>
  );
}
