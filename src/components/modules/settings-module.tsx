"use client";

import { useState } from "react";
import { useAppStore } from "@/lib/store-context";

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <article className="cc-card overflow-hidden">
      <div className="border-b border-zinc-100 px-5 py-4">
        <h3 className="text-sm font-bold text-zinc-900">{title}</h3>
      </div>
      <div className="p-5">{children}</div>
    </article>
  );
}

export function SettingsModule() {
  const { store, loading, createCategory, deleteCategory, createCostCenter, deleteCostCenter } = useAppStore();
  const [catName, setCatName] = useState("");
  const [catIsIncome, setCatIsIncome] = useState(false);
  const [ccName, setCcName] = useState("");
  const [msg, setMsg] = useState<string | null>(null);

  if (!store) return (
    <div className="flex justify-center py-12 text-zinc-500 text-sm">
      {loading ? "Carregando..." : "Sem dados."}
    </div>
  );

  const addCat = async () => {
    if (!catName.trim()) return;
    try {
      await createCategory(catName.trim(), catIsIncome);
      setCatName("");
      setMsg("Categoria criada.");
    } catch { setMsg("Erro ao criar categoria."); }
  };

  const addCc = async () => {
    if (!ccName.trim()) return;
    try {
      await createCostCenter(ccName.trim());
      setCcName("");
      setMsg("Centro de custo criado.");
    } catch { setMsg("Erro ao criar centro de custo."); }
  };

  return (
    <section className="space-y-5">
      <div>
        <h1 className="text-xl font-bold text-zinc-900">Configurações</h1>
        <p className="text-sm text-zinc-500">Gerencie categorias, centros de custo e preferências do workspace</p>
      </div>

      {msg && <p className="rounded-lg bg-blue-50 border border-blue-200 px-3 py-2 text-sm text-blue-700">{msg}</p>}

      <Section title="Categorias">
        <div className="flex gap-2 mb-4">
          <input
            value={catName}
            onChange={(e) => setCatName(e.target.value)}
            placeholder="Nova categoria..."
            className="cc-input flex-1"
          />
          <label className="flex items-center gap-2 text-sm text-zinc-700 whitespace-nowrap">
            <input type="checkbox" checked={catIsIncome} onChange={(e) => setCatIsIncome(e.target.checked)} />
            Receita
          </label>
          <button type="button" onClick={addCat} className="cc-btn-primary">Adicionar</button>
        </div>
        <div className="space-y-1">
          {store.categories.length === 0 && (
            <p className="text-sm text-zinc-500">Nenhuma categoria cadastrada. As categorias são criadas automaticamente ao lançar transações.</p>
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

      <Section title="Centros de Custo">
        <div className="flex gap-2 mb-4">
          <input
            value={ccName}
            onChange={(e) => setCcName(e.target.value)}
            placeholder="Novo centro de custo..."
            className="cc-input flex-1"
          />
          <button type="button" onClick={addCc} className="cc-btn-primary">Adicionar</button>
        </div>
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

      <Section title="Sobre este workspace">
        <div className="space-y-2 text-sm text-zinc-700">
          <p><strong>Contas:</strong> {store.accounts.length}</p>
          <p><strong>Clientes:</strong> {store.clients.length}</p>
          <p><strong>Transações:</strong> {store.transactions.length}</p>
          <p><strong>Categorias:</strong> {store.categories.length}</p>
          <p><strong>Centros de custo:</strong> {store.costCenters.length}</p>
        </div>
      </Section>
    </section>
  );
}
