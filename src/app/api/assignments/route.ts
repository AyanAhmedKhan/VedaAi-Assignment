import { NextResponse } from "next/server";
import { store, notifications } from "@/server/store";
import { CreateAssignmentInput } from "@/server/validate";
import { generateQuestionPaper } from "@/server/llm";
import { identityFromRequest } from "@/server/rateLimit";
import type { Assignment } from "@/types/assignment";

export const runtime = "nodejs";

export async function GET() {
  return NextResponse.json(await store.list());
}

export async function POST(req: Request) {
  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "InvalidJSON" }, { status: 400 });
  }
  const parsed = CreateAssignmentInput.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { error: "ValidationError", details: parsed.error.flatten() },
      { status: 400 }
    );
  }

  const id = crypto.randomUUID();
  const now = new Date().toISOString();
  const doc: Assignment = {
    _id: id,
    title: parsed.data.title || "Untitled Assignment",
    subject: parsed.data.subject,
    grade: parsed.data.grade,
    school: parsed.data.school ?? "",
    dueDate: parsed.data.dueDate ?? "",
    questionTypes: parsed.data.questionTypes,
    instructions: parsed.data.instructions ?? "",
    fileName: parsed.data.fileName ?? "",
    status: "pending",
    error: "",
    jobId: id,
    result: null,
    createdAt: now,
    updatedAt: now,
  };
  const identity = identityFromRequest(req);

  await store.set(doc);
  await notifications.push({
    title: "Assignment created",
    body: `${doc.subject} — ${doc.grade}`,
    assignmentId: id,
  });

  // Run generation synchronously so the result is persisted before the
  // serverless function exits. On Vercel, fire-and-forget Promises after
  // res.json() are killed when the function returns — that's why polls
  // sometimes returned 404 with status="pending" forever.
  await runGeneration(id, identity);

  return NextResponse.json({ id, jobId: id, status: "ready" }, { status: 201 });
}

async function runGeneration(id: string, identity: string) {
  const doc = await store.get(id);
  if (!doc) return;
  await store.update(id, { status: "processing" });
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
      outcome.source === "gemini"
        ? "Question paper ready"
        : "Paper ready (offline mode)",
    body: outcome.warning || `${doc.subject} — ${doc.grade}`,
    assignmentId: id,
  });
}
