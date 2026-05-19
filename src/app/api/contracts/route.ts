import { NextResponse } from "next/server";
import { createContract } from "@/lib/db-service";
import { contractSchema } from "@/lib/validators";

export async function POST(request: Request) {
  try {
    const payload = await request.json();
    const parsed = contractSchema.safeParse(payload);
    if (!parsed.success) {
      return NextResponse.json({ error: parsed.error.issues[0]?.message ?? "Dados invalidos." }, { status: 400 });
    }
    await createContract(parsed.data);
    return NextResponse.json({ ok: true });
  } catch (error) {
    return NextResponse.json({ error: "Falha ao criar contrato.", detail: String(error) }, { status: 500 });
  }
}
