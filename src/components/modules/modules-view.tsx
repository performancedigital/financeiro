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
import { SettingsModule } from "@/components/modules/settings-module";
import { monthlyCashflow, simplifiedDre } from "@/lib/finance-math";

const money = (v: number) =>
  new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" }).format(v);

const pct = (v: number) => `${v.toFixed(1)}%`;

function KpiCard({ label, value, color = "zinc" }: { label: string; value: string; color?: string }) {
  const colors: Record<string, string> = {
    zinc: "text-zinc-900",
    blue: "text-blue-700",
    green: "text-emerald-700",
    red: "text-red-700",
    amber: "text-amber-700",
  };
  return (
    <article className="cc-card p-5">
      <p className="text-xs font-semibold uppercase tracking-wide text-zinc-500">{label}</p>
      <p className={`mt-2 text-2xl font-bold ${colors[color] ?? colors.zinc}`}>{value}</p>
    </article>
  );
}

function AlertBanner({ type, message }: { type: "warning" | "danger" | "ok"; message: string }) {
  const cls =
    type === "danger"
      ? "bg-red-50 border-red-200 text-red-800"
      : type === "warning"
      ? "bg-amber-50 border-amber-200 text-amber-800"
      : "bg-emerald-50 border-emerald-200 text-emerald-800";
  const icon =
    type === "ok"
      ? "M5 13l4 4L19 7"
      : "M12 9v2m0 4h.01M10.29 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0z";
  return (
    <div className={`flex items-start gap-3 rounded-xl border p-3 text-sm ${cls}`}>
      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="mt-0.5 shrink-0">
        <path strokeLinecap="round" strokeLinejoin="round" d={icon} />
      </svg>
      <span>{message}</span>
    </div>
  );
}

function EmptyState({ message }: { message: string }) {
  return (
    <div className="flex flex-col items-center justify-center rounded-xl border-2 border-dashed border-zinc-300 bg-white py-16 text-center">
      <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="#a1a1aa" strokeWidth="1.5" className="mb-3">
        <path strokeLinecap="round" strokeLinejoin="round" d="M9 13h6m-3-3v6m5 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
      </svg>
      <p className="text-sm font-medium text-zinc-500">{message}</p>
      <p className="text-xs text-zinc-400 mt-1">Use o botão acima para adicionar o primeiro registro.</p>
    </div>
  );
}

/* ── DASHBOARD ── */
function DashboardModule() {
  const { store, loading, error } = useAppStore();
  if (!store) return (
    <div className="flex items-center justify-center h-64">
      <div className="text-sm text-zinc-500">{loading ? "Carregando..." : "Sem dados."}</div>
    </div>
  );

  const income = store.transactions.filter((t) => t.direction === "INCOME").reduce((a, t) => a + t.amount, 0);
  const expense = store.transactions.filter((t) => t.direction === "EXPENSE").reduce((a, t) => a + t.amount, 0);
  const consolidated = store.accounts.reduce((a, x) => a + x.balance, 0) + income - expense;
  const receivableMonth = store.receivables.reduce((a, r) => a + r.expectedAmount, 0);
  const payableMonth = store.payables.reduce((a, p) => a + p.amount, 0);
  const receivedMonth = store.receivables.filter((r) => r.status === "PAID").reduce((a, r) => a + r.receivedAmount, 0);
  const delinquencyRate = store.receivables.length
    ? (store.receivables.filter((r) => r.status === "OVERDUE").length / store.receivables.length) * 100
    : 0;

  return (
    <section className="space-y-5">
      {error ? <AlertBanner type="danger" message={error.message} /> : null}

      <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
        <KpiCard label="Saldo Consolidado" value={money(consolidated)} color="blue" />
        <KpiCard label="Entradas" value={money(income)} color="green" />
        <KpiCard label="Saídas" value={money(expense)} color="red" />
        <KpiCard label="Resultado Líquido" value={money(income - expense)} color={income - expense >= 0 ? "green" : "red"} />
        <KpiCard label="A Receber (mês)" value={money(receivableMonth)} color="blue" />
        <KpiCard label="Recebido (mês)" value={money(receivedMonth)} color="green" />
        <KpiCard label="A Pagar (mês)" value={money(payableMonth)} color="amber" />
        <KpiCard label="Inadimplência" value={pct(delinquencyRate)} color={delinquencyRate > 10 ? "red" : "green"} />
        <KpiCard label="Clientes" value={String(store.clients.length)} color="zinc" />
        <KpiCard label="Contas" value={String(store.accounts.length)} color="zinc" />
        <KpiCard label="Recebiveis" value={String(store.receivables.filter((r) => r.status !== "PAID").length) + " abertos"} color="amber" />
        <KpiCard label="Pagamentos" value={String(store.payables.filter((p) => p.status !== "PAID").length) + " abertos"} color="amber" />
      </div>

      {/* Alertas */}
      <div className="space-y-2">
        <h2 className="text-sm font-bold text-zinc-700 uppercase tracking-wide">Alertas Inteligentes</h2>
        {store.receivables.some((r) => r.status === "OVERDUE")
          ? <AlertBanner type="danger" message={`${store.receivables.filter((r) => r.status === "OVERDUE").length} recebível(eis) atrasado(s). Acione a cobrança hoje.`} />
          : <AlertBanner type="ok" message="Nenhum recebível em atraso no momento." />}
        {payableMonth > consolidated + receivableMonth
          ? <AlertBanner type="danger" message="Risco de caixa: contas a pagar excedem saldo atual + a receber." />
          : <AlertBanner type="ok" message="Caixa saudável: receitas cobrem as despesas previstas." />}
        {store.payables.some((p) => p.status === "OVERDUE")
          ? <AlertBanner type="warning" message={`${store.payables.filter((p) => p.status === "OVERDUE").length} pagamento(s) atrasado(s).`} />
          : null}
        {store.accounts.length === 0
          ? <AlertBanner type="warning" message="Nenhuma conta cadastrada. Cadastre suas contas bancárias antes de lançar transações." />
          : null}
        {store.clients.length === 0
          ? <AlertBanner type="warning" message="Nenhum cliente cadastrado. Cadastre clientes para registrar receitas." />
          : null}
      </div>

      {/* Resumo de contas */}
      {store.accounts.length > 0 && (
        <article className="cc-card overflow-hidden">
          <div className="border-b border-zinc-100 px-5 py-4">
            <h2 className="text-sm font-bold text-zinc-900">Saldos por Conta</h2>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr>
                  <th className="cc-th">Conta</th>
                  <th className="cc-th">Tipo</th>
                  <th className="cc-th">Instituição</th>
                  <th className="cc-th text-right">Saldo</th>
                </tr>
              </thead>
              <tbody>
                {store.accounts.map((a) => (
                  <tr key={a.id} className="cc-tr">
                    <td className="cc-td font-medium">{a.name}</td>
                    <td className="cc-td text-zinc-500">{a.type.replaceAll("_", " ")}</td>
                    <td className="cc-td text-zinc-500">{a.institution}</td>
                    <td className="cc-td text-right font-semibold text-blue-700">{money(a.balance)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </article>
      )}
    </section>
  );
}

/* ── FLUXO ── */
function CashflowModule() {
  const { store, loading } = useAppStore();
  if (!store) return <div className="flex justify-center py-12 text-zinc-500 text-sm">{loading ? "Carregando..." : "Sem dados."}</div>;
  const rows = monthlyCashflow(store);
  return (
    <section className="space-y-5">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold text-zinc-900">Fluxo de Caixa</h1>
          <p className="text-sm text-zinc-500">Entradas e saídas agrupadas por mês</p>
        </div>
      </div>
      {rows.length === 0 ? (
        <EmptyState message="Nenhuma transação lançada ainda." />
      ) : (
        <article className="cc-card overflow-hidden">
          <table className="w-full">
            <thead>
              <tr>
                <th className="cc-th">Mês</th>
                <th className="cc-th text-right">Entradas</th>
                <th className="cc-th text-right">Saídas</th>
                <th className="cc-th text-right">Resultado</th>
                <th className="cc-th text-right">Margem</th>
              </tr>
            </thead>
            <tbody>
              {rows.map((r) => (
                <tr key={r.month} className="cc-tr">
                  <td className="cc-td font-semibold">{r.month}</td>
                  <td className="cc-td text-right text-emerald-700 font-medium">{money(r.income)}</td>
                  <td className="cc-td text-right text-red-700 font-medium">{money(r.expense)}</td>
                  <td className={`cc-td text-right font-bold ${r.result >= 0 ? "text-emerald-700" : "text-red-700"}`}>
                    {money(r.result)}
                  </td>
                  <td className="cc-td text-right text-zinc-500">
                    {r.income > 0 ? pct((r.result / r.income) * 100) : "-"}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </article>
      )}
    </section>
  );
}

/* ── DRE ── */
function DreModule() {
  const { store, loading } = useAppStore();
  if (!store) return <div className="flex justify-center py-12 text-zinc-500 text-sm">{loading ? "Carregando..." : "Sem dados."}</div>;
  const { income, impostos, equipe, ferramentas, proLabore, operacional, margem } = simplifiedDre(store);
  const pctOf = (v: number) => income > 0 ? `${((v / income) * 100).toFixed(1)}%` : "-";

  return (
    <section className="space-y-5">
      <div>
        <h1 className="text-xl font-bold text-zinc-900">DRE Simplificada</h1>
        <p className="text-sm text-zinc-500">Resultado operacional baseado nas categorias lançadas</p>
      </div>
      <article className="cc-card p-6 max-w-2xl">
        <div className="space-y-1">
          {[
            { label: "Receita Bruta", value: income, pct: "100%", bold: true, color: "" },
            { label: "(-) Impostos", value: -impostos, pct: pctOf(impostos), bold: false, color: "" },
            { label: "(-) Equipe", value: -equipe, pct: pctOf(equipe), bold: false, color: "" },
            { label: "(-) Ferramentas", value: -ferramentas, pct: pctOf(ferramentas), bold: false, color: "" },
            { label: "(-) Pró-labore", value: -proLabore, pct: pctOf(proLabore), bold: false, color: "" },
          ].map((row) => (
            <div key={row.label} className="flex items-center justify-between py-2.5 border-b border-zinc-100 text-sm">
              <span className={row.bold ? "font-bold text-zinc-900 text-base" : "text-zinc-700"}>{row.label}</span>
              <div className="flex items-center gap-4">
                <span className="text-zinc-400 text-xs w-10 text-right">{row.pct}</span>
                <span className={`font-semibold w-28 text-right ${row.bold ? "text-zinc-900 text-base" : row.value < 0 ? "text-red-700" : "text-zinc-800"}`}>
                  {money(Math.abs(row.value))}
                </span>
              </div>
            </div>
          ))}

          <div className="flex items-center justify-between py-3 mt-2 bg-zinc-50 rounded-xl px-4">
            <div>
              <p className="text-base font-bold text-zinc-900">Resultado Operacional</p>
              <p className="text-xs text-zinc-500">Margem: {pct(margem)}</p>
            </div>
            <p className={`text-2xl font-bold ${operacional >= 0 ? "text-emerald-700" : "text-red-700"}`}>
              {money(operacional)}
            </p>
          </div>
        </div>
      </article>
    </section>
  );
}

/* ── IMPORTADOR CSV ── */
function ImportModule() {
  const { importCsvPreview, importCsvCommit, clearAllData, refresh } = useAppStore();
  const [kind, setKind] = useState("transactions");
  const [csvText, setCsvText] = useState("");
  const [replaceAll, setReplaceAll] = useState(false);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<{ type: "ok" | "err"; text: string } | null>(null);
  const [preview, setPreview] = useState<{ rows: number; totals: Record<string, number>; sample: Array<Record<string, string>> } | null>(null);

  const handleFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (ev) => setCsvText(String(ev.target?.result ?? ""));
    reader.readAsText(file, "UTF-8");
  };

  const doPreview = async () => {
    if (!csvText.trim()) { setMessage({ type: "err", text: "Cole ou faça upload de um CSV primeiro." }); return; }
    setLoading(true);
    try {
      const p = await importCsvPreview({ kind, csv: csvText, replaceAll });
      setPreview({ rows: p.rows, totals: p.totals, sample: p.sample });
      setMessage({ type: "ok", text: `Preview: ${p.rows} linhas encontradas.` });
    } catch (e) {
      setMessage({ type: "err", text: (e as { message?: string }).message ?? "Falha no preview." });
    } finally { setLoading(false); }
  };

  const doCommit = async () => {
    if (!csvText.trim()) { setMessage({ type: "err", text: "Nenhum CSV para importar." }); return; }
    setLoading(true);
    try {
      const r = await importCsvCommit({ kind, csv: csvText, replaceAll });
      setMessage({ type: "ok", text: `✓ Importação concluída: ${r.importedRows} registros gravados no banco.` });
      setPreview(null);
      setCsvText("");
      refresh();
    } catch (e) {
      setMessage({ type: "err", text: (e as { message?: string }).message ?? "Falha na importação." });
    } finally { setLoading(false); }
  };

  const doClear = async () => {
    if (!confirm("Isso vai apagar TODOS os dados. Confirma?")) return;
    setLoading(true);
    try {
      await clearAllData();
      setMessage({ type: "ok", text: "Base de dados limpa com sucesso." });
      setPreview(null);
      refresh();
    } catch (e) {
      setMessage({ type: "err", text: (e as { message?: string }).message ?? "Falha ao limpar." });
    } finally { setLoading(false); }
  };

  const kindLabels: Record<string, string> = {
    accounts: "Contas",
    transactions: "Transações",
    clients: "Clientes",
    contracts: "Contratos",
    receivables: "A Receber",
    payables: "A Pagar",
  };

  const templates: Record<string, string> = {
    accounts: "id,name,type,institution,balance\nacc1,Sicoob Pessoal,PERSONAL_HELBERT,SICOOB,5000\nacc2,InfinitePay Empresa,BUSINESS_AGENCY,INFINITEPAY,12000",
    transactions: "id,date,direction,description,amount,accountId,category,costCenter,clientId\ntxn1,2026-05-01,INCOME,Recebimento Educaminas,2800,acc2,Receita de cliente,Agencia,cli1",
    clients: "id,name,status,monthlyValue,startDate\ncli1,Educaminas,ACTIVE,2800,2025-06-10\ncli2,Bias Centro Educacional,ACTIVE,2500,2025-08-10",
    contracts: "id,clientId,title,monthlyValue,startsAt,dueDay,services\nctr1,cli1,Gestao de Trafego,2800,2025-06-10,10,Gestao de trafego",
    receivables: "id,clientId,competency,expectedAmount,receivedAmount,expectedDate,receivedDate,status,accountId\nrec1,cli1,2026-05-01,2800,2800,2026-05-10,2026-05-10,PAID,acc2",
    payables: "id,description,provider,category,costCenter,amount,dueDate,status,type\npay1,Google Workspace,Google,Ferramentas,Agencia,190,2026-05-18,PAID,RECURRING",
  };

  return (
    <section className="space-y-5">
      <div>
        <h1 className="text-xl font-bold text-zinc-900">Importar Dados (CSV)</h1>
        <p className="text-sm text-zinc-500">Faça upload de um arquivo CSV ou cole o conteúdo abaixo para importar dados em massa.</p>
      </div>

      <div className="grid gap-5 lg:grid-cols-2">
        {/* Configuração */}
        <article className="cc-card p-5 space-y-4">
          <h2 className="text-sm font-bold text-zinc-900">1. Configurar importação</h2>

          <div>
            <label className="cc-label">Tipo de dados</label>
            <select value={kind} onChange={(e) => setKind(e.target.value)} className="cc-select">
              {Object.entries(kindLabels).map(([k, v]) => (
                <option key={k} value={k}>{v}</option>
              ))}
            </select>
          </div>

          <div>
            <label className="cc-label">Upload de arquivo CSV</label>
            <input
              type="file"
              accept=".csv,.txt"
              onChange={handleFile}
              className="block w-full text-sm text-zinc-600 file:mr-4 file:rounded-lg file:border-0 file:bg-blue-600 file:px-4 file:py-2 file:text-sm file:font-semibold file:text-white hover:file:bg-blue-700 cursor-pointer"
            />
          </div>

          <div>
            <label className="cc-label">Ou cole o CSV abaixo</label>
            <textarea
              value={csvText}
              onChange={(e) => setCsvText(e.target.value)}
              rows={8}
              className="cc-input font-mono text-xs resize-y"
              placeholder={`Exemplo:\n${templates[kind]}`}
            />
          </div>

          <label className="flex items-center gap-2 text-sm text-zinc-700 cursor-pointer">
            <input type="checkbox" checked={replaceAll} onChange={(e) => setReplaceAll(e.target.checked)} className="rounded" />
            <span>Substituir todos os dados existentes (apaga antes de importar)</span>
          </label>

          <div className="flex flex-wrap gap-2">
            <button type="button" onClick={doPreview} disabled={loading} className="cc-btn-ghost">
              {loading ? "..." : "Pré-visualizar"}
            </button>
            <button type="button" onClick={doCommit} disabled={loading} className="cc-btn-primary">
              {loading ? "Importando..." : "Importar para o Banco"}
            </button>
          </div>
        </article>

        {/* Template + Instruções */}
        <article className="cc-card p-5 space-y-4">
          <h2 className="text-sm font-bold text-zinc-900">2. Estrutura esperada do CSV</h2>
          <p className="text-xs text-zinc-500">Tipo selecionado: <strong>{kindLabels[kind]}</strong></p>
          <pre className="overflow-auto rounded-lg bg-zinc-900 text-emerald-300 p-4 text-xs leading-relaxed">
            {templates[kind]}
          </pre>
          <div className="space-y-2 text-xs text-zinc-600">
            <p className="font-semibold text-zinc-700">Valores aceitos</p>
            <p><strong>type (conta):</strong> PERSONAL_HELBERT, HOUSEHOLD, PERSONAL_LEIDIANE, BUSINESS_AGENCY, TRAVEL_EXTRA, DEBT, REIMBURSEMENT, WORKING_CAPITAL</p>
            <p><strong>institution:</strong> SICOOB, NUBANK, CAIXA, BRADESCO, MERCADO_PAGO, INFINITEPAY, COMPANY_ACCOUNT, CASH, OTHER</p>
            <p><strong>direction:</strong> INCOME, EXPENSE</p>
            <p><strong>status (receber):</strong> PENDING, PAID, PARTIAL, OVERDUE, CANCELED, RENEGOTIATED</p>
            <p><strong>status (pagar):</strong> OPEN, PAID, OVERDUE, INSTALMENT, RENEGOTIATED, SUSPENDED</p>
            <p><strong>type (pagar):</strong> FIXED, VARIABLE, RECURRING, EXTRAORDINARY, DEBT, INVESTMENT</p>
          </div>
        </article>
      </div>

      {message ? (
        <AlertBanner type={message.type === "ok" ? "ok" : "danger"} message={message.text} />
      ) : null}

      {preview ? (
        <article className="cc-card overflow-hidden">
          <div className="border-b border-zinc-100 px-5 py-4 flex items-center justify-between">
            <div>
              <h3 className="text-sm font-bold text-zinc-900">Pré-visualização</h3>
              <p className="text-xs text-zinc-500">{preview.rows} linha(s) encontradas. Clique em &quot;Importar&quot; para gravar.</p>
            </div>
            <div className="flex gap-2 text-xs">
              {Object.entries(preview.totals).map(([k, v]) => (
                <span key={k} className="rounded-full bg-blue-100 px-2 py-0.5 text-blue-800">
                  {kindLabels[k] ?? k}: {v}
                </span>
              ))}
            </div>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr>
                  {Object.keys(preview.sample[0] ?? {}).map((col) => (
                    <th key={col} className="cc-th">{col}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {preview.sample.map((row, i) => (
                  <tr key={i} className="cc-tr">
                    {Object.values(row).map((val, j) => (
                      <td key={j} className="cc-td text-xs">{val}</td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </article>
      ) : null}

      <article className="cc-card p-5 border-red-200">
        <h3 className="text-sm font-bold text-red-700 mb-2">Zona de Perigo</h3>
        <p className="text-xs text-zinc-600 mb-3">Apaga todos os dados do workspace. Esta ação não pode ser desfeita.</p>
        <button type="button" onClick={doClear} disabled={loading} className="cc-btn-danger text-xs px-3 py-2">
          Limpar toda a base de dados
        </button>
      </article>
    </section>
  );
}

function ComingSoonModule({ module }: { module: AppModule }) {
  const descriptions: Record<string, string> = {
    dividas: "Cadastre empréstimos, financiamentos e parcelas. Simule renegociações e acompanhe o saldo devedor.",
    documentos: "Anexe contratos, notas fiscais, comprovantes e boletos. Vincule documentos a clientes e transações.",
    projecoes: "Veja a projeção do seu caixa até dezembro. Receitas recorrentes, despesas fixas e saldo projetado.",
  };

  const { store } = useAppStore();

  if (module.key === "projecoes" && store) {
    // Projeção básica com dados reais
    const today = new Date();
    const months = Array.from({ length: 6 }, (_, i) => {
      const d = new Date(today.getFullYear(), today.getMonth() + i, 1);
      return { label: d.toLocaleString("pt-BR", { month: "long", year: "numeric" }), month: d.getMonth(), year: d.getFullYear() };
    });
    const mrr = store.contracts.reduce((a, c) => a + c.monthlyValue, 0);
    const fixedExpenses = store.payables.filter((p) => p.type === "FIXED" || p.type === "RECURRING").reduce((a, p) => a + p.amount, 0);
    const moneyFmt = (v: number) => new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" }).format(v);

    return (
      <section className="space-y-5">
        <div><h1 className="text-xl font-bold text-zinc-900">Projeção até Dezembro</h1><p className="text-sm text-zinc-500">Baseada no MRR atual e despesas fixas cadastradas</p></div>
        <div className="grid gap-3 sm:grid-cols-3">
          <article className="cc-card p-5"><p className="text-xs font-semibold uppercase tracking-wide text-zinc-500">MRR (receita recorrente)</p><p className="mt-2 text-2xl font-bold text-blue-700">{moneyFmt(mrr)}</p></article>
          <article className="cc-card p-5"><p className="text-xs font-semibold uppercase tracking-wide text-zinc-500">Despesas fixas/mês</p><p className="mt-2 text-2xl font-bold text-red-700">{moneyFmt(fixedExpenses)}</p></article>
          <article className="cc-card p-5"><p className="text-xs font-semibold uppercase tracking-wide text-zinc-500">Resultado mensal projetado</p><p className="mt-2 text-2xl font-bold text-emerald-700">{moneyFmt(mrr - fixedExpenses)}</p></article>
        </div>
        <article className="cc-card overflow-hidden">
          <table className="cc-table">
            <thead><tr><th className="cc-th">Mês</th><th className="cc-th text-right">Receita prevista</th><th className="cc-th text-right">Despesas fixas</th><th className="cc-th text-right">Resultado projetado</th></tr></thead>
            <tbody>
              {months.map((m) => (
                <tr key={m.label} className="cc-tr">
                  <td className="cc-td font-medium capitalize">{m.label}</td>
                  <td className="cc-td text-right text-emerald-700">{moneyFmt(mrr)}</td>
                  <td className="cc-td text-right text-red-700">{moneyFmt(fixedExpenses)}</td>
                  <td className={`cc-td text-right font-bold ${mrr - fixedExpenses >= 0 ? "text-emerald-700" : "text-red-700"}`}>{moneyFmt(mrr - fixedExpenses)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </article>
      </section>
    );
  }

  return (
    <section className="space-y-5">
      <div><h1 className="text-xl font-bold text-zinc-900">{module.label}</h1><p className="text-sm text-zinc-500">{descriptions[module.key] ?? module.description}</p></div>
      <article className="cc-card p-8 text-center">
        <div className="inline-flex h-12 w-12 items-center justify-center rounded-xl bg-blue-50 mb-4">
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#2563EB" strokeWidth="2"><path strokeLinecap="round" strokeLinejoin="round" d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" /></svg>
        </div>
        <h3 className="text-base font-semibold text-zinc-900 mb-1">{module.label} em desenvolvimento</h3>
        <p className="text-sm text-zinc-500 max-w-md mx-auto">{descriptions[module.key] ?? "Este módulo está sendo desenvolvido e estará disponível em breve."}</p>
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
  if (module.key === "configuracoes") return <SettingsModule />;
  if (module.key === "dividas") return <ComingSoonModule module={module} />;
  if (module.key === "documentos") return <ComingSoonModule module={module} />;
  if (module.key === "projecoes") return <ComingSoonModule module={module} />;
  return <ComingSoonModule module={module} />;
}
