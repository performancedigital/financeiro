import { NextResponse } from "next/server";
import { createContract } from "@/lib/db-service";
import { contractSchema } from "@/lib/validators";
import { withApiAuth } from "@/lib/api-guard";

export async function POST(request: Request) {
  return withApiAuth(async (session) => {
    const payload = await request.json();
    const parsed = contractSchema.safeParse(payload);
    if (!parsed.success) {
      return NextResponse.json({ error: parsed.error.issues[0]?.message ?? "Dados invalidos." }, { status: 400 });
    }
    await createContract(session, parsed.data);
    return NextResponse.json({ ok: true });
  });
}
