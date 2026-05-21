import test from "node:test";
import assert from "node:assert/strict";
import { monthlyCashflow, simplifiedDre } from "./finance-math";
import type { DbSnapshot } from "./db-types";

const snapshot: DbSnapshot = {
  accounts: [],
  clients: [],
  contracts: [],
  receivables: [],
  payables: [],
  categories: [],
  costCenters: [],
  workspaceOptions: [],
  debts: [],
  documents: [],
  transactions: [
    {
      id: "1",
      date: "2026-05-01",
      direction: "INCOME",
      description: "Receita",
      amount: 1000,
      accountId: "a",
      category: "Receita de cliente",
      costCenter: "Agencia",
      duplicateHash: "",
    },
    {
      id: "2",
      date: "2026-05-02",
      direction: "EXPENSE",
      description: "Equipe",
      amount: 300,
      accountId: "a",
      category: "Equipe",
      costCenter: "Agencia",
      duplicateHash: "",
    },
    {
      id: "3",
      date: "2026-06-01",
      direction: "EXPENSE",
      description: "Imposto",
      amount: 100,
      accountId: "a",
      category: "Imposto",
      costCenter: "Agencia",
      duplicateHash: "",
    },
  ],
};

test("monthlyCashflow groups by month", () => {
  const result = monthlyCashflow(snapshot);
  assert.equal(result.length, 2);
  assert.equal(result[0]?.month, "2026-05");
  assert.equal(result[0]?.income, 1000);
  assert.equal(result[0]?.expense, 300);
});

test("simplifiedDre calculates operational margin", () => {
  const dre = simplifiedDre(snapshot);
  assert.equal(dre.income, 1000);
  assert.equal(dre.equipe, 300);
  assert.equal(dre.impostos, 100);
  assert.equal(dre.operacional, 600);
  assert.equal(Number(dre.margem.toFixed(2)), 60);
});
