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
  investments: [],
  goals: [],
  budgets: [],
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

test("simplifiedDre lines reconcile to the operational result", () => {
  const withOther: DbSnapshot = {
    ...snapshot,
    transactions: [
      ...snapshot.transactions,
      {
        id: "4",
        date: "2026-06-02",
        direction: "EXPENSE",
        description: "Aluguel (sem categoria detalhada)",
        amount: 250,
        accountId: "a",
        category: "Aluguel",
        costCenter: "Agencia",
        duplicateHash: "",
      },
    ],
  };
  const dre = simplifiedDre(withOther);
  // Receita - (impostos + equipe + ferramentas + proLabore + outras) deve fechar no operacional.
  const totalDeducoes = dre.impostos + dre.equipe + dre.ferramentas + dre.proLabore + dre.outras;
  assert.equal(dre.income - totalDeducoes, dre.operacional);
  assert.equal(dre.outras, 250);
});
