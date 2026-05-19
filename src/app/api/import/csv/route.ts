import { NextResponse } from "next/server";
import type { DbSnapshot } from "@/lib/db-types";
import { replaceSnapshot } from "@/lib/db-service";

type CsvKind = "accounts" | "transactions" | "clients" | "contracts" | "receivables" | "payables";

const parseCsv = (raw: string) => {
  const lines = raw
    .split(/\r?\n/)
    .map((line) => line.trim())
    .filter(Boolean);
  if (!lines.length) return { headers: [], rows: [] as string[][] };
  const headers = lines[0].split(",").map((x) => x.trim());
  const rows = lines.slice(1).map((line) => line.split(",").map((x) => x.trim()));
  return { headers, rows };
};

const mapRows = (headers: string[], rows: string[][]) =>
  rows.map((cols) => {
    const out: Record<string, string> = {};
    headers.forEach((h, i) => {
      out[h] = cols[i] ?? "";
    });
    return out;
  });

export async function POST(request: Request) {
  try {
    const body = (await request.json()) as {
      kind: CsvKind;
      csv: string;
      replaceAll?: boolean;
      currentSnapshot?: DbSnapshot;
    };

    if (!body.kind || !body.csv) {
      return NextResponse.json({ error: "Informe kind e csv." }, { status: 400 });
    }

    const parsed = parseCsv(body.csv);
    const mapped = mapRows(parsed.headers, parsed.rows);

    const base: DbSnapshot =
      body.replaceAll || !body.currentSnapshot
        ? { accounts: [], transactions: [], clients: [], contracts: [], receivables: [], payables: [] }
        : body.currentSnapshot;

    const snapshot: DbSnapshot = {
      accounts: [...base.accounts],
      transactions: [...base.transactions],
      clients: [...base.clients],
      contracts: [...base.contracts],
      receivables: [...base.receivables],
      payables: [...base.payables],
    };

    switch (body.kind) {
      case "accounts":
        snapshot.accounts.push(
          ...mapped.map((r) => ({
            id: r.id,
            name: r.name,
            type: r.type as DbSnapshot["accounts"][number]["type"],
            institution: r.institution as DbSnapshot["accounts"][number]["institution"],
            balance: Number(r.balance || 0),
          })),
        );
        break;
      case "transactions":
        snapshot.transactions.push(
          ...mapped.map((r) => ({
            id: r.id,
            date: r.date,
            direction: r.direction as DbSnapshot["transactions"][number]["direction"],
            description: r.description,
            amount: Number(r.amount || 0),
            accountId: r.accountId,
            category: r.category,
            costCenter: r.costCenter,
            clientId: r.clientId || undefined,
            duplicateHash: r.duplicateHash || "",
          })),
        );
        break;
      case "clients":
        snapshot.clients.push(
          ...mapped.map((r) => ({
            id: r.id,
            name: r.name,
            status: r.status as DbSnapshot["clients"][number]["status"],
            monthlyValue: Number(r.monthlyValue || 0),
            startDate: r.startDate,
          })),
        );
        break;
      case "contracts":
        snapshot.contracts.push(
          ...mapped.map((r) => ({
            id: r.id,
            clientId: r.clientId,
            title: r.title,
            monthlyValue: Number(r.monthlyValue || 0),
            startsAt: r.startsAt,
            dueDay: Number(r.dueDay || 10),
            services: r.services,
          })),
        );
        break;
      case "receivables":
        snapshot.receivables.push(
          ...mapped.map((r) => ({
            id: r.id,
            clientId: r.clientId,
            competency: r.competency,
            expectedAmount: Number(r.expectedAmount || 0),
            receivedAmount: Number(r.receivedAmount || 0),
            expectedDate: r.expectedDate,
            receivedDate: r.receivedDate || undefined,
            status: r.status as DbSnapshot["receivables"][number]["status"],
            accountId: r.accountId || undefined,
            notes: r.notes || undefined,
          })),
        );
        break;
      case "payables":
        snapshot.payables.push(
          ...mapped.map((r) => ({
            id: r.id,
            description: r.description,
            provider: r.provider || undefined,
            category: r.category,
            costCenter: r.costCenter,
            amount: Number(r.amount || 0),
            dueDate: r.dueDate,
            status: r.status as DbSnapshot["payables"][number]["status"],
            type: r.type as DbSnapshot["payables"][number]["type"],
            accountId: r.accountId || undefined,
            notes: r.notes || undefined,
          })),
        );
        break;
    }

    await replaceSnapshot(snapshot);
    return NextResponse.json({ ok: true, importedRows: mapped.length });
  } catch (error) {
    return NextResponse.json(
      { error: "Falha ao importar CSV.", detail: String(error) },
      { status: 500 },
    );
  }
}
