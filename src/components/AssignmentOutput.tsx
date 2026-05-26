"use client";
import Image from "next/image";
import { useState } from "react";
import { useSearchParams } from "next/navigation";
import { useAssignmentSocket } from "@/hooks/useAssignmentSocket";
import { useAssignmentStore } from "@/store/assignment";
import { api } from "@/lib/api";
import { downloadPaperPdf } from "@/lib/pdf";
import { DifficultyBadge } from "./DifficultyBadge";
import { ThinkingIndicator } from "./ThinkingIndicator";
import { PaperSkeleton } from "./PaperSkeleton";
import { paperToMarkdown, copyToClipboard } from "@/lib/paper-export";
import type {
  AssignmentStatus,
  GeneratedQuestion,
  GeneratedResult,
} from "@/types/assignment";

const A4 = "/figma/screen4";

export function AssignmentOutput() {
  const params = useSearchParams();
  const id = params.get("id");
  useAssignmentSocket(id);
  const { current, status, error, setResult } = useAssignmentStore();
  const [regenerating, setRegenerating] = useState(false);
  const [showAnswers, setShowAnswers] = useState(false);
  const [toast, setToast] = useState<string | null>(null);
  const [shareUrl, setShareUrl] = useState<string | null>(null);

  const result = current?.result ?? null;

  function flash(msg: string) {
    setToast(msg);
    setTimeout(() => setToast(null), 2200);
  }

  async function onRegenerateAll() {
    if (!id) return;
    setRegenerating(true);
    try {
      await api.regenerate(id);
    } finally {
      setRegenerating(false);
    }
  }

  async function onCopyMarkdown() {
    if (!result) return;
    const md = paperToMarkdown(result, showAnswers);
    const ok = await copyToClipboard(md);
    flash(ok ? "Copied paper as Markdown" : "Copy failed");
  }

  function onShare() {
    if (!id) return;
    const url = `${window.location.origin}/share/${id}`;
    setShareUrl(url);
    copyToClipboard(url).then((ok) => flash(ok ? "Share link copied" : url));
  }

  function onPrint() {
    window.print();
  }

  // Update a question in the local store after PATCH/POST regenerate
  function spliceQuestion(si: number, qi: number, q: GeneratedQuestion, totalMarks?: number) {
    if (!result) return;
    const next: GeneratedResult = {
      ...result,
      sections: result.sections.map((s, i) =>
        i === si
          ? { ...s, questions: s.questions.map((x, j) => (j === qi ? q : x)) }
          : s
      ),
      totalMarks: totalMarks ?? result.totalMarks,
    };
    setResult(next);
  }

  if (!id) {
    return (
      <div className="absolute left-[327px] top-[82px] w-[1100px] bg-ink-secondary rounded-[32px] p-8 text-white font-bricolage">
        No assignment selected. Create one from the home page.
      </div>
    );
  }

  return (
    <div
      id="paper-print-root"
      className="absolute left-[327px] top-[82px] w-[1100px] bg-ink-secondary rounded-[32px] p-5 flex flex-col gap-3 items-center"
    >
      {/* AI message bubble */}
      <div className="bg-[rgba(24,24,24,0.8)] rounded-[32px] px-8 py-6 w-full flex flex-col gap-4 items-start no-print">
        {status === "ready" ? (
          <p className="font-bricolage font-bold text-[20px] tracking-[-0.04em] text-white leading-[1.4] fade-up">
            {statusMessage(status, current?.subject, current?.grade, error)}
          </p>
        ) : status === "failed" ? (
          <p className="font-bricolage font-bold text-[20px] tracking-[-0.04em] text-rose-300 leading-[1.4] fade-up">
            {statusMessage(status, current?.subject, current?.grade, error)}
          </p>
        ) : (
          <ThinkingIndicator
            status={status as AssignmentStatus}
            steps={[
              `Reading ${current?.subject || "your"} prompt`,
              `Mapping difficulty for ${current?.grade || "your class"}`,
              "Drafting Section A",
              "Balancing marks per section",
              "Writing original questions",
              "Adding section instructions",
              "Final review",
              "Almost there",
            ]}
          />
        )}
        {current?.warning && status === "ready" && (
          <div className="bg-amber-500/15 border border-amber-300/40 text-amber-100 rounded-2xl px-4 py-2 font-bricolage text-sm">
            {current.warning}
          </div>
        )}
        {status === "ready" && result && (
          <ActionBar
            onDownloadPdf={() => downloadPaperPdf(result, "question-paper.pdf")}
            onRegenerate={onRegenerateAll}
            regenerating={regenerating}
            onCopyMarkdown={onCopyMarkdown}
            onShare={onShare}
            onPrint={onPrint}
            showAnswers={showAnswers}
            onToggleAnswers={() => setShowAnswers((v) => !v)}
          />
        )}
        {shareUrl && (
          <div className="w-full bg-white/10 border border-white/20 rounded-2xl px-4 py-2 flex items-center gap-3">
            <span className="font-bricolage text-xs text-white/70 uppercase tracking-wider">
              Share link
            </span>
            <code className="flex-1 font-mono text-xs text-white truncate">{shareUrl}</code>
            <button
              type="button"
              onClick={() => copyToClipboard(shareUrl).then(() => flash("Copied"))}
              className="text-xs font-bricolage font-semibold text-brand-orangeAlt hover:underline"
            >
              Copy
            </button>
          </div>
        )}
      </div>

      <section className="bg-white rounded-[32px] p-8 w-full flex flex-col gap-6 items-center paper-card">
        {status !== "ready" || !result ? (
          <LoadingPaper status={status} />
        ) : (
          <PaperBody
            assignmentId={id}
            result={result}
            showAnswers={showAnswers}
            onPatched={spliceQuestion}
            onToast={flash}
          />
        )}
      </section>

      {toast && (
        <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-50 bg-ink-primary text-white px-4 py-2 rounded-full font-bricolage text-sm shadow-[0_18px_40px_rgba(0,0,0,0.2)] fade-up no-print">
          {toast}
        </div>
      )}
    </div>
  );
}

function ActionBar({
  onDownloadPdf,
  onRegenerate,
  regenerating,
  onCopyMarkdown,
  onShare,
  onPrint,
  showAnswers,
  onToggleAnswers,
}: {
  onDownloadPdf: () => void;
  onRegenerate: () => void;
  regenerating: boolean;
  onCopyMarkdown: () => void;
  onShare: () => void;
  onPrint: () => void;
  showAnswers: boolean;
  onToggleAnswers: () => void;
}) {
  return (
    <div className="flex flex-wrap gap-2 items-center">
      <button
        type="button"
        onClick={onDownloadPdf}
        className="bg-white h-11 px-5 rounded-pill flex items-center gap-1.5 hover:shadow-md transition"
      >
        <Image src={`${A4}/download-icon.svg`} alt="" width={18} height={18} />
        <span className="font-bricolage font-medium text-sm tracking-[-0.04em] text-ink-primary">
          Download PDF
        </span>
      </button>
      <ToolbarButton onClick={onCopyMarkdown} icon={<IconCopy />} label="Copy as Markdown" />
      <ToolbarButton onClick={onShare} icon={<IconShare />} label="Share" />
      <ToolbarButton onClick={onPrint} icon={<IconPrint />} label="Print" />
      <ToolbarButton
        onClick={onToggleAnswers}
        icon={showAnswers ? <IconEyeOff /> : <IconEye />}
        label={showAnswers ? "Hide answer key" : "Show answer key"}
        active={showAnswers}
      />
      <button
        type="button"
        onClick={onRegenerate}
        disabled={regenerating}
        className="h-11 px-5 rounded-pill bg-button-primary text-white font-bricolage font-medium text-sm tracking-[-0.04em] disabled:opacity-60 border border-white/30 hover:bg-button-dark transition flex items-center gap-1.5"
      >
        <IconRefresh spin={regenerating} />
        {regenerating ? "Regenerating…" : "Regenerate all"}
      </button>
    </div>
  );
}

function ToolbarButton({
  onClick,
  icon,
  label,
  active,
}: {
  onClick: () => void;
  icon: React.ReactNode;
  label: string;
  active?: boolean;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`h-11 px-4 rounded-pill flex items-center gap-1.5 transition border ${
        active
          ? "bg-brand-orange/15 text-brand-orange border-brand-orange/40"
          : "bg-white/10 text-white border-white/15 hover:bg-white/20"
      } font-bricolage font-medium text-sm tracking-[-0.04em]`}
    >
      {icon}
      <span>{label}</span>
    </button>
  );
}

function statusMessage(
  status: string,
  subject?: string,
  grade?: string,
  error?: string
) {
  switch (status) {
    case "ready":
      return `Here is your customized question paper${
        subject ? ` for ${grade ?? "your class"} ${subject}` : ""
      }.`;
    case "processing":
      return "Generating your question paper…";
    case "pending":
      return "Queued for generation…";
    case "failed": {
      const short = (error || "Unknown error").split("\n")[0].slice(0, 180);
      return `Generation failed: ${short}`;
    }
    default:
      return "Loading…";
  }
}

function LoadingPaper({ status }: { status: string }) {
  if (status === "failed") {
    return (
      <div className="w-full flex flex-col gap-2 items-center py-16">
        <div className="w-12 h-12 rounded-full bg-rose-100 flex items-center justify-center">
          <svg width="22" height="22" viewBox="0 0 24 24" fill="none">
            <path d="M12 8v5M12 16h.01" stroke="#c53535" strokeWidth="2" strokeLinecap="round" />
            <circle cx="12" cy="12" r="10" stroke="#c53535" strokeWidth="2" />
          </svg>
        </div>
        <p className="font-bricolage font-semibold text-ink-primary">Something went wrong.</p>
      </div>
    );
  }
  return <PaperSkeleton />;
}

function PaperBody({
  assignmentId,
  result,
  showAnswers,
  onPatched,
  onToast,
}: {
  assignmentId: string;
  result: GeneratedResult;
  showAnswers: boolean;
  onPatched: (si: number, qi: number, q: GeneratedQuestion, total?: number) => void;
  onToast: (msg: string) => void;
}) {
  return (
    <div className="w-full flex flex-col gap-5 font-inter text-ink-primary">
      <div className="text-center border-b border-ink-primary/40 pb-4">
        <h2 className="font-bold text-[26px] leading-[1.2] tracking-[-0.01em] uppercase">
          {result.school || "School"}
        </h2>
        <div className="mt-2 flex items-baseline justify-between text-[14px] font-medium">
          <span className="font-semibold">Subject: {result.subject}</span>
          <span className="font-bold text-[18px]">Question Paper</span>
          <span className="font-semibold">Class: {result.grade}</span>
        </div>
        <div className="mt-1 flex items-baseline justify-between text-[13px]">
          <span>
            <span className="font-semibold">Time Allowed:</span> {result.timeMinutes} min
          </span>
          <span>
            <span className="font-semibold">Maximum Marks:</span> {result.totalMarks}
          </span>
        </div>
      </div>

      <div className="flex gap-4 text-[13px] leading-[1.55]">
        <span className="font-bold whitespace-nowrap">Note :</span>
        <ol className="list-decimal list-inside flex-1 space-y-0.5 marker:font-bold">
          <li>Answer all questions. All questions carry the marks indicated.</li>
          <li>All sections are compulsory unless stated otherwise.</li>
          <li>Write answers in the space provided after each section.</li>
          <li>Assume suitable values for any missing data.</li>
        </ol>
      </div>

      <div className="grid grid-cols-3 border border-ink-primary/70 text-[13px]">
        <StudentCell label="Name" />
        <StudentCell label="Roll No." />
        <StudentCell label="Section" last />
      </div>

      {result.sections.map((sec, si) => (
        <SectionTable
          key={si}
          index={si}
          section={sec}
          assignmentId={assignmentId}
          showAnswers={showAnswers}
          onPatched={onPatched}
          onToast={onToast}
        />
      ))}

      <p className="font-bold text-[14px] text-center pt-2 border-t border-ink-primary/40">
        ─── End of Question Paper ───
      </p>
    </div>
  );
}

function StudentCell({ label, last }: { label: string; last?: boolean }) {
  return (
    <div
      className={`flex items-center gap-2 px-3 py-2 ${
        last ? "" : "border-r border-ink-primary/70"
      }`}
    >
      <span className="font-bold whitespace-nowrap">{label}:</span>
      <span className="flex-1 border-b border-dashed border-ink-primary/50 h-5" />
    </div>
  );
}

function SectionTable({
  index,
  section,
  assignmentId,
  showAnswers,
  onPatched,
  onToast,
}: {
  index: number;
  section: GeneratedResult["sections"][number];
  assignmentId: string;
  showAnswers: boolean;
  onPatched: (si: number, qi: number, q: GeneratedQuestion, total?: number) => void;
  onToast: (msg: string) => void;
}) {
  const sectionMarks = section.questions.reduce((s, q) => s + q.marks, 0);
  return (
    <div className="w-full flex flex-col gap-1.5">
      <div className="flex items-baseline justify-between">
        <h3 className="font-bold text-[16px] uppercase tracking-wide">
          {section.title}
        </h3>
        <span className="text-[12px] font-semibold text-ink-secondary">
          {section.questions.length} questions · {sectionMarks} marks
        </span>
      </div>
      <p className="italic text-[13px] text-ink-primary/75 leading-[1.5]">
        {section.instruction}
      </p>

      <div className="w-full overflow-hidden rounded-[6px] border border-ink-primary/70">
        <table className="w-full border-collapse text-[13px]">
          <thead>
            <tr className="bg-surface-off/80">
              <Th w="52px">No.</Th>
              <Th>Question</Th>
              <Th w="70px" align="center">
                Marks
              </Th>
              <Th w="120px" align="center">
                Type
              </Th>
              <Th w="100px" align="center">
                Difficulty
              </Th>
              <Th w="80px" align="center" last>
                Tools
              </Th>
            </tr>
          </thead>
          <tbody>
            {section.questions.map((q, qi) => (
              <QuestionRow
                key={qi}
                sectionIdx={index}
                questionIdx={qi}
                question={q}
                showAnswers={showAnswers}
                assignmentId={assignmentId}
                onPatched={onPatched}
                onToast={onToast}
              />
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

function QuestionRow({
  sectionIdx,
  questionIdx,
  question,
  showAnswers,
  assignmentId,
  onPatched,
  onToast,
}: {
  sectionIdx: number;
  questionIdx: number;
  question: GeneratedQuestion;
  showAnswers: boolean;
  assignmentId: string;
  onPatched: (si: number, qi: number, q: GeneratedQuestion, total?: number) => void;
  onToast: (msg: string) => void;
}) {
  const [editing, setEditing] = useState(false);
  const [draft, setDraft] = useState(question.text);
  const [busy, setBusy] = useState(false);

  async function saveEdit() {
    if (draft.trim() === question.text) {
      setEditing(false);
      return;
    }
    setBusy(true);
    try {
      const r = await api.patchQuestion(assignmentId, sectionIdx, questionIdx, {
        text: draft.trim(),
      });
      onPatched(sectionIdx, questionIdx, r.question, r.totalMarks);
      setEditing(false);
      onToast("Question updated");
    } catch (e) {
      onToast(`Update failed: ${(e as Error).message}`);
    } finally {
      setBusy(false);
    }
  }

  async function regenerate() {
    setBusy(true);
    try {
      const r = await api.regenerateQuestion(assignmentId, sectionIdx, questionIdx);
      onPatched(sectionIdx, questionIdx, r.question);
      setDraft(r.question.text);
      onToast(r.source === "gemini" ? "Question regenerated" : "Regenerated (offline)");
    } catch (e) {
      onToast(`Regenerate failed: ${(e as Error).message}`);
    } finally {
      setBusy(false);
    }
  }

  const rowBg = questionIdx % 2 === 0 ? "bg-white" : "bg-surface-off/40";

  return (
    <>
      <tr className={`${rowBg} group ${busy ? "opacity-60" : ""}`}>
        <Td align="center" mono>
          {romanize(sectionIdx + 1)}.{questionIdx + 1}
        </Td>
        <Td>
          {editing ? (
            <div className="flex flex-col gap-2">
              <textarea
                autoFocus
                value={draft}
                onChange={(e) => setDraft(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter" && (e.metaKey || e.ctrlKey)) saveEdit();
                  if (e.key === "Escape") {
                    setDraft(question.text);
                    setEditing(false);
                  }
                }}
                className="w-full min-h-[64px] bg-white border border-ink-primary/40 rounded-md p-2 font-inter text-[13px] outline-none focus:border-ink-primary resize-y"
              />
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={saveEdit}
                  disabled={busy}
                  className="px-3 h-7 rounded-pill bg-ink-primary text-white text-xs font-bricolage font-semibold disabled:opacity-60"
                >
                  Save
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setDraft(question.text);
                    setEditing(false);
                  }}
                  className="px-3 h-7 rounded-pill bg-surface-off text-ink-primary text-xs font-bricolage font-semibold"
                >
                  Cancel
                </button>
                <span className="font-bricolage text-[10px] text-ink-muted">
                  ⌘/Ctrl+Enter to save · Esc to cancel
                </span>
              </div>
            </div>
          ) : (
            <button
              type="button"
              onClick={() => setEditing(true)}
              className="text-left w-full hover:bg-amber-50/60 rounded-sm transition px-1 -mx-1"
              title="Click to edit"
            >
              {question.text}
            </button>
          )}
        </Td>
        <Td align="center" mono>
          {question.marks.toString().padStart(2, "0")}
        </Td>
        <Td align="center">
          <span className="font-semibold uppercase text-[11px] tracking-wide text-ink-secondary">
            {humanizeTypeId(question.typeId)}
          </span>
        </Td>
        <Td align="center">
          <DifficultyBadge value={question.difficulty} />
        </Td>
        <Td align="center" last>
          <div className="flex items-center justify-center gap-1 no-print">
            <IconBtn
              title="Edit question"
              onClick={() => setEditing(true)}
              disabled={busy}
            >
              <IconPencil />
            </IconBtn>
            <IconBtn
              title="Regenerate this question"
              onClick={regenerate}
              disabled={busy}
            >
              <IconSparkle />
            </IconBtn>
          </div>
        </Td>
      </tr>
      {showAnswers && question.answerKey && (
        <tr className={rowBg}>
          <Td align="center" mono>
            <span className="text-emerald-700 font-bold text-[11px]">ANS</span>
          </Td>
          <td colSpan={5} className="px-3 py-2 border-t border-ink-primary/30 align-top">
            <div className="bg-emerald-50/60 border border-emerald-200/60 rounded-md p-2.5 text-emerald-900 text-[12.5px] leading-[1.5]">
              <span className="font-bold mr-1">Answer:</span>
              {question.answerKey}
            </div>
          </td>
        </tr>
      )}
    </>
  );
}

function IconBtn({
  children,
  onClick,
  title,
  disabled,
}: {
  children: React.ReactNode;
  onClick: () => void;
  title: string;
  disabled?: boolean;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      title={title}
      aria-label={title}
      className="w-7 h-7 rounded-full bg-white border border-ink-primary/15 text-ink-primary hover:bg-ink-primary hover:text-white hover:border-ink-primary transition flex items-center justify-center disabled:opacity-40"
    >
      {children}
    </button>
  );
}

function Th({
  children,
  w,
  align = "left",
  last,
}: {
  children: React.ReactNode;
  w?: string;
  align?: "left" | "center";
  last?: boolean;
}) {
  return (
    <th
      className={`px-3 py-2 font-bold text-[12px] uppercase tracking-wide border-b border-ink-primary/70 ${
        last ? "" : "border-r border-ink-primary/70"
      } ${align === "center" ? "text-center" : "text-left"}`}
      style={w ? { width: w } : undefined}
    >
      {children}
    </th>
  );
}

function Td({
  children,
  align = "left",
  mono,
  last,
}: {
  children: React.ReactNode;
  align?: "left" | "center";
  mono?: boolean;
  last?: boolean;
}) {
  return (
    <td
      className={`px-3 py-2 align-top leading-[1.5] border-t border-ink-primary/30 ${
        last ? "" : "border-r border-ink-primary/30"
      } ${align === "center" ? "text-center" : "text-left"} ${
        mono ? "font-mono font-semibold" : ""
      }`}
    >
      {children}
    </td>
  );
}

function humanizeTypeId(id: string): string {
  const map: Record<string, string> = {
    mcq: "MCQ",
    "true-false": "T/F",
    "fill-blanks": "Fill-Up",
    short: "Short",
    long: "Long",
    diagram: "Diagram",
    numerical: "Numerical",
    "case-study": "Case Study",
    match: "Match",
    essay: "Essay",
  };
  if (map[id]) return map[id];
  if (id.startsWith("custom-")) return "Custom";
  return id;
}

function romanize(n: number): string {
  const roman = ["I", "II", "III", "IV", "V", "VI", "VII", "VIII", "IX", "X"];
  return roman[n - 1] ?? String(n);
}

/* ---------- Icons (inline SVG, no extra deps) ---------- */

function IconCopy() {
  return (
    <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
      <rect x="4" y="4" width="7" height="8" rx="1.2" stroke="currentColor" strokeWidth="1.4" />
      <path d="M3 9V3a1 1 0 0 1 1-1h6" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" />
    </svg>
  );
}
function IconShare() {
  return (
    <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
      <circle cx="3.5" cy="7" r="1.6" stroke="currentColor" strokeWidth="1.4" />
      <circle cx="10.5" cy="3.5" r="1.6" stroke="currentColor" strokeWidth="1.4" />
      <circle cx="10.5" cy="10.5" r="1.6" stroke="currentColor" strokeWidth="1.4" />
      <path d="m5 6.2 4-1.4M5 7.8 9 9.2" stroke="currentColor" strokeWidth="1.4" />
    </svg>
  );
}
function IconPrint() {
  return (
    <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
      <path d="M4 4V2.5h6V4M3 4h8a1 1 0 0 1 1 1v4a1 1 0 0 1-1 1h-1v1.5H4V10H3a1 1 0 0 1-1-1V5a1 1 0 0 1 1-1Z" stroke="currentColor" strokeWidth="1.4" strokeLinejoin="round" />
      <path d="M4 8h6" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" />
    </svg>
  );
}
function IconEye() {
  return (
    <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
      <path d="M1.5 7s2-4 5.5-4 5.5 4 5.5 4-2 4-5.5 4S1.5 7 1.5 7Z" stroke="currentColor" strokeWidth="1.4" strokeLinejoin="round" />
      <circle cx="7" cy="7" r="1.7" stroke="currentColor" strokeWidth="1.4" />
    </svg>
  );
}
function IconEyeOff() {
  return (
    <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
      <path d="M2 2l10 10M3 5.6C2.1 6.3 1.5 7 1.5 7s2 4 5.5 4c1 0 1.9-.3 2.7-.7M6 3.1c.3-.1.6-.1 1-.1 3.5 0 5.5 4 5.5 4s-.4.7-1.1 1.5"
        stroke="currentColor"
        strokeWidth="1.4"
        strokeLinecap="round"
        strokeLinejoin="round" />
    </svg>
  );
}
function IconRefresh({ spin }: { spin?: boolean }) {
  return (
    <svg
      width="14"
      height="14"
      viewBox="0 0 14 14"
      fill="none"
      className={spin ? "animate-spin" : ""}
    >
      <path d="M11.5 7a4.5 4.5 0 1 1-1.5-3.4M11.5 2v3h-3" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}
function IconPencil() {
  return (
    <svg width="12" height="12" viewBox="0 0 14 14" fill="none">
      <path d="m2.5 11.5 1-3 6-6 2 2-6 6-3 1ZM8.5 4l2 2" stroke="currentColor" strokeWidth="1.4" strokeLinejoin="round" />
    </svg>
  );
}
function IconSparkle() {
  return (
    <svg width="12" height="12" viewBox="0 0 14 14" fill="none">
      <path
        d="M7 1.5 8 5l3.5 1L8 7l-1 3.5L6 7 2.5 6 6 5z"
        fill="currentColor"
      />
    </svg>
  );
}
