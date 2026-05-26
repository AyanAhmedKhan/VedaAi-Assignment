"use client";
import { useEffect, useState } from "react";

const DEFAULT_STEPS = [
  "Reading your prompt",
  "Mapping difficulty curve",
  "Drafting Section A",
  "Balancing marks per section",
  "Writing original questions",
  "Adding instructions per section",
  "Final review",
  "Almost there",
];

/**
 * Cycles through a list of "thinking" steps with a fade+slide animation,
 * a pulsing brand-orange dot, and three trailing dots that bounce.
 * Designed to live inside the dark AI bubble in the output page.
 */
export function ThinkingIndicator({
  steps = DEFAULT_STEPS,
  intervalMs = 1800,
  status,
}: {
  steps?: string[];
  intervalMs?: number;
  status: "pending" | "processing" | "ready" | "failed";
}) {
  const [i, setI] = useState(0);

  useEffect(() => {
    if (status !== "processing" && status !== "pending") return;
    const t = setInterval(() => setI((v) => (v + 1) % steps.length), intervalMs);
    return () => clearInterval(t);
  }, [steps.length, intervalMs, status]);

  const label =
    status === "pending"
      ? "Queued for generation"
      : status === "processing"
      ? steps[i]
      : status === "failed"
      ? "Generation failed"
      : "Loading";

  return (
    <div className="flex items-center gap-3">
      <span className="relative w-2.5 h-2.5 rounded-full bg-brand-orange thinking-dot shadow-[0_0_18px_rgba(255,86,35,0.7)]" />
      <span
        key={`${status}-${i}`}
        className="fade-up font-bricolage font-semibold text-[20px] tracking-[-0.04em] leading-[1.4] thinking-text"
      >
        {label}
      </span>
      <span className="flex gap-1 ml-1">
        <Dot delay={0} />
        <Dot delay={150} />
        <Dot delay={300} />
      </span>
    </div>
  );
}

function Dot({ delay }: { delay: number }) {
  return (
    <span
      className="w-1.5 h-1.5 rounded-full bg-white/70"
      style={{
        animation: "thinking-pulse 1.1s ease-in-out infinite",
        animationDelay: `${delay}ms`,
      }}
    />
  );
}
