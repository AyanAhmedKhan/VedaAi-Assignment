import { NextResponse } from "next/server";
import { getRateStatus, identityFromRequest } from "@/server/rateLimit";

export const runtime = "nodejs";

export async function GET(req: Request) {
  const status = await getRateStatus(identityFromRequest(req));
  return NextResponse.json(status);
}
