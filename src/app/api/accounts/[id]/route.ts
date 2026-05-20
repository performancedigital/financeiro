import { NextResponse } from "next/server";
import { softDelete } from "@/lib/db-service";
import { withApiAuth } from "@/lib/api-guard";

type RouteContext = {
  params: Promise<{ id: string }>;
};

export async function DELETE(_request: Request, context: RouteContext) {
  return withApiAuth(async (session) => {
    const { id } = await context.params;
    await softDelete(session, "account", id);
    return NextResponse.json({ ok: true });
  });
}
