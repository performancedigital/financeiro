"use client";

import { useState } from "react";
import { useAppStore } from "@/lib/store-context";

function Section({ title, subtitle, children }: { title: string; subtitle?: string; children: React.ReactNode }) {
  return (
    <article className="cc-card overflow-hidden">
      <div className="border-b border-zinc-100 px-5 py-4">
        <h3 className="text-sm font-bold text-zinc-900">{title}</h3>
        {subtitle && <p className="text-xs text-zinc-500 mt-0.5">{subtitle}</p>}
      </div>
      <div className="p-5">{children}</div>
    </article>
  );
}

function OptionList({
  items,
  onDelete,
}: {
  items: Array<{ id: string; label: string; value: string }>;
  onDelete: (id: string) => void;
}) {
  if (items.length === 0)
    return <p className="text-sm text-zinc-500">Nenhuma opção cadastrada.</p>;
  return (
    <div className="space-y-1">
      {items.map((item) => (
        <div key={item.id} className="flex items-center justify-between rounded-lg bg-zinc-50 px-3 py-2">
          <div>
            <span className="text-sm font-medium text-zinc-800">{item.label}</span>
            <span className="ml-2 text-xs text-zinc-400">{item.value}</span>
          </div>
          <button
            type="button"
            onClick={() => onDelete(item.id)}
            className="text-xs text-red-600 hover:underline"
          >
            Excluir
          </button>
        </div>
      ))}
    </div>
  );
}

function AddOptionForm({
  onAdd,
  placeholder,
}: {
  onAdd: (label: string) => Promise<void>;
  placeholder: string;
}) {
  const [label, setLabel] = useState("");
  const [loading, setLoading] = useState(false);

  const handleAdd = async () => {
    if (!label.trim()) return;
    setLoading(true);
    try {
      await onAdd(label.trim());
      setLabel("");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex gap-2 mb-4">
      <input
        value={label}
        onChange={(e) => setLabel(e.target.value)}
        onKeyDown={(e) => { if (e.key === "Enter") void handleAdd(); }}
        placeholder={placeholder}
        className="cc-input flex-1"
      />
      <button type="button" onClick={handleAdd} disabled={loading} className="cc-btn-primary">
        {loading ? "..." : "Adicionar"}
      </button>
    </div>
  );
}

export function SettingsModule() {
  const {
    store,
    loading,
    createCategory,
    deleteCategory,
    createCostCenter,
    deleteCostCenter,
    createWorkspaceOption,
    deleteWorkspaceOption,
  } = useAppStore();

  const [msg, setMsg] = useState<{ type: "ok" | "err"; text: string } | null>(null);

  if (!store) return (
    <div className="flex justify-center py-12 text-zinc-500 text-sm">
      {loading ? "Carregando..." : "Sem dados."}
    </div>
  );

  const accountTypeOpts = store.workspaceOptions.filter((o) => o.kind === "ACCOUNT_TYPE");
  const institutionOpts = store.workspaceOptions.filter((o) => o.kind === "INSTITUTION");

  const notify = (text: string, type: "ok" | "err" = "ok") => {
    setMsg({ type, text });
    setTimeout(() => setMsg(null), 3000);
  };

  const handleAddAccountType = async (label: string) => {
    try {
      await createWorkspaceOption("ACCOUNT_TYPE", label, label);
      notify("Tipo de caixa adicionado.");
    } catch { notify("Erro ao adicionar.", "err"); }
  };

  const handleAddInstitution = async (label: string) => {
    try {
      await createWorkspaceOption("INSTITUTION", label, label);
      notify("Instituição adicionada.");
    } catch { notify("Erro ao adicionar.", "err"); }
  };

  const handleAddCategory = async (label: string, isIncome: boolean) => {
    try {
      await createCategory(label, isIncome);
      notify("Categoria adicionada.");
    } catch { notify("Erro ao adicionar.", "err"); }
  };

  const handleAddCostCenter = async (label: string) => {
    try {
      await createCostCenter(label);
      notify("Centro de custo adicionado.");
    } catch { notify("Erro ao adicionar.", "err"); }
  };

  return (
    <section className="space-y-5">
      <div>
        <h1 className="text-xl font-bold text-zinc-900">Configurações</h1>
        <p className="text-sm text-zinc-500">Gerencie as opções dos formulários e preferências do workspace</p>
      </div>

      {msg && (
        <p className={`rounded-lg border px-3 py-2 text-sm ${msg.type === "ok" ? "bg-emerald-50 border-emerald-200 text-emerald-700" : "bg-red-50 border-red-200 text-red-700"}`}>
          {msg.text}
        </p>
      )}

      {/* Tipos de caixa */}
      <Section
        title="Tipos de Caixa"
        subtitle="Aparece no campo 'Tipo de Caixa' ao criar uma conta. Ex: Pessoal Helbert, Empresa, Casa..."
      >
        <AddOptionForm onAdd={handleAddAccountType} placeholder="Ex: Capital de Giro, Investimento..." />
        <OptionList
          items={accountTypeOpts.map((o) => ({ id: o.id, label: o.label, value: o.value }))}
          onDelete={(id) => void deleteWorkspaceOption(id)}
        />
      </Section>

      {/* Instituições / Bancos */}
      <Section
        title="Bancos e Instituições"
        subtitle="Aparece no campo 'Banco / Instituição' ao criar uma conta. Ex: Sicoob, Nubank, BTG..."
      >
        <AddOptionForm onAdd={handleAddInstitution} placeholder="Ex: BTG Empresas, XP, Cora..." />
        <OptionList
          items={institutionOpts.map((o) => ({ id: o.id, label: o.label, value: o.value }))}
          onDelete={(id) => void deleteWorkspaceOption(id)}
        />
      </Section>

      {/* Categorias */}
      <Section
        title="Categorias de Transação"
        subtitle="Aparece nos formulários de Transação e Pagamento."
      >
        <CatForm onAdd={handleAddCategory} />
        <div className="space-y-1">
          {store.categories.length === 0 && (
            <p className="text-sm text-zinc-500">Nenhuma categoria. São criadas automaticamente ao lançar transações ou manualmente aqui.</p>
          )}
          {store.categories.map((c) => (
            <div key={c.id} className="flex items-center justify-between rounded-lg bg-zinc-50 px-3 py-2">
              <div className="flex items-center gap-2">
                <div className="h-3 w-3 rounded-full" style={{ background: c.color ?? (c.isIncome ? "#16a34a" : "#dc2626") }} />
                <span className="text-sm font-medium text-zinc-800">{c.name}</span>
                <span className="text-xs text-zinc-500">{c.isIncome ? "Receita" : "Despesa"}</span>
              </div>
              <button type="button" onClick={() => void deleteCategory(c.id)} className="text-xs text-red-600 hover:underline">Excluir</button>
            </div>
          ))}
        </div>
      </Section>

      {/* Centros de custo */}
      <Section
        title="Centros de Custo"
        subtitle="Aparece nos formulários de Transação e Pagamento."
      >
        <AddOptionForm onAdd={handleAddCostCenter} placeholder="Ex: Agência, Pessoal Helbert, Projeto X..." />
        <div className="space-y-1">
          {store.costCenters.length === 0 && (
            <p className="text-sm text-zinc-500">Nenhum centro de custo cadastrado.</p>
          )}
          {store.costCenters.map((c) => (
            <div key={c.id} className="flex items-center justify-between rounded-lg bg-zinc-50 px-3 py-2">
              <span className="text-sm font-medium text-zinc-800">{c.name}</span>
              <button type="button" onClick={() => void deleteCostCenter(c.id)} className="text-xs text-red-600 hover:underline">Excluir</button>
            </div>
          ))}
        </div>
      </Section>

      {/* Resumo do workspace */}
      <Section title="Resumo do Workspace">
        <div className="grid gap-2 sm:grid-cols-3 text-sm">
          {[
            ["Contas", store.accounts.length],
            ["Clientes", store.clients.length],
            ["Transações", store.transactions.length],
            ["Recebiveis", store.receivables.length],
            ["Pagamentos", store.payables.length],
            ["Categorias", store.categories.length],
            ["Centros de custo", store.costCenters.length],
            ["Tipos de caixa", accountTypeOpts.length],
            ["Instituições", institutionOpts.length],
          ].map(([k, v]) => (
            <div key={String(k)} className="rounded-lg bg-zinc-50 px-3 py-2">
              <p className="text-xs text-zinc-500">{k}</p>
              <p className="text-lg font-bold text-zinc-900">{v}</p>
            </div>
          ))}
        </div>
      </Section>
    </section>
  );
}

function CatForm({ onAdd }: { onAdd: (label: string, isIncome: boolean) => Promise<void> }) {
  const [label, setLabel] = useState("");
  const [isIncome, setIsIncome] = useState(false);
  const [loading, setLoading] = useState(false);

  const handle = async () => {
    if (!label.trim()) return;
    setLoading(true);
    try {
      await onAdd(label.trim(), isIncome);
      setLabel("");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex flex-wrap gap-2 mb-4 items-center">
      <input value={label} onChange={(e) => setLabel(e.target.value)} onKeyDown={(e) => { if (e.key === "Enter") void handle(); }} placeholder="Nova categoria..." className="cc-input flex-1 min-w-[180px]" />
      <label className="flex items-center gap-2 text-sm text-zinc-700 whitespace-nowrap cursor-pointer">
        <input type="checkbox" checked={isIncome} onChange={(e) => setIsIncome(e.target.checked)} />
        É receita
      </label>
      <button type="button" onClick={handle} disabled={loading} className="cc-btn-primary">
        {loading ? "..." : "Adicionar"}
      </button>
    </div>
  );
}
