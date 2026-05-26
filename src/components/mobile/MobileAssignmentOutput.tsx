"use client";
import Image from "next/image";
import { useState } from "react";
import { useSearchParams } from "next/navigation";
import { useAssignmentSocket } from "@/hooks/useAssignmentSocket";
import { useAssignmentStore } from "@/store/assignment";
import { downloadPaperPdf } from "@/lib/pdf";
import { api } from "@/lib/api";
import { DifficultyBadge } from "../DifficultyBadge";
import { ThinkingIndicator } from "../ThinkingIndicator";
import { PaperSkeletonMobile } from "../PaperSkeleton";
import type { AssignmentStatus } from "@/types/assignment";

const A4 = "/figma/screen4";

export function MobileAssignmentOutput() {
  const params = useSearchParams();
  const id = params.get("id");
  useAssignmentSocket(id);
  const { current, status, error } = useAssignmentStore();
  const [busy, setBusy] = useState(false);

  const result = current?.result ?? null;

  if (!id) {
    return (
      <div className="bg-ink-secondary rounded-3xl p-5 text-white mt-2 font-bricolage">
        No assignment selected. Create one from the home page.
      </div>
    );
  }

  return (
    <div className="bg-ink-secondary rounded-3xl p-3 flex flex-col gap-2 mt-2">
      <div className="bg-[rgba(24,24,24,0.85)] rounded-2xl px-4 py-4 flex flex-col gap-3">
        {status === "ready" && result ? (
          <p className="font-bricolage font-bold text-sm tracking-[-0.04em] text-white leading-[1.4] fade-up">
            {`Here is your customized question paper for ${current?.grade ?? ""} ${current?.subject ?? ""}.`}
          </p>
        ) : status === "failed" ? (
          <p className="font-bricolage font-bold text-sm tracking-[-0.04em] text-rose-300 leading-[1.4] fade-up">
            {`Generation failed: ${(error || "unknown error").split("\n")[0].slice(0, 140)}`}
          </p>
        ) : (
          <ThinkingIndicator
            status={status as AssignmentStatus}
            steps={[
              `Reading ${current?.subject || "your"} prompt`,
              `Difficulty for ${current?.grade || "your class"}`,
              "Drafting Section A",
              "Balancing marks",
              "Writing questions",
              "Final review",
            ]}
          />
        )}
        {current?.warning && status === "ready" && (
          <div className="bg-amber-500/15 border border-amber-300/40 text-amber-100 rounded-xl px-3 py-2 font-bricolage text-xs">
            {current.warning}
          </div>
        )}
        {status === "ready" && result && (
          <div className="flex gap-2 justify-center flex-wrap">
            <button
              type="button"
              onClick={() => downloadPaperPdf(result)}
              className="bg-white h-10 px-4 rounded-pill flex items-center gap-1"
            >
              <Image src={`${A4}/download-icon.svg`} alt="" width={18} height={18} />
              <span className="font-bricolage font-medium text-sm tracking-[-0.04em] text-ink-primary">
                Download as PDF
              </span>
            </button>
            <button
              type="button"
              disabled={busy}
              onClick={async () => {
                setBusy(true);
                try {
                  await api.regenerate(id);
                } finally {
                  setBusy(false);
                }
              }}
              className="bg-button-primary text-white h-10 px-4 rounded-pill border border-white/30 font-bricolage font-medium text-sm disabled:opacity-60"
            >
              {busy ? "…" : "Regenerate"}
            </button>
          </div>
        )}
      </div>

      <section className="bg-white rounded-2xl p-4 flex flex-col gap-3">
        {status !== "ready" || !result ? (
          status === "failed" ? (
            <div className="flex flex-col items-center gap-2 py-10">
              <div className="w-10 h-10 rounded-full bg-rose-100 flex items-center justify-center">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
                  <path d="M12 8v5M12 16h.01" stroke="#c53535" strokeWidth="2" strokeLinecap="round" />
                  <circle cx="12" cy="12" r="10" stroke="#c53535" strokeWidth="2" />
                </svg>
              </div>
              <p className="font-bricolage font-semibold text-sm text-ink-primary">
                Something went wrong.
              </p>
            </div>
          ) : (
            <PaperSkeletonMobile />
          )
        ) : (
          <>
            <div className="text-center border-b border-ink-primary/40 pb-3">
              <h2 className="font-inter font-bold text-[16px] leading-[1.2] text-ink-primary uppercase">
                {result.school || "School"}
              </h2>
              <p className="font-inter font-bold text-xs text-ink-primary mt-1">
                Question Paper
              </p>
              <div className="flex justify-between text-[11px] font-inter mt-2">
                <span>
                  <b>Subject:</b> {result.subject}
                </span>
                <span>
                  <b>Class:</b> {result.grade}
                </span>
              </div>
              <div className="flex justify-between text-[11px] font-inter mt-0.5">
                <span>
                  <b>Time:</b> {result.timeMinutes} min
                </span>
                <span>
                  <b>Max Marks:</b> {result.totalMarks}
                </span>
              </div>
            </div>

            <div className="border border-ink-primary/70 text-[11px] font-inter">
              <div className="grid grid-cols-3">
                <div className="px-2 py-1 border-r border-ink-primary/70 truncate">
                  <b>Name</b>
                </div>
                <div className="px-2 py-1 border-r border-ink-primary/70 truncate">
                  <b>Roll</b>
                </div>
                <div className="px-2 py-1 truncate">
                  <b>Section</b>
                </div>
              </div>
            </div>

            {result.sections.map((sec, si) => {
              const total = sec.questions.reduce((s, q) => s + q.marks, 0);
              return (
                <div key={si} className="flex flex-col gap-1.5">
                  <div className="flex items-baseline justify-between">
                    <h3 className="font-inter font-bold text-xs text-ink-primary uppercase">
                      {sec.title}
                    </h3>
                    <span className="font-inter text-[10px] text-ink-secondary">
                      {sec.questions.length} Qs · {total} marks
                    </span>
                  </div>
                  <p className="font-inter italic text-[11px] text-ink-primary/70">
                    {sec.instruction}
                  </p>
                  <div className="border border-ink-primary/70 rounded-md overflow-hidden text-[11px] font-inter">
                    <div className="grid grid-cols-[28px_1fr_36px] bg-surface-off/80 font-bold uppercase text-[9px] tracking-wide">
                      <div className="px-2 py-1 border-r border-ink-primary/70 text-center">
                        No.
                      </div>
                      <div className="px-2 py-1 border-r border-ink-primary/70">
                        Question
                      </div>
                      <div className="px-2 py-1 text-center">M</div>
                    </div>
                    {sec.questions.map((q, qi) => (
                      <div
                        key={qi}
                        className={`grid grid-cols-[28px_1fr_36px] ${
                          qi % 2 ? "bg-surface-off/40" : "bg-white"
                        }`}
                      >
                        <div className="px-2 py-1.5 border-t border-r border-ink-primary/30 text-center font-mono font-semibold">
                          {qi + 1}
                        </div>
                        <div className="px-2 py-1.5 border-t border-r border-ink-primary/30 leading-[1.4]">
                          <div className="flex items-start gap-1.5 flex-wrap">
                            <DifficultyBadge value={q.difficulty} />
                            <span>{q.text}</span>
                          </div>
                        </div>
                        <div className="px-2 py-1.5 border-t border-ink-primary/30 text-center font-mono font-semibold">
                          {q.marks.toString().padStart(2, "0")}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              );
            })}

            <p className="font-inter font-bold text-xs text-ink-primary text-center mt-2 border-t border-ink-primary/40 pt-2">
              ─── End of Question Paper ───
            </p>
          </>
        )}
      </section>
    </div>
  );
}
