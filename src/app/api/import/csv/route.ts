import Papa from "papaparse";
import { NextResponse } from "next/server";
import type { DbSnapshot } from "@/lib/db-types";
import { getSnapshot, replaceSnapshot } from "@/lib/db-service";
import { withApiAuth } from "@/lib/api-guard";

type CsvKind = "accounts" | "transactions" | "clients" | "contracts" | "receivables" | "payables";

const parseCsv = (raw: string) => {
  const parsed = Papa.parse<Record<string, string>>(raw, {
    header: true,
    skipEmptyLines: true,
    transformHeader: (h) => h.trim(),
  });
  if (parsed.errors.length) {
    throw new Error(parsed.errors[0]?.message ?? "CSV invalido.");
  }
  return parsed.data;
};

const buildSnapshotFromCsv = (
  kind: CsvKind,
  rows: Record<string, string>[],
  base: DbSnapshot,
): DbSnapshot => {
  const snapshot: DbSnapshot = {
    accounts: [...base.accounts],
    transactions: [...base.transactions],
    clients: [...base.clients],
    contracts: [...base.contracts],
    receivables: [...base.receivables],
    payables: [...base.payables],
    categories: [...(base.categories ?? [])],
    costCenters: [...(base.costCenters ?? [])],
  };

  switch (kind) {
    case "accounts":
      snapshot.accounts.push(
        ...rows.map((r) => ({
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
        ...rows.map((r) => ({
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
        ...rows.map((r) => ({
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
        ...rows.map((r) => ({
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
        ...rows.map((r) => ({
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
        ...rows.map((r) => ({
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
  return snapshot;
};

export async function POST(request: Request) {
  return withApiAuth(async (session) => {
    const body = (await request.json()) as {
      kind: CsvKind;
      csv: string;
      mode?: "preview" | "commit";
      replaceAll?: boolean;
    };

    if (!body.kind || !body.csv) {
      return NextResponse.json({ error: "Informe kind e csv." }, { status: 400 });
    }

    const rows = parseCsv(body.csv);
    const base = body.replaceAll
      ? { accounts: [], transactions: [], clients: [], contracts: [], receivables: [], payables: [], categories: [], costCenters: [] }
      : await getSnapshot(session);
    const snapshot = buildSnapshotFromCsv(body.kind, rows, base);

    if (body.mode === "preview") {
      return NextResponse.json({
        ok: true,
        mode: "preview",
        rows: rows.length,
        totals: {
          accounts: snapshot.accounts.length,
          transactions: snapshot.transactions.length,
          clients: snapshot.clients.length,
          contracts: snapshot.contracts.length,
          receivables: snapshot.receivables.length,
          payables: snapshot.payables.length,
        },
        sample: rows.slice(0, 5),
      });
    }

    await replaceSnapshot(session, snapshot);
    return NextResponse.json({ ok: true, mode: "commit", importedRows: rows.length });
  });
}
