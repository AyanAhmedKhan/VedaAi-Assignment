import { NextResponse } from "next/server";
import { store, notifications } from "@/server/store";
import { regenerateQuestion } from "@/server/llm";

export const runtime = "nodejs";

type Params = { id: string; section: string; q: string };

// PATCH — inline edit a single question (text, difficulty, marks, answerKey)
export async function PATCH(req: Request, { params }: { params: Promise<Params> }) {
  const { id, section, q } = await params;
  const doc = store.get(id);
  if (!doc || !doc.result) return NextResponse.json({ error: "NotFound" }, { status: 404 });

  const sIdx = Number(section);
  const qIdx = Number(q);
  const sec = doc.result.sections[sIdx];
  if (!sec || !sec.questions[qIdx]) {
    return NextResponse.json({ error: "QuestionNotFound" }, { status: 404 });
  }

  let patch: {
    text?: string;
    difficulty?: "Easy" | "Moderate" | "Hard";
    marks?: number;
    answerKey?: string;
  };
  try {
    patch = await req.json();
  } catch {
    return NextResponse.json({ error: "InvalidJSON" }, { status: 400 });
  }

  const cur = sec.questions[qIdx];
  const next = {
    ...cur,
    ...(typeof patch.text === "string" ? { text: patch.text.slice(0, 1000) } : {}),
    ...(patch.difficulty ? { difficulty: patch.difficulty } : {}),
    ...(typeof patch.marks === "number" && patch.marks > 0
      ? { marks: Math.min(50, Math.floor(patch.marks)) }
      : {}),
    ...(typeof patch.answerKey === "string"
      ? { answerKey: patch.answerKey.slice(0, 2000) }
      : {}),
  };
  sec.questions[qIdx] = next;

  // Recalc total marks if marks changed
  const totalMarks = doc.result.sections.reduce(
    (acc, s) => acc + s.questions.reduce((a, x) => a + x.marks, 0),
    0
  );
  doc.result.totalMarks = totalMarks;

  store.update(id, { result: doc.result });
  return NextResponse.json({ ok: true, question: next, totalMarks });
}

// POST — regenerate a single question via Gemini
export async function POST(_req: Request, { params }: { params: Promise<Params> }) {
  const { id, section, q } = await params;
  const doc = store.get(id);
  if (!doc || !doc.result) return NextResponse.json({ error: "NotFound" }, { status: 404 });

  const sIdx = Number(section);
  const qIdx = Number(q);
  const sec = doc.result.sections[sIdx];
  if (!sec || !sec.questions[qIdx]) {
    return NextResponse.json({ error: "QuestionNotFound" }, { status: 404 });
  }

  const avoidTexts = sec.questions.map((x) => x.text);

  const outcome = await regenerateQuestion({
    subject: doc.subject,
    grade: doc.grade,
    sectionTitle: sec.title,
    sectionInstruction: sec.instruction,
    question: sec.questions[qIdx],
    avoidTexts,
  });

  sec.questions[qIdx] = outcome.question;
  store.update(id, { result: doc.result });

  notifications.push({
    title:
      outcome.source === "gemini"
        ? "Question regenerated"
        : "Regenerated (offline mode)",
    body: `${doc.subject} · ${sec.title} · Q${qIdx + 1}`,
    assignmentId: id,
  });

  return NextResponse.json({
    ok: true,
    question: outcome.question,
    source: outcome.source,
    warning: outcome.warning,
  });
}
