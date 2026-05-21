"use client";
import { useState } from "react";
import { useAppStore } from "@/lib/store-context";
import { Modal } from "@/components/ui/modal";
import { documentSchema } from "@/lib/validators";

const DOC_TYPES: Record<string, string> = {
  CONTRACT: "Contrato", INVOICE: "Nota Fiscal", RECEIPT: "Comprovante",
  PROOF_OF_PAYMENT: "Comprovante de Pag.", BOLETO: "Boleto",
  AGREEMENT: "Acordo", OTHER: "Outro",
};

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return <div><label className="cc-label">{label}</label>{children}</div>;
}
function FormRow({ children }: { children: React.ReactNode }) {
  return <div className="grid gap-4 sm:grid-cols-2">{children}</div>;
}
const money = (v: number) => new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" }).format(v);

export function DocumentModule() {
  const { store, loading, createDocument, deleteDocument } = useAppStore();
  const [showModal, setShowModal] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);
  const [search, setSearch] = useState("");

  if (!store) return (
    <section className="space-y-5">
      <div className="flex items-center justify-between">
        <div><h1 className="text-xl font-bold text-zinc-900">Documentos</h1><p className="text-sm text-zinc-500">Contratos, notas fiscais, comprovantes e recibos</p></div>
        <button type="button" onClick={() => setShowModal(true)} className="cc-btn-primary">+ Novo Documento</button>
      </div>
      <div className="flex justify-center py-12 text-zinc-500 text-sm">{loading ? "Carregando..." : "Sem dados."}</div>
    </section>
  );

  const docs = store.documents.filter((d) =>
    !search || d.name.toLowerCase().includes(search.toLowerCase()) ||
    d.type.toLowerCase().includes(search.toLowerCase())
  );

  const handleAdd = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const f = new FormData(e.currentTarget);
    const parsed = documentSchema.safeParse({
      name: f.get("name"), type: f.get("type"),
      url: f.get("url") || undefined, clientId: f.get("clientId") || undefined,
      amount: f.get("amount") || undefined, documentDate: f.get("documentDate") || undefined,
      notes: f.get("notes") || undefined, tags: f.get("tags") || undefined,
    });
    if (!parsed.success) { setFormError(parsed.error.issues[0]?.message ?? "Erro"); return; }
    await createDocument(parsed.data);
    setFormError(null);
    setShowModal(false);
  };

  return (
    <section className="space-y-5">
      <div className="flex items-center justify-between">
        <div><h1 className="text-xl font-bold text-zinc-900">Documentos</h1><p className="text-sm text-zinc-500">Contratos, notas fiscais, comprovantes e recibos</p></div>
        <button type="button" onClick={() => { setFormError(null); setShowModal(true); }} className="cc-btn-primary">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path strokeLinecap="round" d="M12 5v14M5 12h14"/></svg>
          Novo Documento
        </button>
      </div>

      <input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Buscar por nome ou tipo..." className="cc-input max-w-md" />

      {docs.length === 0 ? (
        <div className="flex flex-col items-center justify-center rounded-xl border-2 border-dashed border-zinc-300 bg-white py-16 text-center">
          <p className="text-sm font-medium text-zinc-500">{search ? "Nenhum documento encontrado." : "Nenhum documento cadastrado."}</p>
          <p className="text-xs text-zinc-400 mt-1">Clique em &quot;Novo Documento&quot; para adicionar.</p>
        </div>
      ) : (
        <article className="cc-card overflow-hidden">
          <table className="cc-table">
            <thead><tr>
              <th className="cc-th">Nome</th><th className="cc-th">Tipo</th>
              <th className="cc-th">Data</th><th className="cc-th text-right">Valor</th>
              <th className="cc-th">Link</th><th className="cc-th">Tags</th><th className="cc-th"></th>
            </tr></thead>
            <tbody>
              {docs.map((d) => (
                <tr key={d.id} className="cc-tr">
                  <td className="cc-td font-medium text-zinc-900">{d.name}</td>
                  <td className="cc-td"><span className="inline-flex rounded-full bg-blue-50 px-2.5 py-0.5 text-xs font-semibold text-blue-700">{DOC_TYPES[d.type] ?? d.type}</span></td>
                  <td className="cc-td text-zinc-500">{d.documentDate ?? "-"}</td>
                  <td className="cc-td text-right">{d.amount ? money(d.amount) : "-"}</td>
                  <td className="cc-td">{d.url ? <a href={d.url} target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline text-xs">Abrir</a> : <span className="text-zinc-400 text-xs">-</span>}</td>
                  <td className="cc-td text-xs text-zinc-500">{d.tags.join(", ") || "-"}</td>
                  <td className="cc-td"><button type="button" onClick={() => void deleteDocument(d.id)} className="text-xs text-red-600 hover:underline">Excluir</button></td>
                </tr>
              ))}
            </tbody>
          </table>
        </article>
      )}

      {showModal && (
        <Modal title="Novo Documento" onClose={() => setShowModal(false)}>
          <form onSubmit={handleAdd} className="space-y-4">
            {formError && <p className="rounded-lg bg-red-50 px-3 py-2 text-sm text-red-700">{formError}</p>}
            <Field label="Nome do Documento *"><input name="name" required placeholder="Ex: Contrato Educaminas 2026" className="cc-input" /></Field>
            <FormRow>
              <Field label="Tipo *">
                <select name="type" defaultValue="OTHER" className="cc-select">
                  <option value="CONTRACT">Contrato</option><option value="INVOICE">Nota Fiscal</option>
                  <option value="RECEIPT">Comprovante de Recebimento</option>
                  <option value="PROOF_OF_PAYMENT">Comprovante de Pagamento</option>
                  <option value="BOLETO">Boleto</option><option value="AGREEMENT">Acordo/Aditivo</option>
                  <option value="OTHER">Outro</option>
                </select>
              </Field>
              <Field label="Data do Documento"><input name="documentDate" type="date" className="cc-input" /></Field>
            </FormRow>
            <Field label="URL / Link do arquivo">
              <input name="url" type="url" placeholder="https://drive.google.com/... ou qualquer link" className="cc-input" />
            </Field>
            <FormRow>
              <Field label="Cliente vinculado">
                <select name="clientId" className="cc-select">
                  <option value="">-- Nenhum --</option>
                  {store.clients.map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}
                </select>
              </Field>
              <Field label="Valor (R$)"><input name="amount" type="number" step="0.01" min="0" placeholder="Opcional" className="cc-input" /></Field>
            </FormRow>
            <Field label="Tags (separadas por vírgula)"><input name="tags" placeholder="Ex: contrato, 2026, cliente" className="cc-input" /></Field>
            <Field label="Observações"><textarea name="notes" rows={2} className="cc-input resize-none" placeholder="Opcional..." /></Field>
            <div className="flex gap-3 pt-2">
              <button type="submit" className="cc-btn-primary">Salvar Documento</button>
              <button type="button" onClick={() => setShowModal(false)} className="cc-btn-ghost">Cancelar</button>
            </div>
          </form>
        </Modal>
      )}
    </section>
  );
}
