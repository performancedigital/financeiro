import { NextResponse } from "next/server";
import { withApiAuth } from "@/lib/api-guard";
import { createCostCenter } from "@/lib/db-service";

export async function POST(request: Request) {
  return withApiAuth(async (session) => {
    const { name } = (await request.json()) as { name: string };
    if (!name?.trim()) return NextResponse.json({ error: "Nome obrigatório." }, { status: 400 });
    await createCostCenter(session, name);
    return NextResponse.json({ ok: true });
  });
}
