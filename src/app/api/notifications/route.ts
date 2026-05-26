import { NextResponse } from "next/server";
import { notifications } from "@/server/store";

export const runtime = "nodejs";

export async function GET() {
  return NextResponse.json({
    items: notifications.list(),
    unread: notifications.unreadCount(),
  });
}

export async function POST() {
  notifications.markAllRead();
  return NextResponse.json({ ok: true, unread: 0 });
}
