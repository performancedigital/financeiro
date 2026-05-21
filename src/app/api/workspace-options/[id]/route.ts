import { NextResponse } from "next/server";
import { withApiAuth } from "@/lib/api-guard";
import { deleteWorkspaceOption } from "@/lib/db-service";

type Ctx = { params: Promise<{ id: string }> };

export async function DELETE(_req: Request, ctx: Ctx) {
  return withApiAuth(async (session) => {
    const { id } = await ctx.params;
    await deleteWorkspaceOption(session, id);
    return NextResponse.json({ ok: true });
  });
}
