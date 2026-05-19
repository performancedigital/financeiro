import { NextResponse } from "next/server";
import { createTransaction } from "@/lib/db-service";
import { transactionSchema } from "@/lib/validators";

export async function POST(request: Request) {
  try {
    const payload = await request.json();
    const parsed = transactionSchema.safeParse(payload);
    if (!parsed.success) {
      return NextResponse.json({ error: parsed.error.issues[0]?.message ?? "Dados invalidos." }, { status: 400 });
    }
    const result = await createTransaction(parsed.data);
    return NextResponse.json(result);
  } catch (error) {
    return NextResponse.json({ error: "Falha ao criar transacao.", detail: String(error) }, { status: 500 });
  }
}
