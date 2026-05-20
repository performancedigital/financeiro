import { NextResponse } from "next/server";
import { createReceivable } from "@/lib/db-service";
import { receivableSchema } from "@/lib/validators";
import { withApiAuth } from "@/lib/api-guard";

export async function POST(request: Request) {
  return withApiAuth(async (session) => {
    const payload = await request.json();
    const parsed = receivableSchema.safeParse(payload);
    if (!parsed.success) {
      return NextResponse.json({ error: parsed.error.issues[0]?.message ?? "Dados invalidos." }, { status: 400 });
    }
    await createReceivable(session, parsed.data);
    return NextResponse.json({ ok: true });
  });
}
