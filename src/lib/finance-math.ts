import type { DbSnapshot } from "@/lib/db-types";

export const sumIncome = (snapshot: DbSnapshot) =>
  snapshot.transactions
    .filter((t) => t.direction === "INCOME")
    .reduce((acc, t) => acc + t.amount, 0);

export const sumExpense = (snapshot: DbSnapshot) =>
  snapshot.transactions
    .filter((t) => t.direction === "EXPENSE")
    .reduce((acc, t) => acc + t.amount, 0);

export const monthlyCashflow = (snapshot: DbSnapshot) => {
  const grouped = new Map<string, { income: number; expense: number }>();
  for (const tx of snapshot.transactions) {
    const month = tx.date.slice(0, 7);
    const current = grouped.get(month) ?? { income: 0, expense: 0 };
    if (tx.direction === "INCOME") current.income += tx.amount;
    else current.expense += tx.amount;
    grouped.set(month, current);
  }
  return [...grouped.entries()]
    .map(([month, values]) => ({
      month,
      income: values.income,
      expense: values.expense,
      result: values.income - values.expense,
    }))
    .sort((a, b) => a.month.localeCompare(b.month));
};

export const simplifiedDre = (snapshot: DbSnapshot) => {
  const income = sumIncome(snapshot);
  const expense = sumExpense(snapshot);
  const impostos = snapshot.transactions
    .filter((t) => t.direction === "EXPENSE" && t.category.toLowerCase().includes("imposto"))
    .reduce((acc, t) => acc + t.amount, 0);
  const proLabore = snapshot.transactions
    .filter((t) => t.direction === "EXPENSE" && t.category.toLowerCase().includes("pro"))
    .reduce((acc, t) => acc + t.amount, 0);
  const equipe = snapshot.transactions
    .filter((t) => t.direction === "EXPENSE" && t.category.toLowerCase().includes("equipe"))
    .reduce((acc, t) => acc + t.amount, 0);
  const ferramentas = snapshot.transactions
    .filter((t) => t.direction === "EXPENSE" && t.category.toLowerCase().includes("ferrament"))
    .reduce((acc, t) => acc + t.amount, 0);

  // Despesas que não se enquadram nas categorias detalhadas acima.
  // Garante que as linhas do demonstrativo somem exatamente até o resultado operacional.
  const outras = Math.max(0, expense - impostos - equipe - ferramentas - proLabore);

  const operacional = income - expense;
  const margem = income > 0 ? (operacional / income) * 100 : 0;

  return { income, expense, impostos, proLabore, equipe, ferramentas, outras, operacional, margem };
};
