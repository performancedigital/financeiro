import Papa from "papaparse";
import { NextResponse } from "next/server";
import { withApiAuth } from "@/lib/api-guard";
import { smartImportTransactions } from "@/lib/db-service";

export async function POST(request: Request) {
  return withApiAuth(async (session) => {
    const { csv } = (await request.json()) as { csv: string };
    if (!csv?.trim()) return NextResponse.json({ error: "CSV vazio." }, { status: 400 });
    const parsed = Papa.parse<Record<string, string>>(csv, { header: true, skipEmptyLines: true });
    const rows = parsed.data.map((r) => ({
      date: r.data ?? r.date ?? r.DATA ?? r.Date ?? "",
      direction: (r.tipo ?? r.direction ?? r.TIPO ?? r.Tipo ?? "EXPENSE").toUpperCase() === "ENTRADA" ? "INCOME" : (r.tipo ?? r.direction ?? "EXPENSE").toUpperCase() === "INCOME" ? "INCOME" : "EXPENSE",
      description: r.descricao ?? r.description ?? r.DESCRICAO ?? r.Descricao ?? "",
      amount: Math.abs(Number((r.valor ?? r.amount ?? r.VALOR ?? "0").toString().replace(",", "."))),
      accountName: r.conta ?? r.account ?? r.CONTA ?? r.Conta ?? "",
      category: r.categoria ?? r.category ?? r.CATEGORIA ?? r.Categoria ?? "Outros",
      costCenter: r.centro_custo ?? r.costCenter ?? r.centro ?? "Geral",
      clientName: r.cliente ?? r.client ?? r.CLIENTE ?? r.Cliente ?? undefined,
    })).filter((r) => r.date && r.amount > 0);

    const result = await smartImportTransactions(session, rows);
    return NextResponse.json(result);
  });
}
