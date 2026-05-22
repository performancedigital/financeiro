"use client";

import { useMemo, useState } from "react";
import { useAppStore } from "@/lib/store-context";
import { Modal } from "@/components/ui/modal";
import { debtSchema } from "@/lib/validators";

const money = (v: number) =>
  new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" }).format(v);
const pct = (v: number) => `${v.toFixed(1)}%`;

function KpiCard({ label, value, sub, color = "zinc" }: { label: string; value: string; sub?: string; color?: string }) {
  const colors: Record<string, string> = { zinc: "text-zinc-900", blue: "text-blue-700", green: "text-emerald-700", red: "text-red-700", amber: "text-amber-700", indigo: "text-indigo-700" };
  return (
    <article className="cc-card p-5">
      <p className="text-xs font-semibold uppercase tracking-wide text-zinc-500">{label}</p>
      <p className={`mt-2 text-2xl font-bold ${colors[color] ?? colors.zinc}`}>{value}</p>
      {sub && <p className="text-xs text-zinc-500 mt-1">{sub}</p>}
    </article>
  );
}

function PageHeader({ title, subtitle, onAdd, addLabel }: { title: string; subtitle: string; onAdd?: () => void; addLabel?: string }) {
  return (
    <div className="flex items-center justify-between">
      <div><h1 className="text-xl font-bold text-zinc-900">{title}</h1><p className="text-sm text-zinc-500">{subtitle}</p></div>
      {onAdd && (
        <button type="button" onClick={onAdd} className="cc-btn-primary" style={{ background: "#4f46e5" }}>
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path strokeLinecap="round" d="M12 5v14M5 12h14"/></svg>
          {addLabel}
        </button>
      )}
    </div>
  );
}

/* ── DASHBOARD PESSOAL ── */
export function DashboardPessoalModule() {
  const { store, loading, error } = useAppStore();
  if (!store) return <div className="flex justify-center py-12 text-zinc-500 text-sm">{loading ? "Carregando..." : "Sem dados."}</div>;

  const income = store.transactions.filter((t) => t.direction === "INCOME").reduce((a, t) => a + t.amount, 0);
  const expense = store.transactions.filter((t) => t.direction === "EXPENSE").reduce((a, t) => a + t.amount, 0);
  const balance = store.accounts.reduce((a, x) => a + x.balance, 0) + income - expense;
  const totalDebts = store.debts.filter((d) => d.status !== "PAID_OFF").reduce((a, d) => a + d.outstandingAmount, 0);
  const savings = income > 0 ? ((income - expense) / income) * 100 : 0;

  const expenseByCategory = store.transactions
    .filter((t) => t.direction === "EXPENSE")
    .reduce((acc, t) => { acc[t.category] = (acc[t.category] ?? 0) + t.amount; return acc; }, {} as Record<string, number>);

  const topCategories = Object.entries(expenseByCategory)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 5);

  return (
    <section className="space-y-5">
      {error && <div className="rounded-lg bg-red-50 px-3 py-2 text-sm text-red-700">{error.message}</div>}

      <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
        <KpiCard label="Saldo Total" value={money(balance)} color={balance >= 0 ? "indigo" : "red"} />
        <KpiCard label="Entradas" value={money(income)} color="green" />
        <KpiCard label="Gastos" value={money(expense)} color="red" />
        <KpiCard label="Taxa de Economia" value={pct(Math.max(0, savings))} sub={savings >= 20 ? "Ótimo! Acima de 20%" : savings > 0 ? "Abaixo do recomendado" : "Gastos maiores que renda"} color={savings >= 20 ? "green" : savings > 0 ? "amber" : "red"} />
      </div>

      <div className="grid gap-3 sm:grid-cols-2">
        <KpiCard label="Dívidas Totais" value={money(totalDebts)} color="amber" />
        <KpiCard label="Saldo Livre (sem dívidas)" value={money(balance - totalDebts)} color={balance - totalDebts >= 0 ? "green" : "red"} />
      </div>

      {/* Gastos por categoria */}
      {topCategories.length > 0 && (
        <article className="cc-card p-5">
          <h2 className="text-sm font-bold text-zinc-900 mb-4">Maiores Categorias de Gasto</h2>
          <div className="space-y-3">
            {topCategories.map(([cat, val]) => (
              <div key={cat}>
                <div className="flex justify-between text-sm mb-1">
                  <span className="text-zinc-700">{cat}</span>
                  <span className="font-semibold">{money(val)}</span>
                </div>
                <div className="h-2 rounded-full bg-zinc-100 overflow-hidden">
                  <div className="h-full rounded-full bg-indigo-500" style={{ width: `${Math.min(100, (val / expense) * 100)}%` }} />
                </div>
              </div>
            ))}
          </div>
        </article>
      )}

      {store.accounts.length === 0 && (
        <article className="cc-card p-6 text-center">
          <p className="text-sm font-semibold text-zinc-700 mb-2">Bem-vindo ao seu painel pessoal!</p>
          <p className="text-sm text-zinc-500 mb-4">Comece cadastrando suas contas bancárias e lançando seus gastos.</p>
          <div className="flex gap-2 justify-center">
            <a href="/dashboard?mod=contas" className="cc-btn text-sm px-4 py-2 rounded-lg text-white" style={{ background: "#4f46e5" }}>Adicionar conta</a>
          </div>
        </article>
      )}
    </section>
  );
}

/* ── GASTOS PESSOAIS ── */
export function GastosModule() {
  const { store, loading } = useAppStore();
  if (!store) return <div className="flex justify-center py-12 text-zinc-500 text-sm">{loading ? "Carregando..." : "Sem dados."}</div>;

  const txs = store.transactions;
  const income = txs.filter((t) => t.direction === "INCOME").reduce((a, t) => a + t.amount, 0);
  const expense = txs.filter((t) => t.direction === "EXPENSE").reduce((a, t) => a + t.amount, 0);
  const balance = income - expense;

  return (
    <section className="space-y-5">
      <div>
        <h1 className="text-xl font-bold text-zinc-900">Renda & Gastos</h1>
        <p className="text-sm text-zinc-500">Entradas e saídas das suas contas pessoais</p>
      </div>
      <div className="rounded-lg bg-indigo-50 border border-indigo-100 px-4 py-2 text-sm text-indigo-700">
        Para lançar transações, use o módulo <strong>Contas</strong> → aba <strong>Transações</strong>. Use categorias como: Salário, Alimentação, Moradia, Transporte, Saúde, Lazer, Investimento.
      </div>

      <div className="grid gap-3 sm:grid-cols-3">
        <KpiCard label="Renda total" value={money(income)} color="green" />
        <KpiCard label="Gastos totais" value={money(expense)} color="red" />
        <KpiCard label="Saldo do período" value={money(balance)} color={balance >= 0 ? "indigo" : "red"} />
      </div>

      {txs.length === 0 ? (
        <div className="flex flex-col items-center justify-center rounded-xl border-2 border-dashed border-zinc-300 bg-white py-16 text-center">
          <p className="text-sm font-medium text-zinc-500">Nenhuma transação lançada.</p>
          <p className="text-xs text-zinc-400 mt-1">Vá em Contas → Transações para lançar.</p>
        </div>
      ) : (
        <article className="cc-card overflow-hidden">
          <table className="cc-table">
            <thead><tr>
              <th className="cc-th">Data</th><th className="cc-th">Tipo</th>
              <th className="cc-th">Descrição</th><th className="cc-th">Categoria</th>
              <th className="cc-th text-right">Valor</th>
            </tr></thead>
            <tbody>
              {txs.slice(0, 50).map((t) => (
                <tr key={t.id} className="cc-tr">
                  <td className="cc-td text-zinc-500">{t.date}</td>
                  <td className="cc-td"><span className={`inline-flex rounded-full px-2.5 py-0.5 text-xs font-semibold ${t.direction === "INCOME" ? "bg-emerald-50 text-emerald-700" : "bg-red-50 text-red-700"}`}>{t.direction === "INCOME" ? "Entrada" : "Saída"}</span></td>
                  <td className="cc-td font-medium">{t.description}</td>
                  <td className="cc-td text-zinc-500">{t.category}</td>
                  <td className={`cc-td text-right font-semibold ${t.direction === "INCOME" ? "text-emerald-700" : "text-red-700"}`}>{t.direction === "EXPENSE" ? "-" : ""}{money(t.amount)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </article>
      )}
    </section>
  );
}

/* ── ORÇAMENTO ── */

type BudgetItem = { category: string; limit: number };

export function OrcamentoModule() {
  const { store, loading } = useAppStore();
  const [budgets, setBudgets] = useState<BudgetItem[]>([
    { category: "Alimentação", limit: 800 },
    { category: "Transporte", limit: 400 },
    { category: "Lazer", limit: 300 },
    { category: "Saúde", limit: 200 },
  ]);
  const [showAdd, setShowAdd] = useState(false);
  const [newCat, setNewCat] = useState(""); const [newLimit, setNewLimit] = useState("");

  if (!store) return <div className="flex justify-center py-12 text-zinc-500 text-sm">{loading ? "Carregando..." : "Sem dados."}</div>;

  const expenseByCategory = store.transactions
    .filter((t) => t.direction === "EXPENSE")
    .reduce((acc, t) => { acc[t.category] = (acc[t.category] ?? 0) + t.amount; return acc; }, {} as Record<string, number>);

  const totalLimit = budgets.reduce((a, b) => a + b.limit, 0);
  const totalSpent = budgets.reduce((a, b) => a + (expenseByCategory[b.category] ?? 0), 0);

  return (
    <section className="space-y-5">
      <PageHeader title="Orçamento Mensal" subtitle="Defina limites de gasto por categoria" onAdd={() => setShowAdd(true)} addLabel="Nova categoria" />

      <div className="grid gap-3 sm:grid-cols-3">
        <KpiCard label="Total orçado" value={money(totalLimit)} color="indigo" />
        <KpiCard label="Total gasto" value={money(totalSpent)} color={totalSpent > totalLimit ? "red" : "zinc"} />
        <KpiCard label="Disponível" value={money(totalLimit - totalSpent)} color={totalLimit - totalSpent >= 0 ? "green" : "red"} />
      </div>

      <div className="space-y-3">
        {budgets.map((b) => {
          const spent = expenseByCategory[b.category] ?? 0;
          const pctSpent = b.limit > 0 ? (spent / b.limit) * 100 : 0;
          const over = pctSpent > 100;
          return (
            <article key={b.category} className="cc-card p-4">
              <div className="flex items-center justify-between mb-2">
                <div>
                  <p className="text-sm font-semibold text-zinc-800">{b.category}</p>
                  <p className="text-xs text-zinc-500">{money(spent)} de {money(b.limit)}</p>
                </div>
                <div className="flex items-center gap-3">
                  <span className={`text-sm font-bold ${over ? "text-red-700" : pctSpent > 80 ? "text-amber-700" : "text-emerald-700"}`}>{pct(pctSpent)}</span>
                  <button type="button" onClick={() => setBudgets((prev) => prev.filter((x) => x.category !== b.category))} className="text-xs text-zinc-400 hover:text-red-600">✕</button>
                </div>
              </div>
              <div className="h-2.5 rounded-full bg-zinc-100 overflow-hidden">
                <div className={`h-full rounded-full transition-all ${over ? "bg-red-500" : pctSpent > 80 ? "bg-amber-500" : "bg-indigo-500"}`} style={{ width: `${Math.min(100, pctSpent)}%` }} />
              </div>
            </article>
          );
        })}
      </div>

      {showAdd && (
        <Modal title="Nova Categoria de Orçamento" onClose={() => setShowAdd(false)}>
          <div className="space-y-4">
            <div><label className="cc-label">Categoria</label><input value={newCat} onChange={(e) => setNewCat(e.target.value)} placeholder="Ex: Streaming, Academia..." className="cc-input" /></div>
            <div><label className="cc-label">Limite mensal (R$)</label><input type="number" value={newLimit} onChange={(e) => setNewLimit(e.target.value)} placeholder="Ex: 150" className="cc-input" /></div>
            <div className="flex gap-2">
              <button type="button" onClick={() => { if (newCat && newLimit) { setBudgets((p) => [...p, { category: newCat, limit: Number(newLimit) }]); setNewCat(""); setNewLimit(""); setShowAdd(false); } }} className="cc-btn text-white text-sm px-4 py-2 rounded-lg" style={{ background: "#4f46e5" }}>Adicionar</button>
              <button type="button" onClick={() => setShowAdd(false)} className="cc-btn-ghost">Cancelar</button>
            </div>
          </div>
        </Modal>
      )}
    </section>
  );
}

/* ── INVESTIMENTOS ── */

type Investment = { id: string; name: string; type: string; amount: number; currentValue: number; notes?: string };

const INV_TYPES: Record<string, string> = {
  POUPANCA: "Poupança", CDB: "CDB/LCI/LCA", TESOURO: "Tesouro Direto",
  ACOES: "Ações", FII: "Fundos Imobiliários", CRIPTO: "Criptomoedas",
  PREVIDENCIA: "Previdência", FUNDO: "Fundos de Investimento", OUTRO: "Outro",
};

export function InvestimentosModule() {
  const [investments, setInvestments] = useState<Investment[]>([
    { id: "1", name: "Reserva de emergência", type: "POUPANCA", amount: 5000, currentValue: 5200 },
    { id: "2", name: "CDB Banco Inter 110% CDI", type: "CDB", amount: 10000, currentValue: 10450 },
  ]);
  const [showModal, setShowModal] = useState(false);
  const [form, setForm] = useState({ name: "", type: "CDB", amount: "", currentValue: "", notes: "" });

  const totalInvested = investments.reduce((a, i) => a + i.amount, 0);
  const totalCurrent = investments.reduce((a, i) => a + i.currentValue, 0);
  const totalReturn = totalCurrent - totalInvested;
  const returnPct = totalInvested > 0 ? (totalReturn / totalInvested) * 100 : 0;

  const byType = investments.reduce((acc, i) => { acc[i.type] = (acc[i.type] ?? 0) + i.currentValue; return acc; }, {} as Record<string, number>);

  const addInvestment = () => {
    if (!form.name || !form.amount || !form.currentValue) return;
    setInvestments((p) => [...p, { id: String(Date.now()), name: form.name, type: form.type, amount: Number(form.amount), currentValue: Number(form.currentValue), notes: form.notes }]);
    setForm({ name: "", type: "CDB", amount: "", currentValue: "", notes: "" });
    setShowModal(false);
  };

  return (
    <section className="space-y-5">
      <PageHeader title="Carteira de Investimentos" subtitle="Acompanhe seus investimentos e rendimentos" onAdd={() => setShowModal(true)} addLabel="Novo Investimento" />

      <div className="grid gap-3 sm:grid-cols-4">
        <KpiCard label="Total Investido" value={money(totalInvested)} color="indigo" />
        <KpiCard label="Valor Atual" value={money(totalCurrent)} color="blue" />
        <KpiCard label="Rendimento Total" value={money(totalReturn)} color={totalReturn >= 0 ? "green" : "red"} />
        <KpiCard label="Rentabilidade" value={pct(returnPct)} sub={returnPct >= 0 ? "positivo" : "negativo"} color={returnPct >= 0 ? "green" : "red"} />
      </div>

      {/* Distribuição por tipo */}
      {Object.keys(byType).length > 0 && (
        <article className="cc-card p-5">
          <h3 className="text-sm font-bold text-zinc-900 mb-4">Distribuição por Tipo</h3>
          <div className="space-y-2">
            {Object.entries(byType).sort((a, b) => b[1] - a[1]).map(([type, val]) => (
              <div key={type} className="flex items-center gap-3">
                <div className="flex-1">
                  <div className="flex justify-between text-sm mb-1">
                    <span className="text-zinc-700">{INV_TYPES[type] ?? type}</span>
                    <span className="font-semibold">{money(val)} <span className="text-zinc-400 text-xs">({pct((val / totalCurrent) * 100)})</span></span>
                  </div>
                  <div className="h-2 rounded-full bg-zinc-100 overflow-hidden">
                    <div className="h-full rounded-full bg-indigo-500" style={{ width: `${(val / totalCurrent) * 100}%` }} />
                  </div>
                </div>
              </div>
            ))}
          </div>
        </article>
      )}

      <article className="cc-card overflow-hidden">
        <table className="cc-table">
          <thead><tr>
            <th className="cc-th">Ativo</th><th className="cc-th">Tipo</th>
            <th className="cc-th text-right">Investido</th><th className="cc-th text-right">Atual</th>
            <th className="cc-th text-right">Rendimento</th><th className="cc-th"></th>
          </tr></thead>
          <tbody>
            {investments.length === 0 && <tr><td colSpan={6} className="cc-td text-center text-zinc-500 py-8">Nenhum investimento cadastrado.</td></tr>}
            {investments.map((i) => {
              const ret = i.currentValue - i.amount;
              const retPct = i.amount > 0 ? (ret / i.amount) * 100 : 0;
              return (
                <tr key={i.id} className="cc-tr">
                  <td className="cc-td font-semibold">{i.name}</td>
                  <td className="cc-td"><span className="inline-flex rounded-full bg-indigo-50 px-2.5 py-0.5 text-xs font-semibold text-indigo-700">{INV_TYPES[i.type] ?? i.type}</span></td>
                  <td className="cc-td text-right">{money(i.amount)}</td>
                  <td className="cc-td text-right font-semibold">{money(i.currentValue)}</td>
                  <td className={`cc-td text-right font-semibold ${ret >= 0 ? "text-emerald-700" : "text-red-700"}`}>{money(ret)} <span className="text-xs">({pct(retPct)})</span></td>
                  <td className="cc-td"><button type="button" onClick={() => setInvestments((p) => p.filter((x) => x.id !== i.id))} className="text-xs text-red-600 hover:underline">Excluir</button></td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </article>

      {showModal && (
        <Modal title="Novo Investimento" onClose={() => setShowModal(false)}>
          <div className="space-y-4">
            <div><label className="cc-label">Nome do ativo *</label><input value={form.name} onChange={(e) => setForm((p) => ({ ...p, name: e.target.value }))} placeholder="Ex: CDB Banco Inter 110% CDI" className="cc-input" /></div>
            <div><label className="cc-label">Tipo *</label>
              <select value={form.type} onChange={(e) => setForm((p) => ({ ...p, type: e.target.value }))} className="cc-select">
                {Object.entries(INV_TYPES).map(([k, v]) => <option key={k} value={k}>{v}</option>)}
              </select>
            </div>
            <div className="grid gap-4 sm:grid-cols-2">
              <div><label className="cc-label">Valor investido (R$) *</label><input type="number" value={form.amount} onChange={(e) => setForm((p) => ({ ...p, amount: e.target.value }))} className="cc-input" /></div>
              <div><label className="cc-label">Valor atual (R$) *</label><input type="number" value={form.currentValue} onChange={(e) => setForm((p) => ({ ...p, currentValue: e.target.value }))} className="cc-input" /></div>
            </div>
            <div><label className="cc-label">Observações</label><input value={form.notes} onChange={(e) => setForm((p) => ({ ...p, notes: e.target.value }))} placeholder="Opcional..." className="cc-input" /></div>
            <div className="flex gap-2">
              <button type="button" onClick={addInvestment} className="cc-btn text-white text-sm px-4 py-2 rounded-lg" style={{ background: "#4f46e5" }}>Salvar</button>
              <button type="button" onClick={() => setShowModal(false)} className="cc-btn-ghost">Cancelar</button>
            </div>
          </div>
        </Modal>
      )}
    </section>
  );
}

/* ── METAS FINANCEIRAS ── */

type Goal = { id: string; name: string; target: number; current: number; deadline?: string; type: string };

const GOAL_TYPES: Record<string, string> = {
  EMERGENCY: "Reserva de Emergência", TRAVEL: "Viagem", PROPERTY: "Imóvel",
  VEHICLE: "Veículo", EDUCATION: "Educação", RETIREMENT: "Aposentadoria", OTHER: "Outra Meta",
};

export function MetasModule() {
  const { store } = useAppStore();
  const [goals, setGoals] = useState<Goal[]>([
    { id: "1", name: "Reserva de emergência (6 meses)", type: "EMERGENCY", target: 18000, current: 5200 },
    { id: "2", name: "Viagem para Europa", type: "TRAVEL", target: 15000, current: 2500, deadline: "2027-06-01" },
  ]);
  const [showModal, setShowModal] = useState(false);
  const [form, setForm] = useState({ name: "", type: "OTHER", target: "", current: "", deadline: "" });

  const totalSaved = goals.reduce((a, g) => a + g.current, 0);
  const totalTarget = goals.reduce((a, g) => a + g.target, 0);
  const completed = goals.filter((g) => g.current >= g.target).length;

  const addGoal = () => {
    if (!form.name || !form.target) return;
    setGoals((p) => [...p, { id: String(Date.now()), name: form.name, type: form.type, target: Number(form.target), current: Number(form.current) || 0, deadline: form.deadline || undefined }]);
    setForm({ name: "", type: "OTHER", target: "", current: "", deadline: "" });
    setShowModal(false);
  };

  return (
    <section className="space-y-5">
      <PageHeader title="Metas Financeiras" subtitle="Seus objetivos e projetos de poupança" onAdd={() => setShowModal(true)} addLabel="Nova Meta" />

      <div className="grid gap-3 sm:grid-cols-3">
        <KpiCard label="Total poupado" value={money(totalSaved)} color="indigo" />
        <KpiCard label="Total necessário" value={money(totalTarget)} color="zinc" />
        <KpiCard label="Metas concluídas" value={`${completed} de ${goals.length}`} color={completed > 0 ? "green" : "zinc"} />
      </div>

      <div className="space-y-3">
        {goals.length === 0 && (
          <div className="flex flex-col items-center justify-center rounded-xl border-2 border-dashed border-zinc-300 bg-white py-16 text-center">
            <p className="text-sm font-medium text-zinc-500">Nenhuma meta cadastrada.</p>
          </div>
        )}
        {goals.map((g) => {
          const pctDone = g.target > 0 ? Math.min(100, (g.current / g.target) * 100) : 0;
          const remaining = g.target - g.current;
          const done = g.current >= g.target;
          return (
            <article key={g.id} className="cc-card p-5">
              <div className="flex items-start justify-between mb-3">
                <div>
                  <div className="flex items-center gap-2">
                    <p className="text-sm font-bold text-zinc-900">{g.name}</p>
                    {done && <span className="inline-flex rounded-full bg-emerald-100 px-2.5 py-0.5 text-xs font-semibold text-emerald-700">✓ Concluída</span>}
                  </div>
                  <p className="text-xs text-zinc-500 mt-0.5">{GOAL_TYPES[g.type] ?? g.type}{g.deadline ? ` · Prazo: ${g.deadline}` : ""}</p>
                </div>
                <button type="button" onClick={() => setGoals((p) => p.filter((x) => x.id !== g.id))} className="text-xs text-red-600 hover:underline">Excluir</button>
              </div>
              <div className="flex justify-between text-sm mb-2">
                <span className="text-zinc-700">{money(g.current)} guardado</span>
                <span className="font-semibold text-zinc-900">{money(g.target)} meta</span>
              </div>
              <div className="h-3 rounded-full bg-zinc-100 overflow-hidden mb-2">
                <div className={`h-full rounded-full transition-all ${done ? "bg-emerald-500" : "bg-indigo-500"}`} style={{ width: `${pctDone}%` }} />
              </div>
              <div className="flex justify-between text-xs text-zinc-500">
                <span>{pct(pctDone)} concluído</span>
                {!done && <span>Faltam {money(remaining)}</span>}
              </div>
            </article>
          );
        })}
      </div>

      {showModal && (
        <Modal title="Nova Meta Financeira" onClose={() => setShowModal(false)}>
          <div className="space-y-4">
            <div><label className="cc-label">Nome da meta *</label><input value={form.name} onChange={(e) => setForm((p) => ({ ...p, name: e.target.value }))} placeholder="Ex: Reserva de emergência" className="cc-input" /></div>
            <div><label className="cc-label">Tipo</label>
              <select value={form.type} onChange={(e) => setForm((p) => ({ ...p, type: e.target.value }))} className="cc-select">
                {Object.entries(GOAL_TYPES).map(([k, v]) => <option key={k} value={k}>{v}</option>)}
              </select>
            </div>
            <div className="grid gap-4 sm:grid-cols-2">
              <div><label className="cc-label">Valor alvo (R$) *</label><input type="number" value={form.target} onChange={(e) => setForm((p) => ({ ...p, target: e.target.value }))} className="cc-input" /></div>
              <div><label className="cc-label">Já guardei (R$)</label><input type="number" value={form.current} onChange={(e) => setForm((p) => ({ ...p, current: e.target.value }))} defaultValue="0" className="cc-input" /></div>
            </div>
            <div><label className="cc-label">Prazo (opcional)</label><input type="date" value={form.deadline} onChange={(e) => setForm((p) => ({ ...p, deadline: e.target.value }))} className="cc-input" /></div>
            <div className="flex gap-2">
              <button type="button" onClick={addGoal} className="cc-btn text-white text-sm px-4 py-2 rounded-lg" style={{ background: "#4f46e5" }}>Salvar Meta</button>
              <button type="button" onClick={() => setShowModal(false)} className="cc-btn-ghost">Cancelar</button>
            </div>
          </div>
        </Modal>
      )}
    </section>
  );
}
