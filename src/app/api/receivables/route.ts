import { NextResponse } from "next/server";
import { createReceivable } from "@/lib/db-service";
import { receivableSchema } from "@/lib/validators";

export async function POST(request: Request) {
  try {
    const payload = await request.json();
    const parsed = receivableSchema.safeParse(payload);
    if (!parsed.success) {
      return NextResponse.json({ error: parsed.error.issues[0]?.message ?? "Dados invalidos." }, { status: 400 });
    }
    await createReceivable(parsed.data);
    return NextResponse.json({ ok: true });
  } catch (error) {
    return NextResponse.json({ error: "Falha ao criar recebivel.", detail: String(error) }, { status: 500 });
  }
}
