import { NextResponse } from "next/server";
import { withApiAuth } from "@/lib/api-guard";
import { createWorkspaceOption } from "@/lib/db-service";

export async function POST(request: Request) {
  return withApiAuth(async (session) => {
    const { kind, value, label } = (await request.json()) as {
      kind: string; value: string; label: string;
    };
    if (!kind?.trim() || !value?.trim() || !label?.trim()) {
      return NextResponse.json({ error: "kind, value e label são obrigatórios." }, { status: 400 });
    }
    await createWorkspaceOption(session, kind.trim(), value.trim().toUpperCase().replaceAll(" ", "_"), label.trim());
    return NextResponse.json({ ok: true });
  });
}
