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
      return NextResponse.json({ error: "Nao autorizado." }, { status: 401 });
    }
    return NextResponse.json({ error: "Erro interno.", detail: String(error) }, { status: 500 });
  }
};
