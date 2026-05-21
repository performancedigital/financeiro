"use client";
import { useState } from "react";
import { useAppStore } from "@/lib/store-context";

const money = (v: number) => new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" }).format(v);

const TEMPLATES = {
  transactions: {
    label: "Transações (entradas e saídas)",
    description: "Importe lançamentos de meses anteriores. Use o nome da conta, não o ID.",
    headers: ["data", "tipo", "descricao", "valor", "conta", "categoria", "centro_custo", "cliente"],
    example: [
      ["2026-01-10", "ENTRADA", "Recebimento Educaminas", "2800", "InfinitePay Empresa", "Receita de cliente", "Agencia", "Educaminas"],
      ["2026-01-15", "SAIDA", "Google Workspace", "190", "InfinitePay Empresa", "Ferramentas", "Agencia", ""],
      ["2026-01-20", "SAIDA", "Equipe de trafego", "6800", "InfinitePay Empresa", "Equipe", "Agencia", ""],
      ["2026-02-10", "ENTRADA", "Recebimento Bias", "2500", "InfinitePay Empresa", "Receita de cliente", "Agencia", "Bias"],
    ],
    notes: [
      "tipo: ENTRADA ou SAIDA (ou INCOME/EXPENSE)",
      "conta: use o nome exato da conta cadastrada",
      "categoria e centro_custo: criados automaticamente se não existirem",
      "cliente: opcional, use o nome exato do cliente cadastrado",
      "valor: apenas números, sem R$ (ex: 2800.50)",
    ],
  },
  accounts: {
    label: "Contas Bancárias",
    description: "Importe suas contas bancárias de uma vez.",
    headers: ["nome", "tipo", "banco", "saldo_inicial"],
    example: [
      ["Sicoob Pessoal", "Pessoal Helbert", "SICOOB", "6200"],
      ["InfinitePay Empresa", "Empresa / Agência", "INFINITEPAY", "12000"],
      ["Nubank Compartilhado", "Casa / Família", "NUBANK", "1500"],
    ],
    notes: [
      "tipo: use o nome exato dos tipos cadastrados em Configurações",
      "banco: use o nome exato dos bancos cadastrados em Configurações",
      "saldo_inicial: saldo atual da conta na data de abertura",
    ],
  },
  clients: {
    label: "Clientes",
    description: "Importe sua carteira de clientes.",
    headers: ["nome", "status", "valor_mensal", "data_inicio"],
    example: [
      ["Educaminas", "ACTIVE", "2800", "2025-06-10"],
      ["Bias Centro Educacional", "ACTIVE", "2500", "2025-08-10"],
      ["Sao Lucas", "ACTIVE", "3200", "2025-03-01"],
      ["Barbeza", "ACTIVE", "2400", "2024-11-15"],
      ["Darcelia", "ACTIVE", "2000", "2025-01-10"],
    ],
    notes: [
      "status: ACTIVE, STANDBY, DELINQUENT, CANCELED ou PROSPECT",
      "valor_mensal: valor mensal contratado em R$",
      "data_inicio: data em que começou o contrato (YYYY-MM-DD)",
    ],
  },
  receivables: {
    label: "Contas a Receber",
    description: "Importe cobranças de meses anteriores.",
    headers: ["cliente", "competencia", "valor_previsto", "valor_recebido", "data_vencimento", "data_recebimento", "status"],
    example: [
      ["Educaminas", "2026-01-01", "2800", "2800", "2026-01-10", "2026-01-10", "PAID"],
      ["Bias", "2026-01-01", "2500", "0", "2026-01-12", "", "OVERDUE"],
      ["Educaminas", "2026-02-01", "2800", "2800", "2026-02-10", "2026-02-09", "PAID"],
    ],
    notes: [
      "cliente: nome do cliente cadastrado",
      "status: PENDING, PAID, PARTIAL, OVERDUE, CANCELED ou RENEGOTIATED",
      "data_recebimento: deixe em branco se não recebeu",
    ],
  },
  payables: {
    label: "Contas a Pagar",
    description: "Importe suas despesas e compromissos.",
    headers: ["descricao", "fornecedor", "categoria", "centro_custo", "valor", "vencimento", "status", "tipo"],
    example: [
      ["Equipe de trafego", "Equipe Performance", "Equipe", "Agencia", "6800", "2026-01-20", "PAID", "FIXED"],
      ["Google Workspace", "Google", "Ferramentas", "Agencia", "190", "2026-01-18", "PAID", "RECURRING"],
      ["OpenAI", "OpenAI", "Ferramentas", "Agencia", "120", "2026-01-05", "PAID", "RECURRING"],
    ],
    notes: [
      "tipo: FIXED, VARIABLE, RECURRING, EXTRAORDINARY, DEBT ou INVESTMENT",
      "status: OPEN, PAID, OVERDUE, INSTALMENT, RENEGOTIATED ou SUSPENDED",
    ],
  },
} as const;

type TemplateKey = keyof typeof TEMPLATES;

function downloadCsv(filename: string, headers: string[], rows: string[][]) {
  const content = [headers.join(","), ...rows.map((r) => r.join(","))].join("\n");
  const blob = new Blob(["\uFEFF" + content], { type: "text/csv;charset=utf-8;" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url; a.download = filename; a.click();
  URL.revokeObjectURL(url);
}

export function ImportModule() {
  const { store, importCsvPreview, importCsvCommit, smartImport } = useAppStore();
  const [activeTemplate, setActiveTemplate] = useState<TemplateKey>("transactions");
  const [csv, setCsv] = useState("");
  const [mode, setMode] = useState<"simple" | "smart">("smart");
  const [replaceAll, setReplaceAll] = useState(false);
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<{
    ok?: boolean; imported?: number; skipped?: number; errors?: string[];
    rows?: number; totals?: Record<string, number>; sample?: Array<Record<string, string>>;
    message?: string;
  } | null>(null);

  const tpl = TEMPLATES[activeTemplate];

  const handleFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (ev) => setCsv(String(ev.target?.result ?? ""));
    reader.readAsText(file, "UTF-8");
  };

  const handleImport = async () => {
    if (!csv.trim()) { setResult({ message: "Cole ou faça upload de um CSV primeiro." }); return; }
    setLoading(true); setResult(null);
    try {
      if (mode === "smart" && activeTemplate === "transactions") {
        const r = await smartImport(csv);
        setResult({ ok: true, ...r });
      } else {
        const r = await importCsvCommit({ kind: activeTemplate, csv, replaceAll });
        setResult({ ok: true, imported: r.importedRows, message: `${r.importedRows} registros importados com sucesso.` });
      }
      setCsv("");
    } catch (e) {
      setResult({ message: (e as { message?: string }).message ?? "Erro na importação." });
    } finally { setLoading(false); }
  };

  const handlePreview = async () => {
    if (!csv.trim()) { setResult({ message: "Cole ou faça upload de um CSV primeiro." }); return; }
    setLoading(true); setResult(null);
    try {
      const r = await importCsvPreview({ kind: activeTemplate, csv, replaceAll });
      setResult({ ok: true, rows: r.rows, totals: r.totals, sample: r.sample, message: `Preview: ${r.rows} linhas encontradas.` });
    } catch (e) {
      setResult({ message: (e as { message?: string }).message ?? "Erro no preview." });
    } finally { setLoading(false); }
  };

  // money used in summary panel
  void money;

  return (
    <section className="space-y-5">
      <div>
        <h1 className="text-xl font-bold text-zinc-900">Importar Dados em Massa</h1>
        <p className="text-sm text-zinc-500">Importe transações, clientes, recebiveis e muito mais via CSV ou planilha</p>
      </div>

      {/* Seleção do tipo */}
      <div className="grid gap-2 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5">
        {(Object.entries(TEMPLATES) as [TemplateKey, typeof TEMPLATES[TemplateKey]][]).map(([key, t]) => (
          <button
            key={key}
            type="button"
            onClick={() => { setActiveTemplate(key); setResult(null); setCsv(""); }}
            className={`rounded-xl border-2 p-3 text-left transition ${activeTemplate === key ? "border-blue-600 bg-blue-50" : "border-zinc-200 bg-white hover:border-zinc-300"}`}
          >
            <p className={`text-sm font-semibold ${activeTemplate === key ? "text-blue-700" : "text-zinc-800"}`}>{t.label}</p>
          </button>
        ))}
      </div>

      <div className="grid gap-5 lg:grid-cols-2">
        {/* Upload e configuração */}
        <article className="cc-card p-5 space-y-4">
          <h2 className="text-sm font-bold text-zinc-900">1. Prepare e faça upload</h2>

          <div className="flex gap-2">
            <button type="button" onClick={() => downloadCsv(`template_${activeTemplate}.csv`, [...tpl.headers], tpl.example.map((r) => [...r]))} className="cc-btn-ghost text-xs">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path strokeLinecap="round" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4"/></svg>
              Baixar Template CSV
            </button>
          </div>

          <div>
            <label className="cc-label">Upload do arquivo CSV</label>
            <input type="file" accept=".csv,.txt,.xls,.xlsx" onChange={handleFile} className="block w-full text-sm text-zinc-600 file:mr-4 file:rounded-lg file:border-0 file:bg-blue-600 file:px-4 file:py-2 file:text-sm file:font-semibold file:text-white hover:file:bg-blue-700 cursor-pointer" />
          </div>

          <div>
            <label className="cc-label">Ou cole o CSV aqui</label>
            <textarea value={csv} onChange={(e) => setCsv(e.target.value)} rows={8} className="cc-input font-mono text-xs resize-y" placeholder={`${tpl.headers.join(",")}\n${tpl.example[0]?.join(",")}`} />
          </div>

          {activeTemplate === "transactions" && (
            <div>
              <label className="cc-label">Modo de importação</label>
              <div className="grid gap-2 sm:grid-cols-2">
                <button type="button" onClick={() => setMode("smart")} className={`rounded-lg border-2 p-3 text-left transition ${mode === "smart" ? "border-blue-600 bg-blue-50" : "border-zinc-200"}`}>
                  <p className="text-sm font-semibold text-blue-700">Inteligente ✦</p>
                  <p className="text-xs text-zinc-500 mt-0.5">Usa nomes de conta/cliente. Detecta duplicatas. Cria categorias automaticamente.</p>
                </button>
                <button type="button" onClick={() => setMode("simple")} className={`rounded-lg border-2 p-3 text-left transition ${mode === "simple" ? "border-blue-600 bg-blue-50" : "border-zinc-200"}`}>
                  <p className="text-sm font-semibold text-zinc-700">Padrão</p>
                  <p className="text-xs text-zinc-500 mt-0.5">Formato técnico com IDs. Mais controle total.</p>
                </button>
              </div>
            </div>
          )}

          {activeTemplate !== "transactions" && (
            <label className="flex items-center gap-2 text-sm text-zinc-700 cursor-pointer">
              <input type="checkbox" checked={replaceAll} onChange={(e) => setReplaceAll(e.target.checked)} />
              <span>Substituir todos os dados existentes deste tipo</span>
            </label>
          )}

          <div className="flex gap-2 flex-wrap">
            <button type="button" onClick={handlePreview} disabled={loading} className="cc-btn-ghost">
              {loading ? "..." : "Pré-visualizar"}
            </button>
            <button type="button" onClick={handleImport} disabled={loading} className="cc-btn-primary">
              {loading ? "Importando..." : "Importar para o Banco"}
            </button>
          </div>

          {result && (
            <div className={`rounded-xl border p-4 ${result.imported !== undefined && !result.message?.includes("Erro") ? "bg-emerald-50 border-emerald-200" : "bg-amber-50 border-amber-200"}`}>
              {result.message && <p className="text-sm font-medium text-zinc-800">{result.message}</p>}
              {result.imported !== undefined && <p className="text-sm text-emerald-700 mt-1">✓ {result.imported} importados</p>}
              {result.skipped !== undefined && result.skipped > 0 && <p className="text-sm text-zinc-500">↳ {result.skipped} ignorados (duplicatas)</p>}
              {result.errors && result.errors.length > 0 && (
                <div className="mt-2">
                  <p className="text-xs font-semibold text-red-700">Erros:</p>
                  {result.errors.slice(0, 5).map((e, i) => <p key={i} className="text-xs text-red-600">{e}</p>)}
                </div>
              )}
            </div>
          )}
        </article>

        {/* Template e instruções */}
        <article className="cc-card p-5 space-y-4">
          <h2 className="text-sm font-bold text-zinc-900">2. Formato esperado — {tpl.label}</h2>
          <p className="text-sm text-zinc-600">{tpl.description}</p>

          <div>
            <p className="cc-label">Colunas obrigatórias</p>
            <div className="flex flex-wrap gap-1">
              {tpl.headers.map((h) => (
                <span key={h} className="rounded bg-zinc-900 px-2 py-0.5 font-mono text-xs text-emerald-300">{h}</span>
              ))}
            </div>
          </div>

          <div>
            <p className="cc-label">Exemplo de dados</p>
            <div className="overflow-auto rounded-lg bg-zinc-900 p-3">
              <p className="font-mono text-xs text-zinc-400">{tpl.headers.join(",")}</p>
              {tpl.example.map((row, i) => (
                <p key={i} className="font-mono text-xs text-emerald-300">{row.join(",")}</p>
              ))}
            </div>
          </div>

          <div>
            <p className="cc-label">Regras importantes</p>
            <ul className="space-y-1">
              {tpl.notes.map((note, i) => (
                <li key={i} className="flex items-start gap-2 text-xs text-zinc-600">
                  <span className="mt-0.5 text-blue-500">•</span>
                  <span>{note}</span>
                </li>
              ))}
            </ul>
          </div>

          {result?.sample && result.sample.length > 0 && (
            <div>
              <p className="cc-label">Preview (primeiras linhas)</p>
              <div className="overflow-auto rounded-lg border border-zinc-200">
                <table className="min-w-full text-xs">
                  <thead><tr className="bg-zinc-50">{Object.keys(result.sample[0]).map((k) => <th key={k} className="px-2 py-1 text-left text-zinc-500">{k}</th>)}</tr></thead>
                  <tbody>{result.sample.map((row, i) => <tr key={i}>{Object.values(row).map((v, j) => <td key={j} className="px-2 py-1 border-t border-zinc-100">{v}</td>)}</tr>)}</tbody>
                </table>
              </div>
            </div>
          )}

          {store && (
            <div className="rounded-xl bg-zinc-50 p-4">
              <p className="text-xs font-semibold text-zinc-700 mb-2">Dados atuais no banco</p>
              <div className="grid grid-cols-2 gap-1 text-xs text-zinc-600">
                <span>Contas: {store.accounts.length}</span>
                <span>Clientes: {store.clients.length}</span>
                <span>Transações: {store.transactions.length}</span>
                <span>A Receber: {store.receivables.length}</span>
                <span>A Pagar: {store.payables.length}</span>
                <span>Dívidas: {store.debts.length}</span>
              </div>
            </div>
          )}
        </article>
      </div>
    </section>
  );
}
