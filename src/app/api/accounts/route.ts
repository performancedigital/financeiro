import { NextResponse } from "next/server";
import { createAccount } from "@/lib/db-service";
import { accountSchema } from "@/lib/validators";
import { withApiAuth } from "@/lib/api-guard";

export async function POST(request: Request) {
  return withApiAuth(async (session) => {
    const payload = await request.json();
    const parsed = accountSchema.safeParse(payload);
    if (!parsed.success) {
      return NextResponse.json({ error: parsed.error.issues[0]?.message ?? "Dados invalidos." }, { status: 400 });
    }
    await createAccount(session, parsed.data);
    return NextResponse.json({ ok: true });
  });
}
