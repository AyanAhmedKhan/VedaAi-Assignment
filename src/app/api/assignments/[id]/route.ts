import { NextResponse } from "next/server";
import { store } from "@/server/store";

export const runtime = "nodejs";

export async function GET(_req: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const doc = await store.get(id);
  if (!doc) return NextResponse.json({ error: "NotFound" }, { status: 404 });
  return NextResponse.json(doc);
}

export async function DELETE(_req: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const ok = await store.delete(id);
  return NextResponse.json({ ok });
}
