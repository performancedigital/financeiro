import { NextResponse } from "next/server";
import { createPayable } from "@/lib/db-service";
import { payableSchema } from "@/lib/validators";

export async function POST(request: Request) {
  try {
    const payload = await request.json();
    const parsed = payableSchema.safeParse(payload);
    if (!parsed.success) {
      return NextResponse.json({ error: parsed.error.issues[0]?.message ?? "Dados invalidos." }, { status: 400 });
    }
    await createPayable(parsed.data);
    return NextResponse.json({ ok: true });
  } catch (error) {
    return NextResponse.json({ error: "Falha ao criar pagamento.", detail: String(error) }, { status: 500 });
  }
}
