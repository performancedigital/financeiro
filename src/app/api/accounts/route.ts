import { NextResponse } from "next/server";
import { createAccount } from "@/lib/db-service";
import { accountSchema } from "@/lib/validators";

export async function POST(request: Request) {
  try {
    const payload = await request.json();
    const parsed = accountSchema.safeParse(payload);
    if (!parsed.success) {
      return NextResponse.json({ error: parsed.error.issues[0]?.message ?? "Dados invalidos." }, { status: 400 });
    }
    await createAccount(parsed.data);
    return NextResponse.json({ ok: true });
  } catch (error) {
    return NextResponse.json({ error: "Falha ao criar conta.", detail: String(error) }, { status: 500 });
  }
}
