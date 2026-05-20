import { NextResponse } from "next/server";
import { getSnapshot } from "@/lib/db-service";
import { withApiAuth } from "@/lib/api-guard";

export async function GET() {
  return withApiAuth(async (session) => {
    const snapshot = await getSnapshot(session);
    return NextResponse.json(snapshot);
  });
}
