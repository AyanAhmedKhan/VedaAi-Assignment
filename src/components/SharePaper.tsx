"use client";
import { useEffect, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { api } from "@/lib/api";
import { DifficultyBadge } from "./DifficultyBadge";
import { downloadPaperPdf } from "@/lib/pdf";
import type { GeneratedResult } from "@/types/assignment";

type Share = Awaited<ReturnType<typeof api.getShare>>;

export function SharePaper({ id }: { id: string }) {
  const [data, setData] = useState<Share | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    api
      .getShare(id)
      .then(setData)
      .catch((e: Error) => setError(e.message));
  }, [id]);

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-surface-off/40 p-6">
        <div className="bg-white rounded-2xl p-10 max-w-md text-center shadow-sidebar font-bricolage">
          <h1 className="font-bold text-xl mb-2 text-ink-primary">Paper not available</h1>
          <p className="text-sm text-ink-secondary mb-4">
            This share link may have expired or the paper is still generating.
          </p>
          <Link
            href="/"
            className="inline-block px-5 py-2.5 rounded-pill bg-button-primary text-white text-sm font-medium"
          >
            Go to VedaAI
          </Link>
        </div>
      </div>
    );
  }

  if (!data) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="w-10 h-10 rounded-full border-4 border-ink-primary/20 border-t-ink-primary animate-spin" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-surface-off to-surface-off40/60 py-8 px-4">
      <div className="max-w-[920px] mx-auto flex flex-col gap-4">
        <header className="flex items-center justify-between no-print">
          <Link href="/" className="flex items-center gap-2">
            <Image src="/icon.svg" alt="VedaAI" width={32} height={32} />
            <span className="font-bricolage font-bold text-[18px] text-ink-primary">
              VedaAI
            </span>
          </Link>
          <div className="flex gap-2">
            <button
              type="button"
              onClick={() => downloadPaperPdf(data.result, "question-paper.pdf")}
              className="bg-button-primary text-white font-bricolage font-medium text-sm px-5 py-2.5 rounded-pill border border-white/30"
            >
              Download PDF
            </button>
            <button
              type="button"
              onClick={() => window.print()}
              className="bg-white border border-surface-off40 text-ink-primary font-bricolage font-medium text-sm px-5 py-2.5 rounded-pill"
            >
              Print
            </button>
          </div>
        </header>

        <article
          id="paper-print-root"
          className="paper-card bg-white rounded-[24px] shadow-[0_18px_40px_rgba(0,0,0,0.08)] p-8 flex flex-col gap-5 font-inter text-ink-primary"
        >
          <PaperShareBody result={data.result} />
        </article>

        <footer className="text-center font-bricolage text-xs text-ink-muted no-print">
          Generated with VedaAI · Shared on {new Date(data.createdAt ?? Date.now()).toLocaleDateString()}
        </footer>
      </div>
    </div>
  );
}

function PaperShareBody({ result }: { result: GeneratedResult }) {
  return (
    <>
      <div className="text-center border-b border-ink-primary/40 pb-4">
        <h2 className="font-bold text-[24px] leading-[1.2] uppercase">
          {result.school || "School"}
        </h2>
        <div className="mt-2 flex items-baseline justify-between text-[13px] font-medium">
          <span className="font-semibold">Subject: {result.subject}</span>
          <span className="font-bold text-[16px]">Question Paper</span>
          <span className="font-semibold">Class: {result.grade}</span>
        </div>
        <div className="mt-1 flex items-baseline justify-between text-[12px]">
          <span>
            <b>Time:</b> {result.timeMinutes} min
          </span>
          <span>
            <b>Max Marks:</b> {result.totalMarks}
          </span>
        </div>
      </div>

      <div className="grid grid-cols-3 border border-ink-primary/70 text-[12px]">
        <div className="px-3 py-2 border-r border-ink-primary/70">
          <b>Name:</b>
        </div>
        <div className="px-3 py-2 border-r border-ink-primary/70">
          <b>Roll No.:</b>
        </div>
        <div className="px-3 py-2">
          <b>Section:</b>
        </div>
      </div>

      {result.sections.map((sec, si) => (
        <div key={si} className="flex flex-col gap-1.5">
          <div className="flex items-baseline justify-between">
            <h3 className="font-bold text-[15px] uppercase tracking-wide">{sec.title}</h3>
            <span className="text-[11px] font-semibold text-ink-secondary">
              {sec.questions.length} questions ·{" "}
              {sec.questions.reduce((s, q) => s + q.marks, 0)} marks
            </span>
          </div>
          <p className="italic text-[12px] text-ink-primary/75">{sec.instruction}</p>
          <div className="border border-ink-primary/70 rounded-md overflow-hidden">
            <table className="w-full border-collapse text-[12px]">
              <thead>
                <tr className="bg-surface-off/80">
                  <th className="w-[48px] px-2 py-1.5 text-center font-bold uppercase text-[11px] border-r border-b border-ink-primary/70">
                    No.
                  </th>
                  <th className="px-2 py-1.5 text-left font-bold uppercase text-[11px] border-r border-b border-ink-primary/70">
                    Question
                  </th>
                  <th className="w-[60px] px-2 py-1.5 text-center font-bold uppercase text-[11px] border-r border-b border-ink-primary/70">
                    Marks
                  </th>
                  <th className="w-[90px] px-2 py-1.5 text-center font-bold uppercase text-[11px] border-b border-ink-primary/70">
                    Difficulty
                  </th>
                </tr>
              </thead>
              <tbody>
                {sec.questions.map((q, qi) => (
                  <tr key={qi} className={qi % 2 ? "bg-surface-off/30" : "bg-white"}>
                    <td className="px-2 py-1.5 text-center font-mono font-semibold border-r border-t border-ink-primary/30">
                      {qi + 1}
                    </td>
                    <td className="px-2 py-1.5 border-r border-t border-ink-primary/30 leading-[1.5]">
                      {q.text}
                    </td>
                    <td className="px-2 py-1.5 text-center font-mono font-semibold border-r border-t border-ink-primary/30">
                      {q.marks.toString().padStart(2, "0")}
                    </td>
                    <td className="px-2 py-1.5 text-center border-t border-ink-primary/30">
                      <DifficultyBadge value={q.difficulty} />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      ))}

      <p className="font-bold text-[13px] text-center pt-2 border-t border-ink-primary/40">
        ─── End of Question Paper ───
      </p>
    </>
  );
}
