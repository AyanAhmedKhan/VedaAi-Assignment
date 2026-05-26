import { NextResponse } from "next/server";
import { store, notifications } from "@/server/store";
import { generateQuestionPaper } from "@/server/llm";
import { identityFromRequest } from "@/server/rateLimit";

export const runtime = "nodejs";

export async function POST(req: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const doc = await store.get(id);
  if (!doc) return NextResponse.json({ error: "NotFound" }, { status: 404 });

  const identity = identityFromRequest(req);

  await store.update(id, { status: "processing", error: "", result: null });
  await notifications.push({
    title: "Regenerating paper",
    body: `${doc.subject} — ${doc.grade}`,
    assignmentId: id,
  });

  // Synchronous so the result is persisted before Vercel kills the function.
  const outcome = await generateQuestionPaper(
    {
      subject: doc.subject,
      grade: doc.grade,
      school: doc.school,
      instructions: doc.instructions,
      questionTypes: doc.questionTypes,
    },
    identity
  );
  await store.update(id, {
    status: "ready",
    result: outcome.result,
    source: outcome.source,
    warning: outcome.warning ?? "",
    error: "",
  });
  await notifications.push({
    title:
      outcome.source === "gemini" ? "Question paper ready" : "Paper ready (offline mode)",
    body: outcome.warning || `${doc.subject} — ${doc.grade}`,
    assignmentId: id,
  });

  return NextResponse.json({ id, jobId: id, status: "ready" });
}
