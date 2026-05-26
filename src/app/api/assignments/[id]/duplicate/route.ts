import { NextResponse } from "next/server";
import { store, notifications } from "@/server/store";
import type { Assignment } from "@/types/assignment";

export const runtime = "nodejs";

export async function POST(_req: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const src = await store.get(id);
  if (!src) return NextResponse.json({ error: "NotFound" }, { status: 404 });

  const newId = crypto.randomUUID();
  const now = new Date().toISOString();
  const copy: Assignment = {
    ...src,
    _id: newId,
    title: `${src.title || "Untitled Assignment"} (copy)`,
    status: "ready",
    jobId: newId,
    createdAt: now,
    updatedAt: now,
  };
  await store.set(copy);

  await notifications.push({
    title: "Assignment duplicated",
    body: `${copy.subject} — ${copy.grade}`,
    assignmentId: newId,
  });

  return NextResponse.json({ id: newId, status: "ready" }, { status: 201 });
}
