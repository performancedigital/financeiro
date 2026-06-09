import { NextResponse } from "next/server";
import { replaceSnapshot } from "@/lib/db-service";
import { withApiAuth } from "@/lib/api-guard";

export async function POST() {
  return withApiAuth(async (session) => {
    await replaceSnapshot(session, {
      accounts: [],
      transactions: [],
      clients: [],
      contracts: [],
      receivables: [],
      payables: [],
      categories: [],
      costCenters: [],
      workspaceOptions: [],
      debts: [],
      documents: [],
      investments: [],
      goals: [],
      budgets: [],
    });
    return NextResponse.json({ ok: true });
  });
}
