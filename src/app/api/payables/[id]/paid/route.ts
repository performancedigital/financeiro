import { NextResponse } from "next/server";
import { markPayablePaid } from "@/lib/db-service";

type RouteContext = {
  params: Promise<{ id: string }>;
};

export async function PATCH(_request: Request, context: RouteContext) {
  try {
    const { id } = await context.params;
    await markPayablePaid(id);
    return NextResponse.json({ ok: true });
  } catch (error) {
    return NextResponse.json({ error: "Falha ao marcar pagamento como pago.", detail: String(error) }, { status: 500 });
  }
}
