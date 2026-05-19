import { NextResponse } from "next/server";
import { createClient } from "@/lib/db-service";
import { clientSchema } from "@/lib/validators";

export async function POST(request: Request) {
  try {
    const payload = await request.json();
    const parsed = clientSchema.safeParse(payload);
    if (!parsed.success) {
      return NextResponse.json({ error: parsed.error.issues[0]?.message ?? "Dados invalidos." }, { status: 400 });
    }
    await createClient(parsed.data);
    return NextResponse.json({ ok: true });
  } catch (error) {
    return NextResponse.json({ error: "Falha ao criar cliente.", detail: String(error) }, { status: 500 });
  }
}
