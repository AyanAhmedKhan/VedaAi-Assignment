import { NextResponse } from "next/server";
import { notifications } from "@/server/store";

export const runtime = "nodejs";

export async function GET() {
  const [items, unread] = await Promise.all([
    notifications.list(),
    notifications.unreadCount(),
  ]);
  return NextResponse.json({ items, unread });
}

export async function POST() {
  await notifications.markAllRead();
  return NextResponse.json({ ok: true, unread: 0 });
}
