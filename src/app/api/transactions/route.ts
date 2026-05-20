import { NextResponse } from "next/server";
import { createTransaction } from "@/lib/db-service";
import { transactionSchema } from "@/lib/validators";
import { withApiAuth } from "@/lib/api-guard";

export async function POST(request: Request) {
  return withApiAuth(async (session) => {
    const payload = await request.json();
    const parsed = transactionSchema.safeParse(payload);
    if (!parsed.success) {
      return NextResponse.json({ error: parsed.error.issues[0]?.message ?? "Dados invalidos." }, { status: 400 });
    }
    const result = await createTransaction(session, parsed.data);
    return NextResponse.json(result);
  });
}
