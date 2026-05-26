import type { Difficulty } from "@/types/assignment";

const styles: Record<Difficulty, string> = {
  Easy: "bg-emerald-50 text-emerald-700 border-emerald-200",
  Moderate: "bg-amber-50 text-amber-700 border-amber-200",
  Hard: "bg-rose-50 text-rose-700 border-rose-200",
};

export function DifficultyBadge({ value }: { value: Difficulty }) {
  return (
    <span
      className={`inline-flex items-center px-2 py-0.5 rounded-full border text-[11px] font-inter font-semibold leading-none tracking-[-0.01em] ${styles[value]}`}
    >
      {value}
    </span>
  );
}
