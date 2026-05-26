import { NextResponse } from "next/server";
import { store } from "@/server/store";

export const runtime = "nodejs";

export async function GET(_req: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const doc = store.get(id);
  if (!doc || doc.status !== "ready" || !doc.result) {
    return NextResponse.json({ error: "NotReady" }, { status: 404 });
  }
  // Return only what's needed for the public view — no internal fields.
  return NextResponse.json({
    _id: doc._id,
    title: doc.title,
    subject: doc.subject,
    grade: doc.grade,
    school: doc.school,
    result: doc.result,
    createdAt: doc.createdAt,
  });
}
