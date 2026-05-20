import { NextResponse } from "next/server";
import { createClient } from "@/lib/db-service";
import { clientSchema } from "@/lib/validators";
import { withApiAuth } from "@/lib/api-guard";

export async function POST(request: Request) {
  return withApiAuth(async (session) => {
    const payload = await request.json();
    const parsed = clientSchema.safeParse(payload);
    if (!parsed.success) {
      return NextResponse.json({ error: parsed.error.issues[0]?.message ?? "Dados invalidos." }, { status: 400 });
    }
    await createClient(session, parsed.data);
    return NextResponse.json({ ok: true });
  });
}
