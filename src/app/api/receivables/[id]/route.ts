import { NextResponse } from "next/server";
import { softDelete } from "@/lib/db-service";

type RouteContext = {
  params: Promise<{ id: string }>;
};

export async function DELETE(_request: Request, context: RouteContext) {
  try {
    const { id } = await context.params;
    await softDelete("receivable", id);
    return NextResponse.json({ ok: true });
  } catch (error) {
    return NextResponse.json({ error: "Falha ao excluir recebivel.", detail: String(error) }, { status: 500 });
  }
}
