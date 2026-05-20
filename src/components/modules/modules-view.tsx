"use client";

import { useState } from "react";
import type { AppModule } from "@/lib/navigation";
import { useAppStore } from "@/lib/use-app-store";
import {
  AccountsModule,
  ClientsModule,
  PayablesModule,
  ReceivablesModule,
} from "@/components/modules/operations-modules";
import { monthlyCashflow, simplifiedDre } from "@/lib/finance-math";

const money = (v: number) =>
  new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" }).format(v);

function DashboardModule() {
  const { store, loading, error } = useAppStore();
  if (!store) return <article className="cc-card p-4 text-sm text-zinc-600">{loading ? "Carregando dashboard..." : "Sem dados para dashboard."}</article>;

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
      {error ? <p className="rounded-lg bg-red-50 px-3 py-2 text-sm text-red-700">{error.message}</p> : null}
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

function CashflowModule() {
  const { store, loading } = useAppStore();
  if (!store) return <article className="cc-card p-4 text-sm text-zinc-600">{loading ? "Carregando fluxo..." : "Sem dados para fluxo."}</article>;

  const rows = monthlyCashflow(store);

  return (
    <section className="space-y-4">
      <article className="cc-card p-4">
        <h2 className="text-base font-semibold text-zinc-900">Fluxo de Caixa (mensal)</h2>
        <p className="mt-1 text-sm text-zinc-600">Previsto e realizado por mês (baseado nas transações atuais).</p>
      </article>
      <article className="cc-card p-4">
        <div className="overflow-x-auto">
          <table className="min-w-full text-sm">
            <thead>
              <tr className="bg-zinc-50">
                <th className="px-3 py-2 text-left">Mês</th>
                <th className="px-3 py-2 text-left">Entradas</th>
                <th className="px-3 py-2 text-left">Saídas</th>
                <th className="px-3 py-2 text-left">Resultado</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-100">
              {rows.length ? rows.map((r) => (
                <tr key={r.month}>
                  <td className="px-3 py-2">{r.month}</td>
                  <td className="px-3 py-2">{money(r.income)}</td>
                  <td className="px-3 py-2">{money(r.expense)}</td>
                  <td className={`px-3 py-2 font-semibold ${r.result >= 0 ? "text-emerald-700" : "text-red-700"}`}>
                    {money(r.result)}
                  </td>
                </tr>
              )) : (
                <tr><td className="px-3 py-4 text-zinc-500" colSpan={4}>Sem transações para calcular fluxo.</td></tr>
              )}
            </tbody>
          </table>
        </div>
      </article>
    </section>
  );
}

function DreModule() {
  const { store, loading } = useAppStore();
  if (!store) return <article className="cc-card p-4 text-sm text-zinc-600">{loading ? "Carregando DRE..." : "Sem dados para DRE."}</article>;

  const { income, impostos, equipe, ferramentas, proLabore, operacional, margem } = simplifiedDre(store);

  return (
    <section className="space-y-4">
      <article className="cc-card p-4">
        <h2 className="text-base font-semibold text-zinc-900">DRE Simplificada</h2>
        <p className="mt-1 text-sm text-zinc-600">Resultado calculado com base nas categorias lançadas.</p>
      </article>
      <article className="cc-card p-4">
        <div className="space-y-2 text-sm">
          <div className="flex justify-between"><span>Receita bruta</span><strong>{money(income)}</strong></div>
          <div className="flex justify-between"><span>(-) Impostos</span><strong>{money(impostos)}</strong></div>
          <div className="flex justify-between"><span>(-) Equipe</span><strong>{money(equipe)}</strong></div>
          <div className="flex justify-between"><span>(-) Ferramentas</span><strong>{money(ferramentas)}</strong></div>
          <div className="flex justify-between"><span>(-) Pró-labore</span><strong>{money(proLabore)}</strong></div>
          <hr className="border-zinc-200" />
          <div className="flex justify-between text-base">
            <span>Resultado operacional</span>
            <strong className={operacional >= 0 ? "text-emerald-700" : "text-red-700"}>{money(operacional)}</strong>
          </div>
          <div className="flex justify-between text-zinc-600">
            <span>Margem operacional</span>
            <span>{margem.toFixed(1)}%</span>
          </div>
        </div>
      </article>
    </section>
  );
}

function ImportModule() {
  const { importCsvPreview, importCsvCommit, clearAllData } = useAppStore();
  const [kind, setKind] = useState<AppModule["key"] | "accounts" | "transactions" | "clients" | "contracts" | "receivables" | "payables">("transactions");
  const [csv, setCsv] = useState("");
  const [replaceAll, setReplaceAll] = useState(false);
  const [message, setMessage] = useState<string>("");
  const [preview, setPreview] = useState<{ rows: number; totals: Record<string, number>; sample: Array<Record<string, string>> } | null>(null);

  const doPreview = async () => {
    try {
      const p = await importCsvPreview({ kind: kind as string, csv, replaceAll });
      setPreview({ rows: p.rows, totals: p.totals, sample: p.sample });
      setMessage("Preview gerado com sucesso.");
    } catch (e) {
      setMessage((e as { message?: string }).message ?? "Falha no preview.");
    }
  };
  const doCommit = async () => {
    try {
      const r = await importCsvCommit({ kind: kind as string, csv, replaceAll });
      setMessage(`Importação concluída: ${r.importedRows} linhas.`);
      setPreview(null);
    } catch (e) {
      setMessage((e as { message?: string }).message ?? "Falha na importação.");
    }
  };
  const doClear = async () => {
    try {
      await clearAllData();
      setMessage("Base limpa com sucesso.");
      setPreview(null);
    } catch (e) {
      setMessage((e as { message?: string }).message ?? "Falha ao limpar.");
    }
  };

  return (
    <section className="space-y-4">
      <article className="cc-card p-4">
        <h2 className="text-base font-semibold text-zinc-900">Importador CSV (preview + commit)</h2>
        <p className="mt-1 text-sm text-zinc-600">Cole seu CSV, gere preview e confirme a gravação.</p>
      </article>
      <article className="cc-card p-4 space-y-3">
        <div className="flex flex-wrap gap-2 items-center">
          <select value={kind} onChange={(e) => setKind(e.target.value as typeof kind)} className="rounded-lg border border-zinc-300 px-3 py-2 text-sm">
            {["accounts","transactions","clients","contracts","receivables","payables"].map((k) => <option key={k} value={k}>{k}</option>)}
          </select>
          <label className="text-sm text-zinc-700 flex items-center gap-2">
            <input type="checkbox" checked={replaceAll} onChange={(e) => setReplaceAll(e.target.checked)} />
            Substituir tudo
          </label>
        </div>
        <textarea value={csv} onChange={(e) => setCsv(e.target.value)} rows={10} className="w-full rounded-lg border border-zinc-300 p-3 text-sm font-mono" placeholder="id,name,..." />
        <div className="flex gap-2 flex-wrap">
          <button type="button" onClick={doPreview} className="rounded-lg bg-blue-600 px-3 py-2 text-sm font-semibold text-white">Gerar preview</button>
          <button type="button" onClick={doCommit} className="rounded-lg bg-emerald-600 px-3 py-2 text-sm font-semibold text-white">Confirmar importação</button>
          <button type="button" onClick={doClear} className="rounded-lg bg-red-600 px-3 py-2 text-sm font-semibold text-white">Limpar base</button>
        </div>
        {message ? <p className="text-sm text-zinc-700">{message}</p> : null}
      </article>
      {preview ? (
        <article className="cc-card p-4">
          <h3 className="text-sm font-semibold text-zinc-900">Preview</h3>
          <p className="mt-1 text-sm text-zinc-600">Linhas: {preview.rows}</p>
          <pre className="mt-2 overflow-auto rounded bg-zinc-100 p-2 text-xs">{JSON.stringify(preview.totals, null, 2)}</pre>
        </article>
      ) : null}
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
  if (module.key === "fluxo") return <CashflowModule />;
  if (module.key === "dre") return <DreModule />;
  if (module.key === "relatorios") return <ImportModule />;
  return <EmptyModule module={module} />;
}
