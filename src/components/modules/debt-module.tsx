"use client";
import { useState } from "react";
import { useAppStore } from "@/lib/store-context";
import { Modal } from "@/components/ui/modal";
import { debtSchema } from "@/lib/validators";
import type { DebtRow } from "@/lib/db-types";

const money = (v: number) => new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" }).format(v);
const pct = (v: number) => `${v.toFixed(2)}% a.m.`;

const STATUS_LABELS: Record<string, { label: string; color: string }> = {
  ON_TIME:     { label: "Em dia",       color: "text-emerald-700 bg-emerald-50" },
  LATE:        { label: "Atrasada",     color: "text-red-700 bg-red-50" },
  RENEGOTIATED:{ label: "Renegociada",  color: "text-amber-700 bg-amber-50" },
  PAID_OFF:    { label: "Quitada",      color: "text-zinc-500 bg-zinc-100" },
};

const TYPE_LABELS: Record<string, string> = {
  BANK: "Banco", CREDIT_CARD: "Cartão", FAMILY: "Familiar",
  SUPPLIER: "Fornecedor", TAX: "Imposto", LOAN: "Empréstimo",
  WORKING_CAPITAL: "Capital de Giro", OTHER: "Outro",
};

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return <div><label className="cc-label">{label}</label>{children}</div>;
}
function FormRow({ children }: { children: React.ReactNode }) {
  return <div className="grid gap-4 sm:grid-cols-2">{children}</div>;
}

export function DebtModule() {
  const { store, loading, createDebt, updateDebt, deleteDebt } = useAppStore();
  const [showModal, setShowModal] = useState(false);
  const [editDebt, setEditDebt] = useState<DebtRow | null>(null);
  const [formError, setFormError] = useState<string | null>(null);

  const openNew = () => { setEditDebt(null); setFormError(null); setShowModal(true); };
  const openEdit = (d: DebtRow) => { setEditDebt(d); setFormError(null); setShowModal(true); };

  if (!store) return (
    <section className="space-y-5">
      <div className="flex items-center justify-between">
        <div><h1 className="text-xl font-bold text-zinc-900">Dívidas & Empréstimos</h1><p className="text-sm text-zinc-500">Controle seus débitos, financiamentos e parcelas</p></div>
        <button type="button" onClick={openNew} className="cc-btn-primary"><svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path strokeLinecap="round" d="M12 5v14M5 12h14"/></svg>Nova Dívida</button>
      </div>
      <div className="flex justify-center py-12 text-zinc-500 text-sm">{loading ? "Carregando..." : "Sem dados."}</div>
    </section>
  );

  const debts = store.debts;
  const totalOutstanding = debts.filter((d) => d.status !== "PAID_OFF").reduce((a, d) => a + d.outstandingAmount, 0);
  const overdue = debts.filter((d) => d.status === "LATE").length;

  const handleAdd = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const f = new FormData(e.currentTarget);
    const parsed = debtSchema.safeParse({
      creditor: f.get("creditor"), type: f.get("type"),
      originalAmount: f.get("originalAmount"), outstandingAmount: f.get("outstandingAmount"),
      monthlyRate: f.get("monthlyRate") || undefined,
      dueDate: f.get("dueDate") || undefined,
      totalInstalments: f.get("totalInstalments") || undefined,
      paidInstalments: f.get("paidInstalments") || 0,
      status: f.get("status"), notes: f.get("notes") || undefined,
    });
    if (!parsed.success) { setFormError(parsed.error.issues[0]?.message ?? "Erro"); return; }
    if (editDebt) await updateDebt(editDebt.id, parsed.data);
    else await createDebt(parsed.data);
    setFormError(null);
    setEditDebt(null);
    setShowModal(false);
  };

  return (
    <section className="space-y-5">
      <div className="flex items-center justify-between">
        <div><h1 className="text-xl font-bold text-zinc-900">Dívidas & Empréstimos</h1><p className="text-sm text-zinc-500">Controle seus débitos, financiamentos e parcelas</p></div>
        <button type="button" onClick={openNew} className="cc-btn-primary">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path strokeLinecap="round" d="M12 5v14M5 12h14"/></svg>
          Nova Dívida
        </button>
      </div>

      <div className="grid gap-3 sm:grid-cols-3">
        <article className="cc-card p-5"><p className="text-xs font-semibold uppercase tracking-wide text-zinc-500">Dívida Total</p><p className="mt-2 text-2xl font-bold text-red-700">{money(totalOutstanding)}</p></article>
        <article className="cc-card p-5"><p className="text-xs font-semibold uppercase tracking-wide text-zinc-500">Em Atraso</p><p className="mt-2 text-2xl font-bold text-amber-700">{overdue}</p></article>
        <article className="cc-card p-5"><p className="text-xs font-semibold uppercase tracking-wide text-zinc-500">Registros</p><p className="mt-2 text-2xl font-bold text-zinc-900">{debts.length}</p></article>
      </div>

      {debts.length === 0 ? (
        <div className="flex flex-col items-center justify-center rounded-xl border-2 border-dashed border-zinc-300 bg-white py-16 text-center">
          <p className="text-sm font-medium text-zinc-500">Nenhuma dívida cadastrada.</p>
          <p className="text-xs text-zinc-400 mt-1">Clique em &quot;Nova Dívida&quot; para adicionar.</p>
        </div>
      ) : (
        <article className="cc-card overflow-hidden">
          <table className="cc-table">
            <thead><tr>
              <th className="cc-th">Credor</th><th className="cc-th">Tipo</th>
              <th className="cc-th text-right">Original</th><th className="cc-th text-right">Saldo Devedor</th>
              <th className="cc-th">Taxa</th><th className="cc-th">Vencimento</th>
              <th className="cc-th">Parcelas</th><th className="cc-th">Status</th><th className="cc-th"></th>
            </tr></thead>
            <tbody>
              {debts.map((d) => {
                const st = STATUS_LABELS[d.status] ?? { label: d.status, color: "text-zinc-700 bg-zinc-100" };
                return (
                  <tr key={d.id} className="cc-tr">
                    <td className="cc-td font-semibold">{d.creditor}</td>
                    <td className="cc-td text-zinc-500">{TYPE_LABELS[d.type] ?? d.type}</td>
                    <td className="cc-td text-right">{money(d.originalAmount)}</td>
                    <td className="cc-td text-right font-semibold text-red-700">{money(d.outstandingAmount)}</td>
                    <td className="cc-td text-zinc-500">{d.monthlyRate ? pct(d.monthlyRate) : "-"}</td>
                    <td className="cc-td text-zinc-500">{d.dueDate ?? "-"}</td>
                    <td className="cc-td text-zinc-500">{d.totalInstalments ? `${d.paidInstalments}/${d.totalInstalments}` : "-"}</td>
                    <td className="cc-td"><span className={`inline-flex rounded-full px-2.5 py-0.5 text-xs font-semibold ${st.color}`}>{st.label}</span></td>
                    <td className="cc-td">
                      <div className="flex gap-2">
                        <button type="button" onClick={() => openEdit(d)} className="text-xs text-blue-600 hover:underline">Editar</button>
                        <button type="button" onClick={() => void deleteDebt(d.id)} className="text-xs text-red-600 hover:underline">Excluir</button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </article>
      )}

      {showModal && (
        <Modal title={editDebt ? "Editar Dívida / Empréstimo" : "Nova Dívida / Empréstimo"} onClose={() => { setShowModal(false); setEditDebt(null); }}>
          <form onSubmit={handleAdd} className="space-y-4">
            {formError && <p className="rounded-lg bg-red-50 px-3 py-2 text-sm text-red-700">{formError}</p>}
            <FormRow>
              <Field label="Credor *"><input name="creditor" required defaultValue={editDebt?.creditor ?? ""} placeholder="Ex: Banco Bradesco" className="cc-input" /></Field>
              <Field label="Tipo *">
                <select name="type" defaultValue={editDebt?.type ?? "LOAN"} className="cc-select">
                  <option value="BANK">Banco</option><option value="CREDIT_CARD">Cartão de Crédito</option>
                  <option value="FAMILY">Familiar</option><option value="SUPPLIER">Fornecedor</option>
                  <option value="TAX">Imposto / Tributário</option><option value="LOAN">Empréstimo Pessoal</option>
                  <option value="WORKING_CAPITAL">Capital de Giro</option><option value="OTHER">Outro</option>
                </select>
              </Field>
            </FormRow>
            <FormRow>
              <Field label="Valor Original (R$) *"><input name="originalAmount" type="number" step="0.01" min="0.01" required defaultValue={editDebt ? String(editDebt.originalAmount) : ""} className="cc-input" /></Field>
              <Field label="Saldo Devedor Atual (R$) *"><input name="outstandingAmount" type="number" step="0.01" min="0" required defaultValue={editDebt ? String(editDebt.outstandingAmount) : ""} className="cc-input" /></Field>
            </FormRow>
            <FormRow>
              <Field label="Taxa Mensal (%)"><input name="monthlyRate" type="number" step="0.01" min="0" defaultValue={editDebt?.monthlyRate != null ? String(editDebt.monthlyRate) : ""} placeholder="Ex: 2.5" className="cc-input" /></Field>
              <Field label="Vencimento"><input name="dueDate" type="date" defaultValue={editDebt?.dueDate ?? ""} className="cc-input" /></Field>
            </FormRow>
            <FormRow>
              <Field label="Total de Parcelas"><input name="totalInstalments" type="number" min="1" defaultValue={editDebt?.totalInstalments != null ? String(editDebt.totalInstalments) : ""} className="cc-input" /></Field>
              <Field label="Parcelas Pagas"><input name="paidInstalments" type="number" min="0" defaultValue={editDebt ? String(editDebt.paidInstalments) : "0"} className="cc-input" /></Field>
            </FormRow>
            <FormRow>
              <Field label="Status *">
                <select name="status" defaultValue={editDebt?.status ?? "ON_TIME"} className="cc-select">
                  <option value="ON_TIME">Em dia</option><option value="LATE">Atrasada</option>
                  <option value="RENEGOTIATED">Renegociada</option><option value="PAID_OFF">Quitada</option>
                </select>
              </Field>
              <Field label="Observações"><input name="notes" defaultValue={editDebt?.notes ?? ""} placeholder="Opcional..." className="cc-input" /></Field>
            </FormRow>
            <div className="flex gap-3 pt-2">
              <button type="submit" className="cc-btn-primary">{editDebt ? "Salvar Alterações" : "Salvar Dívida"}</button>
              <button type="button" onClick={() => { setShowModal(false); setEditDebt(null); }} className="cc-btn-ghost">Cancelar</button>
            </div>
          </form>
        </Modal>
      )}
    </section>
  );
}
