import { NextResponse } from "next/server";
import { softDelete, updateContract } from "@/lib/db-service";
import { withApiAuth } from "@/lib/api-guard";
import { contractSchema } from "@/lib/validators";

type RouteContext = {
  params: Promise<{ id: string }>;
};

export async function PUT(request: Request, context: RouteContext) {
  return withApiAuth(async (session) => {
    const { id } = await context.params;
    const parsed = contractSchema.safeParse(await request.json());
    if (!parsed.success) return NextResponse.json({ error: parsed.error.issues[0]?.message }, { status: 400 });
    await updateContract(session, id, parsed.data);
    return NextResponse.json({ ok: true });
  });
}

export async function DELETE(_request: Request, context: RouteContext) {
  return withApiAuth(async (session) => {
    const { id } = await context.params;
    await softDelete(session, "contract", id);
    return NextResponse.json({ ok: true });
  });
}
