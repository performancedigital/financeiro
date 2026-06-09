import { NextResponse } from "next/server";
import { withApiAuth } from "@/lib/api-guard";
import { createGoal } from "@/lib/db-service";
import { goalSchema } from "@/lib/validators";

export async function POST(request: Request) {
  return withApiAuth(async (session) => {
    const parsed = goalSchema.safeParse(await request.json());
    if (!parsed.success) return NextResponse.json({ error: parsed.error.issues[0]?.message }, { status: 400 });
    await createGoal(session, parsed.data);
    return NextResponse.json({ ok: true });
  });
}
