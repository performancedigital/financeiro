import { NextResponse } from "next/server";
import { markReceivablePaid } from "@/lib/db-service";
import { withApiAuth } from "@/lib/api-guard";

type RouteContext = {
  params: Promise<{ id: string }>;
};

export async function PATCH(_request: Request, context: RouteContext) {
  return withApiAuth(async (session) => {
    const { id } = await context.params;
    await markReceivablePaid(session, id);
    return NextResponse.json({ ok: true });
  });
}
