import { NextResponse } from "next/server";
import { withApiAuth } from "@/lib/api-guard";
import { createBudget } from "@/lib/db-service";
import { budgetSchema } from "@/lib/validators";

export async function POST(request: Request) {
  return withApiAuth(async (session) => {
    const parsed = budgetSchema.safeParse(await request.json());
    if (!parsed.success) return NextResponse.json({ error: parsed.error.issues[0]?.message }, { status: 400 });
    await createBudget(session, parsed.data);
    return NextResponse.json({ ok: true });
  });
}
