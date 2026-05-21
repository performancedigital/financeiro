import { NextResponse } from "next/server";
import { requireApiSession, type SessionPayload } from "@/lib/auth";

export const withApiAuth = async <T>(
  handler: (session: SessionPayload) => Promise<T>,
) => {
  try {
    const session = await requireApiSession();
    return await handler(session);
  } catch (error) {
    if (error instanceof Error && error.message === "UNAUTHORIZED") {
      return NextResponse.json({ error: "Sessao expirada. Faca login novamente." }, { status: 401 });
    }
    const detail = error instanceof Error ? error.message : String(error);
    console.error("[API Error]", detail);
    return NextResponse.json({ error: "Erro interno.", detail }, { status: 500 });
  }
};
