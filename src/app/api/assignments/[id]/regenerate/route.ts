import { NextResponse } from "next/server";
import { store, notifications } from "@/server/store";
import { generateQuestionPaper } from "@/server/llm";

export const runtime = "nodejs";

export async function POST(_req: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const doc = store.get(id);
  if (!doc) return NextResponse.json({ error: "NotFound" }, { status: 404 });

  store.update(id, { status: "processing", error: "", result: null });
  notifications.push({
    title: "Regenerating paper",
    body: `${doc.subject} — ${doc.grade}`,
    assignmentId: id,
  });

  void (async () => {
    const outcome = await generateQuestionPaper({
      subject: doc.subject,
      grade: doc.grade,
      school: doc.school,
      instructions: doc.instructions,
      questionTypes: doc.questionTypes,
    });
    store.update(id, {
      status: "ready",
      result: outcome.result,
      source: outcome.source,
      warning: outcome.warning ?? "",
      error: "",
    });
    notifications.push({
      title:
        outcome.source === "gemini" ? "Question paper ready" : "Paper ready (offline mode)",
      body: outcome.warning || `${doc.subject} — ${doc.grade}`,
      assignmentId: id,
    });
  })();

  return NextResponse.json({ id, jobId: id, status: "processing" });
}
