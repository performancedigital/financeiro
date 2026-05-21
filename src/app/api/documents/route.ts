import { NextResponse } from "next/server";
import { withApiAuth } from "@/lib/api-guard";
import { createDocument } from "@/lib/db-service";
import { documentSchema } from "@/lib/validators";
export async function POST(request: Request) {
  return withApiAuth(async (session) => {
    const parsed = documentSchema.safeParse(await request.json());
    if (!parsed.success) return NextResponse.json({ error: parsed.error.issues[0]?.message }, { status: 400 });
    await createDocument(session, parsed.data);
    return NextResponse.json({ ok: true });
  });
}
