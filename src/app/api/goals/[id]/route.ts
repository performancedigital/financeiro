import { NextResponse } from "next/server";
import { withApiAuth } from "@/lib/api-guard";
import { deleteGoal, updateGoal } from "@/lib/db-service";
import { goalSchema } from "@/lib/validators";

type Ctx = { params: Promise<{ id: string }> };

export async function PUT(request: Request, ctx: Ctx) {
  return withApiAuth(async (session) => {
    const { id } = await ctx.params;
    const parsed = goalSchema.safeParse(await request.json());
    if (!parsed.success) return NextResponse.json({ error: parsed.error.issues[0]?.message }, { status: 400 });
    await updateGoal(session, id, parsed.data);
    return NextResponse.json({ ok: true });
  });
}

export async function DELETE(_req: Request, ctx: Ctx) {
  return withApiAuth(async (session) => {
    const { id } = await ctx.params;
    await deleteGoal(session, id);
    return NextResponse.json({ ok: true });
  });
}
