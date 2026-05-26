"use client";
import { useEffect, useRef, useState } from "react";
import { usePathname, useRouter } from "next/navigation";

type Step = {
  /** Optional route to navigate to before showing the step */
  href?: string;
  /** Mini-icon (emoji + a coloured ring) */
  emoji: string;
  /** Big title */
  title: string;
  /** Short copy */
  body: string;
  /** Highlight phrases to render as feature bullets */
  features?: string[];
  /** Optional tip on how to interact once dismissed */
  tip?: string;
};

const STEPS: Step[] = [
  {
    emoji: "✨",
    title: "Welcome to VedaAI",
    body: "Generate exam-ready question papers in seconds. Let me show you what this app can do — takes about 30 seconds.",
    features: [
      "Pixel-perfect Figma implementation",
      "Real-time AI generation with structured output",
      "Full edit · regenerate · share · PDF flow",
    ],
    tip: "Press → for the next step or Esc to skip.",
  },
  {
    href: "/",
    emoji: "📝",
    title: "Create — smart form",
    body: "Fill the form with subject, class, school, question types, marks, and any extra instructions for the AI.",
    features: [
      "Subject + Grade dropdowns with “Add custom” option",
      "10 preset question types (MCQ, Long, Numerical, Case Study…) + custom",
      "Number steppers for count + marks, with live totals",
      "Zod validation — no empty / negative values",
      "⌘/Ctrl+Enter submits from anywhere",
    ],
  },
  {
    href: "/output",
    emoji: "🧠",
    title: "AI Generation",
    body: "Gemini 2.5 Flash returns strict JSON matching our schema — never raw text. While it works, you see a Claude-style thinking indicator and a shimmer skeleton of the paper.",
    features: [
      "Structured JSON output (sections / questions / difficulty / marks / answer key)",
      "Zod re-validates server-side",
      "Animated thinking status with cycling messages",
      "Graceful offline fallback if Gemini fails",
    ],
  },
  {
    emoji: "📄",
    title: "Output — real exam-paper layout",
    body: "Each section becomes a bordered table with No., Question, Marks, Type, and Difficulty columns — like a real school question paper.",
    features: [
      "Colour-coded difficulty pills (Easy / Moderate / Hard)",
      "Student-info row (Name / Roll / Section) with input lines",
      "Banner header, Notes block, footer rule — print-ready",
    ],
  },
  {
    emoji: "🪄",
    title: "Per-question regenerate & inline edit",
    body: "Each question row has a sparkle ✨ to regenerate just that question via Gemini, and a pencil to edit the text inline. Marks auto-recalculate.",
    features: [
      "Click any question text → edit in place (⌘/Ctrl+Enter to save)",
      "Sparkle icon → AI rewrites only that one question",
      "Avoid-list keeps the new question different from siblings",
    ],
  },
  {
    emoji: "📤",
    title: "Export — PDF, Markdown, Share, Print",
    body: "Download a proper A4 PDF (not HTML print), copy the paper as Markdown, share a public read-only link, or print directly — all from the action bar.",
    features: [
      "@react-pdf/renderer — proper layout with bordered tables",
      "Copy as Markdown (optional answer key)",
      "/share/<id> — public read-only page",
      "Print-friendly @media print styles",
    ],
  },
  {
    href: "/assignments",
    emoji: "📚",
    title: "Assignments + Library",
    body: "Every paper is searchable. Library does a deep search inside question text and highlights matches.",
    features: [
      "Live list (auto-refresh) with status pills",
      "Search + status filter on /assignments",
      "Per-card menu: View · Duplicate · Delete",
      "Library: full-text search across questions with highlights",
    ],
  },
  {
    href: "/analytics",
    emoji: "📈",
    title: "Analytics, Profile & Settings",
    body: "Dashboard with KPIs (total papers, questions, marks, subjects), bar charts (status / difficulty / by subject / by grade), and a 7-day histogram. Profile and Settings persist in localStorage.",
    features: [
      "4 KPI tiles + 4 charts + 7-day bar histogram",
      "Profile page — name, email, role, bio",
      "Settings — generation defaults, theme preference, notification toggles",
    ],
  },
  {
    emoji: "⌨️",
    title: "Power-user shortcuts",
    body: "Press ⌘/Ctrl+K to open the command palette — fuzzy search across pages and recent papers. Press ? to see all keyboard shortcuts.",
    features: [
      "⌘/Ctrl+K command palette",
      "? shortcut help overlay",
      "⌘/Ctrl+Enter to submit forms",
      "Esc closes any dropdown / dialog",
    ],
    tip: "Try ⌘K or ? right after this tour.",
  },
];

const STORAGE_KEY = "vedaai.tour.seen.v1";

export function ProductTour() {
  const router = useRouter();
  const pathname = usePathname();
  const [open, setOpen] = useState(false);
  const [idx, setIdx] = useState(0);
  const [anim, setAnim] = useState<"in" | "out">("in");
  /** Path the user was on when the tour opened — restored on close. */
  const originRef = useRef<string | null>(null);

  // First-visit auto-open
  useEffect(() => {
    try {
      if (!localStorage.getItem(STORAGE_KEY)) {
        // small delay so app paints first
        setTimeout(() => {
          originRef.current = window.location.pathname + window.location.search;
          setOpen(true);
        }, 600);
      }
    } catch {}
  }, []);

  // Listen for global trigger
  useEffect(() => {
    function onTrigger() {
      originRef.current = window.location.pathname + window.location.search;
      setIdx(0);
      setOpen(true);
    }
    document.addEventListener("vedaai:tour", onTrigger as EventListener);
    return () => document.removeEventListener("vedaai:tour", onTrigger as EventListener);
  }, []);

  // Keyboard
  useEffect(() => {
    if (!open) return;
    function onKey(e: KeyboardEvent) {
      if (e.key === "Escape") {
        e.preventDefault();
        finish();
      } else if (e.key === "ArrowRight" || e.key === "Enter") {
        e.preventDefault();
        next();
      } else if (e.key === "ArrowLeft") {
        e.preventDefault();
        back();
      }
    }
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open, idx]);

  function transition(toIdx: number) {
    setAnim("out");
    setTimeout(() => {
      setIdx(toIdx);
      setAnim("in");
      const step = STEPS[toIdx];
      if (step?.href) {
        try {
          router.push(step.href);
        } catch {}
      }
    }, 150);
  }

  function next() {
    if (idx >= STEPS.length - 1) return finish();
    transition(idx + 1);
  }
  function back() {
    if (idx <= 0) return;
    transition(idx - 1);
  }
  function finish() {
    try {
      localStorage.setItem(STORAGE_KEY, "1");
    } catch {}
    setOpen(false);
    // Restore the page the user was on when the tour started, if the tour
    // moved them somewhere else along the way.
    const origin = originRef.current;
    if (origin && origin !== pathname) {
      try {
        router.push(origin);
      } catch {}
    }
    originRef.current = null;
  }

  if (!open) return null;
  const step = STEPS[idx];
  const progress = ((idx + 1) / STEPS.length) * 100;

  return (
    <div
      onMouseDown={(e) => {
        if (e.target === e.currentTarget) finish();
      }}
      className="fixed inset-0 z-[110] bg-black/45 backdrop-blur-[3px] flex items-end sm:items-center justify-center px-4 pb-8 sm:pb-0"
    >
      <div
        className={`relative w-full max-w-[560px] bg-white rounded-3xl border border-black/5 shadow-[0_30px_70px_rgba(0,0,0,0.30)] overflow-hidden transition-all duration-150 ${
          anim === "in" ? "opacity-100 translate-y-0" : "opacity-0 translate-y-1"
        }`}
      >
        {/* Progress bar */}
        <div className="h-1 bg-surface-off">
          <div
            className="h-full bg-gradient-to-r from-brand-orangeAlt to-brand-orange transition-all duration-300"
            style={{ width: `${progress}%` }}
          />
        </div>

        {/* Header: emoji halo + step counter */}
        <div className="flex items-center justify-between px-7 pt-6 pb-3">
          <div className="flex items-center gap-3">
            <span
              aria-hidden
              className="relative w-12 h-12 rounded-2xl bg-brand-orange/10 flex items-center justify-center text-[26px] leading-none"
            >
              {step.emoji}
              <span className="absolute inset-0 rounded-2xl ring-2 ring-brand-orange/30 animate-pulse" />
            </span>
            <span className="font-bricolage text-[11px] uppercase tracking-wider text-ink-muted font-bold">
              Step {idx + 1} of {STEPS.length}
            </span>
          </div>
          <button
            type="button"
            onClick={finish}
            className="font-bricolage text-xs text-ink-muted hover:text-ink-primary px-3 py-1.5 rounded-full hover:bg-surface-off"
          >
            Skip tour
          </button>
        </div>

        {/* Body */}
        <div className="px-7 pb-6">
          <h2 className="font-bricolage font-extrabold text-[22px] tracking-[-0.04em] text-ink-primary leading-[1.2]">
            {step.title}
          </h2>
          <p className="mt-2 font-bricolage text-[14px] text-ink-secondary leading-[1.55]">
            {step.body}
          </p>

          {step.features && (
            <ul className="mt-4 flex flex-col gap-1.5">
              {step.features.map((f, i) => (
                <li
                  key={i}
                  className="flex items-start gap-2 font-bricolage text-[13px] text-ink-primary"
                >
                  <span className="mt-1.5 w-1.5 h-1.5 rounded-full bg-brand-orange shrink-0" />
                  <span>{f}</span>
                </li>
              ))}
            </ul>
          )}

          {step.tip && (
            <div className="mt-4 bg-surface-off/60 border border-surface-off40 rounded-xl px-3 py-2 font-bricolage text-[12px] text-ink-secondary">
              💡 {step.tip}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="px-7 pb-6 flex items-center justify-between">
          <div className="flex gap-1">
            {STEPS.map((_, i) => (
              <span
                key={i}
                className={`h-1.5 rounded-full transition-all ${
                  i === idx
                    ? "w-6 bg-ink-primary"
                    : i < idx
                    ? "w-1.5 bg-brand-orange"
                    : "w-1.5 bg-surface-off40"
                }`}
              />
            ))}
          </div>
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={back}
              disabled={idx === 0}
              className="h-10 px-4 rounded-full font-bricolage font-medium text-sm text-ink-primary bg-surface-off hover:bg-surface-off40/80 disabled:opacity-40 disabled:cursor-not-allowed transition"
            >
              ← Back
            </button>
            <button
              type="button"
              onClick={next}
              className="h-10 px-5 rounded-full font-bricolage font-semibold text-sm text-white bg-button-primary hover:bg-button-dark border border-white/20 transition flex items-center gap-2"
            >
              {idx === STEPS.length - 1 ? "Get started" : "Next"}
              {idx !== STEPS.length - 1 && (
                <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
                  <path
                    d="m5.5 3.5 3.5 3.5-3.5 3.5"
                    stroke="currentColor"
                    strokeWidth="1.8"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </svg>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

/** Use to (re-)open the tour from anywhere. */
export function triggerTour() {
  document.dispatchEvent(new CustomEvent("vedaai:tour"));
}
