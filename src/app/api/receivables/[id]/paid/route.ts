import { NextResponse } from "next/server";
import { markReceivablePaid } from "@/lib/db-service";

type RouteContext = {
  params: Promise<{ id: string }>;
};

export async function PATCH(_request: Request, context: RouteContext) {
  try {
    const { id } = await context.params;
    await markReceivablePaid(id);
    return NextResponse.json({ ok: true });
  } catch (error) {
    return NextResponse.json({ error: "Falha ao marcar recebivel como pago.", detail: String(error) }, { status: 500 });
  }
}
