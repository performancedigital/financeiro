"use client";

import type { AppModule } from "@/lib/navigation";
import { useAppStore } from "@/lib/use-app-store";
import {
  AccountsModule,
  ClientsModule,
  PayablesModule,
  ReceivablesModule,
} from "@/components/modules/operations-modules";

const money = (v: number) =>
  new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" }).format(v);

function DashboardModule() {
  const { store, ensureLoaded } = useAppStore();
  ensureLoaded();
  if (!store) return <article className="cc-card p-4 text-sm text-zinc-600">Carregando dashboard...</article>;

  const accounts = store.accounts;
  const transactions = store.transactions;
  const receivables = store.receivables;
  const payables = store.payables;
  const clients = store.clients;

  const income = transactions
    .filter((t) => t.direction === "INCOME")
    .reduce((acc, t) => acc + t.amount, 0);
  const expense = transactions
    .filter((t) => t.direction === "EXPENSE")
    .reduce((acc, t) => acc + t.amount, 0);
  const consolidated = accounts.reduce((acc, a) => acc + a.balance, 0) + income - expense;
  const receivableMonth = receivables.reduce((acc, r) => acc + r.expectedAmount, 0);
  const payableMonth = payables.reduce((acc, p) => acc + p.amount, 0);
  const clientsPaid = receivables.filter((r) => r.status === "PAID").length;
  const clientsPending = receivables.filter((r) => r.status !== "PAID").length;
  const delinquencyRate = receivables.length
    ? (receivables.filter((r) => r.status === "OVERDUE").length / receivables.length) * 100
    : 0;

  const cards = [
    { label: "Saldo consolidado", value: money(consolidated), tone: "text-emerald-700" },
    { label: "Contas cadastradas", value: String(accounts.length), tone: "text-zinc-800" },
    { label: "Clientes ativos", value: String(clients.length), tone: "text-blue-700" },
    { label: "Receber no mes", value: money(receivableMonth), tone: "text-blue-700" },
    { label: "Pagar no mes", value: money(payableMonth), tone: "text-amber-700" },
    { label: "Entradas", value: money(income), tone: "text-emerald-700" },
    { label: "Saidas", value: money(expense), tone: "text-red-700" },
    { label: "Clientes pagos", value: String(clientsPaid), tone: "text-emerald-700" },
    { label: "Clientes pendentes", value: String(clientsPending), tone: "text-amber-700" },
    { label: "Inadimplencia", value: `${delinquencyRate.toFixed(1)}%`, tone: "text-red-700" },
  ];

  const alerts = [
    receivables.some((r) => r.status === "OVERDUE")
      ? "Ha recebiveis atrasados. Priorize cobranca hoje."
      : "Sem recebiveis atrasados neste momento.",
    payableMonth > consolidated + receivableMonth
      ? "Risco de caixa: pagar > saldo + receber."
      : "Caixa sob controle no cenario atual.",
    payables.some((p) => p.status !== "PAID")
      ? "Existem pagamentos em aberto para acompanhar."
      : "Todos os pagamentos registrados estao quitados.",
  ];

  return (
    <section className="space-y-4">
      <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
        {cards.map((item) => (
          <article key={item.label} className="cc-card p-4">
            <p className="text-xs font-semibold uppercase tracking-wide text-zinc-500">{item.label}</p>
            <p className={`mt-2 text-xl font-bold ${item.tone}`}>{item.value}</p>
          </article>
        ))}
      </div>
      <article className="cc-card p-4">
        <h2 className="text-base font-semibold text-zinc-900">Alertas baseados nos seus dados</h2>
        <ul className="mt-2 list-disc space-y-1 pl-5 text-sm text-zinc-700">
          {alerts.map((alert) => (
            <li key={alert}>{alert}</li>
          ))}
        </ul>
      </article>
    </section>
  );
}

function EmptyModule({ module }: { module: AppModule }) {
  return (
    <section className="space-y-4">
      <article className="cc-card p-4">
        <h2 className="text-base font-semibold text-zinc-900">{module.label}</h2>
        <p className="mt-1 text-sm text-zinc-600">{module.description}</p>
      </article>
      <article className="cc-card p-4 text-sm text-zinc-600">
        Este modulo ainda nao foi convertido para dados dinamicos. Posso priorizar ele na sequencia.
      </article>
    </section>
  );
}

export function ModulesView({ module }: { module: AppModule }) {
  if (module.key === "dashboard") return <DashboardModule />;
  if (module.key === "contas") return <AccountsModule />;
  if (module.key === "clientes") return <ClientsModule />;
  if (module.key === "receber") return <ReceivablesModule />;
  if (module.key === "pagar") return <PayablesModule />;
  return <EmptyModule module={module} />;
}
