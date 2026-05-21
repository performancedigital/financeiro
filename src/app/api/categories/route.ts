import { NextResponse } from "next/server";
import { withApiAuth } from "@/lib/api-guard";
import { createCategory } from "@/lib/db-service";

export async function POST(request: Request) {
  return withApiAuth(async (session) => {
    const { name, isIncome } = (await request.json()) as { name: string; isIncome: boolean };
    if (!name?.trim()) return NextResponse.json({ error: "Nome obrigatório." }, { status: 400 });
    await createCategory(session, name, Boolean(isIncome));
    return NextResponse.json({ ok: true });
  });
}
