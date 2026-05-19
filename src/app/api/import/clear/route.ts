import { NextResponse } from "next/server";
import { replaceSnapshot } from "@/lib/db-service";

export async function POST() {
  try {
    await replaceSnapshot({
      accounts: [],
      transactions: [],
      clients: [],
      contracts: [],
      receivables: [],
      payables: [],
    });
    return NextResponse.json({ ok: true });
  } catch (error) {
    return NextResponse.json({ error: "Falha ao limpar base.", detail: String(error) }, { status: 500 });
  }
}
