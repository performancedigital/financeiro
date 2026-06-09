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

export function OrcamentoModule() {
  const { store, loading, createBudget, deleteBudget } = useAppStore();
  const [showAdd, setShowAdd] = useState(false);
  const [newCat, setNewCat] = useState(""); const [newLimit, setNewLimit] = useState("");
  const [saving, setSaving] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);

  if (!store) return <div className="flex justify-center py-12 text-zinc-500 text-sm">{loading ? "Carregando..." : "Sem dados."}</div>;

  const budgets = store.budgets;
  const expenseByCategory = store.transactions
    .filter((t) => t.direction === "EXPENSE")
    .reduce((acc, t) => { acc[t.category] = (acc[t.category] ?? 0) + t.amount; return acc; }, {} as Record<string, number>);

  const totalLimit = budgets.reduce((a, b) => a + b.limitAmount, 0);
  const totalSpent = budgets.reduce((a, b) => a + (expenseByCategory[b.category] ?? 0), 0);

  const handleAdd = async () => {
    if (!newCat.trim() || !newLimit) { setFormError("Informe categoria e limite."); return; }
    setSaving(true);
    try {
      await createBudget({ category: newCat.trim(), limitAmount: Number(newLimit) });
      setNewCat(""); setNewLimit(""); setFormError(null); setShowAdd(false);
    } catch (e) {
      setFormError(e instanceof Error ? e.message : "Erro ao salvar.");
    } finally { setSaving(false); }
  };

  return (
    <section className="space-y-5">
      <PageHeader title="Orçamento Mensal" subtitle="Defina limites de gasto por categoria" onAdd={() => { setFormError(null); setShowAdd(true); }} addLabel="Nova categoria" />

      <div className="grid gap-3 sm:grid-cols-3">
        <KpiCard label="Total orçado" value={money(totalLimit)} color="indigo" />
        <KpiCard label="Total gasto" value={money(totalSpent)} color={totalSpent > totalLimit ? "red" : "zinc"} />
        <KpiCard label="Disponível" value={money(totalLimit - totalSpent)} color={totalLimit - totalSpent >= 0 ? "green" : "red"} />
      </div>

      {budgets.length === 0 ? (
        <div className="flex flex-col items-center justify-center rounded-xl border-2 border-dashed border-zinc-300 bg-white py-16 text-center">
          <p className="text-sm font-medium text-zinc-500">Nenhum orçamento definido.</p>
          <p className="text-xs text-zinc-400 mt-1">Clique em &quot;Nova categoria&quot; para definir um limite mensal.</p>
        </div>
      ) : (
        <div className="space-y-3">
          {budgets.map((b) => {
            const spent = expenseByCategory[b.category] ?? 0;
            const pctSpent = b.limitAmount > 0 ? (spent / b.limitAmount) * 100 : 0;
            const over = pctSpent > 100;
            return (
              <article key={b.id} className="cc-card p-4">
                <div className="flex items-center justify-between mb-2">
                  <div>
                    <p className="text-sm font-semibold text-zinc-800">{b.category}</p>
                    <p className="text-xs text-zinc-500">{money(spent)} de {money(b.limitAmount)}</p>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className={`text-sm font-bold ${over ? "text-red-700" : pctSpent > 80 ? "text-amber-700" : "text-emerald-700"}`}>{pct(pctSpent)}</span>
                    <button type="button" onClick={() => void deleteBudget(b.id)} className="text-xs text-zinc-400 hover:text-red-600">✕</button>
                  </div>
                </div>
                <div className="h-2.5 rounded-full bg-zinc-100 overflow-hidden">
                  <div className={`h-full rounded-full transition-all ${over ? "bg-red-500" : pctSpent > 80 ? "bg-amber-500" : "bg-indigo-500"}`} style={{ width: `${Math.min(100, pctSpent)}%` }} />
                </div>
              </article>
            );
          })}
        </div>
      )}

      {showAdd && (
        <Modal title="Nova Categoria de Orçamento" onClose={() => setShowAdd(false)}>
          <div className="space-y-4">
            {formError && <p className="rounded-lg bg-red-50 px-3 py-2 text-sm text-red-700">{formError}</p>}
            <div><label className="cc-label">Categoria</label><input value={newCat} onChange={(e) => setNewCat(e.target.value)} placeholder="Ex: Alimentação, Transporte, Lazer..." className="cc-input" /></div>
            <div><label className="cc-label">Limite mensal (R$)</label><input type="number" value={newLimit} onChange={(e) => setNewLimit(e.target.value)} placeholder="Ex: 800" className="cc-input" /></div>
            <p className="text-xs text-zinc-400">Dica: use o mesmo nome da categoria que você lança nas transações para o gasto ser somado automaticamente.</p>
            <div className="flex gap-2">
              <button type="button" onClick={handleAdd} disabled={saving} className="cc-btn text-white text-sm px-4 py-2 rounded-lg disabled:opacity-60" style={{ background: "#4f46e5" }}>{saving ? "Salvando..." : "Adicionar"}</button>
              <button type="button" onClick={() => setShowAdd(false)} className="cc-btn-ghost">Cancelar</button>
            </div>
          </div>
        </Modal>
      )}
    </section>
  );
}

/* ── INVESTIMENTOS ── */

const INV_TYPES: Record<string, string> = {
  POUPANCA: "Poupança", CDB: "CDB/LCI/LCA", TESOURO: "Tesouro Direto",
  ACOES: "Ações", FII: "Fundos Imobiliários", CRIPTO: "Criptomoedas",
  PREVIDENCIA: "Previdência", FUNDO: "Fundos de Investimento", OTHER: "Outro",
};

type InvForm = { name: string; type: string; investedAmount: string; currentValue: string; notes: string };
const emptyInvForm: InvForm = { name: "", type: "CDB", investedAmount: "", currentValue: "", notes: "" };

export function InvestimentosModule() {
  const { store, loading, createInvestment, updateInvestment, deleteInvestment } = useAppStore();
  const [showModal, setShowModal] = useState(false);
  const [editId, setEditId] = useState<string | null>(null);
  const [form, setForm] = useState<InvForm>(emptyInvForm);
  const [saving, setSaving] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);

  if (!store) return <div className="flex justify-center py-12 text-zinc-500 text-sm">{loading ? "Carregando..." : "Sem dados."}</div>;

  const investments = store.investments;
  const totalInvested = investments.reduce((a, i) => a + i.investedAmount, 0);
  const totalCurrent = investments.reduce((a, i) => a + i.currentValue, 0);
  const totalReturn = totalCurrent - totalInvested;
  const returnPct = totalInvested > 0 ? (totalReturn / totalInvested) * 100 : 0;
  const byType = investments.reduce((acc, i) => { acc[i.type] = (acc[i.type] ?? 0) + i.currentValue; return acc; }, {} as Record<string, number>);

  const openNew = () => { setEditId(null); setForm(emptyInvForm); setFormError(null); setShowModal(true); };
  const openEdit = (id: string) => {
    const inv = investments.find((x) => x.id === id);
    if (!inv) return;
    setEditId(id);
    setForm({ name: inv.name, type: inv.type, investedAmount: String(inv.investedAmount), currentValue: String(inv.currentValue), notes: inv.notes ?? "" });
    setFormError(null); setShowModal(true);
  };

  const save = async () => {
    if (!form.name || !form.investedAmount || !form.currentValue) { setFormError("Preencha nome, investido e valor atual."); return; }
    setSaving(true);
    const payload = { name: form.name, type: form.type, investedAmount: Number(form.investedAmount), currentValue: Number(form.currentValue), notes: form.notes || undefined };
    try {
      if (editId) await updateInvestment(editId, payload);
      else await createInvestment(payload);
      setForm(emptyInvForm); setEditId(null); setFormError(null); setShowModal(false);
    } catch (e) {
      setFormError(e instanceof Error ? e.message : "Erro ao salvar.");
    } finally { setSaving(false); }
  };

  return (
    <section className="space-y-5">
      <PageHeader title="Carteira de Investimentos" subtitle="Acompanhe seus investimentos e rendimentos" onAdd={openNew} addLabel="Novo Investimento" />

      <div className="grid gap-3 sm:grid-cols-4">
        <KpiCard label="Total Investido" value={money(totalInvested)} color="indigo" />
        <KpiCard label="Valor Atual" value={money(totalCurrent)} color="blue" />
        <KpiCard label="Rendimento Total" value={money(totalReturn)} color={totalReturn >= 0 ? "green" : "red"} />
        <KpiCard label="Rentabilidade" value={pct(returnPct)} sub={returnPct >= 0 ? "positivo" : "negativo"} color={returnPct >= 0 ? "green" : "red"} />
      </div>

      {Object.keys(byType).length > 0 && (
        <article className="cc-card p-5">
          <h3 className="text-sm font-bold text-zinc-900 mb-4">Distribuição por Tipo</h3>
          <div className="space-y-2">
            {Object.entries(byType).sort((a, b) => b[1] - a[1]).map(([type, val]) => (
              <div key={type} className="flex items-center gap-3">
                <div className="flex-1">
                  <div className="flex justify-between text-sm mb-1">
                    <span className="text-zinc-700">{INV_TYPES[type] ?? type}</span>
                    <span className="font-semibold">{money(val)} <span className="text-zinc-400 text-xs">({totalCurrent > 0 ? pct((val / totalCurrent) * 100) : "0%"})</span></span>
                  </div>
                  <div className="h-2 rounded-full bg-zinc-100 overflow-hidden">
                    <div className="h-full rounded-full bg-indigo-500" style={{ width: `${totalCurrent > 0 ? (val / totalCurrent) * 100 : 0}%` }} />
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
            <th className="cc-th text-right">Rendimento</th><th className="cc-th">Ações</th>
          </tr></thead>
          <tbody>
            {investments.length === 0 && <tr><td colSpan={6} className="cc-td text-center text-zinc-500 py-8">Nenhum investimento cadastrado.</td></tr>}
            {investments.map((i) => {
              const ret = i.currentValue - i.investedAmount;
              const retPct = i.investedAmount > 0 ? (ret / i.investedAmount) * 100 : 0;
              return (
                <tr key={i.id} className="cc-tr">
                  <td className="cc-td font-semibold">{i.name}</td>
                  <td className="cc-td"><span className="inline-flex rounded-full bg-indigo-50 px-2.5 py-0.5 text-xs font-semibold text-indigo-700">{INV_TYPES[i.type] ?? i.type}</span></td>
                  <td className="cc-td text-right">{money(i.investedAmount)}</td>
                  <td className="cc-td text-right font-semibold">{money(i.currentValue)}</td>
                  <td className={`cc-td text-right font-semibold ${ret >= 0 ? "text-emerald-700" : "text-red-700"}`}>{money(ret)} <span className="text-xs">({pct(retPct)})</span></td>
                  <td className="cc-td">
                    <div className="flex gap-2">
                      <button type="button" onClick={() => openEdit(i.id)} className="text-xs text-indigo-600 hover:underline">Editar</button>
                      <button type="button" onClick={() => void deleteInvestment(i.id)} className="text-xs text-red-600 hover:underline">Excluir</button>
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </article>

      {showModal && (
        <Modal title={editId ? "Editar Investimento" : "Novo Investimento"} onClose={() => setShowModal(false)}>
          <div className="space-y-4">
            {formError && <p className="rounded-lg bg-red-50 px-3 py-2 text-sm text-red-700">{formError}</p>}
            <div><label className="cc-label">Nome do ativo *</label><input value={form.name} onChange={(e) => setForm((p) => ({ ...p, name: e.target.value }))} placeholder="Ex: CDB Banco Inter 110% CDI" className="cc-input" /></div>
            <div><label className="cc-label">Tipo *</label>
              <select value={form.type} onChange={(e) => setForm((p) => ({ ...p, type: e.target.value }))} className="cc-select">
                {Object.entries(INV_TYPES).map(([k, v]) => <option key={k} value={k}>{v}</option>)}
              </select>
            </div>
            <div className="grid gap-4 sm:grid-cols-2">
              <div><label className="cc-label">Valor investido (R$) *</label><input type="number" step="0.01" value={form.investedAmount} onChange={(e) => setForm((p) => ({ ...p, investedAmount: e.target.value }))} className="cc-input" /></div>
              <div><label className="cc-label">Valor atual (R$) *</label><input type="number" step="0.01" value={form.currentValue} onChange={(e) => setForm((p) => ({ ...p, currentValue: e.target.value }))} className="cc-input" /></div>
            </div>
            <div><label className="cc-label">Observações</label><input value={form.notes} onChange={(e) => setForm((p) => ({ ...p, notes: e.target.value }))} placeholder="Opcional..." className="cc-input" /></div>
            <div className="flex gap-2">
              <button type="button" onClick={save} disabled={saving} className="cc-btn text-white text-sm px-4 py-2 rounded-lg disabled:opacity-60" style={{ background: "#4f46e5" }}>{saving ? "Salvando..." : "Salvar"}</button>
              <button type="button" onClick={() => setShowModal(false)} className="cc-btn-ghost">Cancelar</button>
            </div>
          </div>
        </Modal>
      )}
    </section>
  );
}

/* ── METAS FINANCEIRAS ── */

const GOAL_TYPES: Record<string, string> = {
  EMERGENCY: "Reserva de Emergência", TRAVEL: "Viagem", PROPERTY: "Imóvel",
  VEHICLE: "Veículo", EDUCATION: "Educação", RETIREMENT: "Aposentadoria", OTHER: "Outra Meta",
};

type GoalForm = { name: string; type: string; targetAmount: string; currentAmount: string; deadline: string };
const emptyGoalForm: GoalForm = { name: "", type: "OTHER", targetAmount: "", currentAmount: "", deadline: "" };

export function MetasModule() {
  const { store, loading, createGoal, updateGoal, deleteGoal } = useAppStore();
  const [showModal, setShowModal] = useState(false);
  const [editId, setEditId] = useState<string | null>(null);
  const [form, setForm] = useState<GoalForm>(emptyGoalForm);
  const [saving, setSaving] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);

  if (!store) return <div className="flex justify-center py-12 text-zinc-500 text-sm">{loading ? "Carregando..." : "Sem dados."}</div>;

  const goals = store.goals;
  const totalSaved = goals.reduce((a, g) => a + g.currentAmount, 0);
  const totalTarget = goals.reduce((a, g) => a + g.targetAmount, 0);
  const completed = goals.filter((g) => g.currentAmount >= g.targetAmount).length;

  const openNew = () => { setEditId(null); setForm(emptyGoalForm); setFormError(null); setShowModal(true); };
  const openEdit = (id: string) => {
    const g = goals.find((x) => x.id === id);
    if (!g) return;
    setEditId(id);
    setForm({ name: g.name, type: g.type, targetAmount: String(g.targetAmount), currentAmount: String(g.currentAmount), deadline: g.deadline ?? "" });
    setFormError(null); setShowModal(true);
  };

  const save = async () => {
    if (!form.name || !form.targetAmount) { setFormError("Preencha nome e valor alvo."); return; }
    setSaving(true);
    const payload = { name: form.name, type: form.type, targetAmount: Number(form.targetAmount), currentAmount: Number(form.currentAmount) || 0, deadline: form.deadline || undefined };
    try {
      if (editId) await updateGoal(editId, payload);
      else await createGoal(payload);
      setForm(emptyGoalForm); setEditId(null); setFormError(null); setShowModal(false);
    } catch (e) {
      setFormError(e instanceof Error ? e.message : "Erro ao salvar.");
    } finally { setSaving(false); }
  };

  return (
    <section className="space-y-5">
      <PageHeader title="Metas Financeiras" subtitle="Seus objetivos e projetos de poupança" onAdd={openNew} addLabel="Nova Meta" />

      <div className="grid gap-3 sm:grid-cols-3">
        <KpiCard label="Total poupado" value={money(totalSaved)} color="indigo" />
        <KpiCard label="Total necessário" value={money(totalTarget)} color="zinc" />
        <KpiCard label="Metas concluídas" value={`${completed} de ${goals.length}`} color={completed > 0 ? "green" : "zinc"} />
      </div>

      <div className="space-y-3">
        {goals.length === 0 && (
          <div className="flex flex-col items-center justify-center rounded-xl border-2 border-dashed border-zinc-300 bg-white py-16 text-center">
            <p className="text-sm font-medium text-zinc-500">Nenhuma meta cadastrada.</p>
            <p className="text-xs text-zinc-400 mt-1">Clique em &quot;Nova Meta&quot; para começar.</p>
          </div>
        )}
        {goals.map((g) => {
          const pctDone = g.targetAmount > 0 ? Math.min(100, (g.currentAmount / g.targetAmount) * 100) : 0;
          const remaining = g.targetAmount - g.currentAmount;
          const done = g.currentAmount >= g.targetAmount;
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
                <div className="flex gap-2">
                  <button type="button" onClick={() => openEdit(g.id)} className="text-xs text-indigo-600 hover:underline">Editar</button>
                  <button type="button" onClick={() => void deleteGoal(g.id)} className="text-xs text-red-600 hover:underline">Excluir</button>
                </div>
              </div>
              <div className="flex justify-between text-sm mb-2">
                <span className="text-zinc-700">{money(g.currentAmount)} guardado</span>
                <span className="font-semibold text-zinc-900">{money(g.targetAmount)} meta</span>
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
        <Modal title={editId ? "Editar Meta" : "Nova Meta Financeira"} onClose={() => setShowModal(false)}>
          <div className="space-y-4">
            {formError && <p className="rounded-lg bg-red-50 px-3 py-2 text-sm text-red-700">{formError}</p>}
            <div><label className="cc-label">Nome da meta *</label><input value={form.name} onChange={(e) => setForm((p) => ({ ...p, name: e.target.value }))} placeholder="Ex: Reserva de emergência" className="cc-input" /></div>
            <div><label className="cc-label">Tipo</label>
              <select value={form.type} onChange={(e) => setForm((p) => ({ ...p, type: e.target.value }))} className="cc-select">
                {Object.entries(GOAL_TYPES).map(([k, v]) => <option key={k} value={k}>{v}</option>)}
              </select>
            </div>
            <div className="grid gap-4 sm:grid-cols-2">
              <div><label className="cc-label">Valor alvo (R$) *</label><input type="number" step="0.01" value={form.targetAmount} onChange={(e) => setForm((p) => ({ ...p, targetAmount: e.target.value }))} className="cc-input" /></div>
              <div><label className="cc-label">Já guardei (R$)</label><input type="number" step="0.01" value={form.currentAmount} onChange={(e) => setForm((p) => ({ ...p, currentAmount: e.target.value }))} className="cc-input" /></div>
            </div>
            <div><label className="cc-label">Prazo (opcional)</label><input type="date" value={form.deadline} onChange={(e) => setForm((p) => ({ ...p, deadline: e.target.value }))} className="cc-input" /></div>
            <div className="flex gap-2">
              <button type="button" onClick={save} disabled={saving} className="cc-btn text-white text-sm px-4 py-2 rounded-lg disabled:opacity-60" style={{ background: "#4f46e5" }}>{saving ? "Salvando..." : "Salvar Meta"}</button>
              <button type="button" onClick={() => setShowModal(false)} className="cc-btn-ghost">Cancelar</button>
            </div>
          </div>
        </Modal>
      )}
    </section>
  );
}
