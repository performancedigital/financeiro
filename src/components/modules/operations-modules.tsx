"use client";

import { useMemo, useState } from "react";
import { useAppStore } from "@/lib/use-app-store";
import {
  accountSchema,
  clientSchema,
  contractSchema,
  payableSchema,
  receivableSchema,
  transactionSchema,
} from "@/lib/validators";
import { Modal } from "@/components/ui/modal";
import { Badge, clientStatusBadge, payableStatusBadge, receivableStatusBadge } from "@/components/ui/badge";

const money = (v: number) =>
  new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" }).format(v);

const today = () => new Date().toISOString().slice(0, 10);

function EmptyState({ message }: { message: string }) {
  return (
    <div className="flex flex-col items-center justify-center rounded-xl border-2 border-dashed border-zinc-300 bg-white py-16 text-center">
      <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="#a1a1aa" strokeWidth="1.5" className="mb-3">
        <path strokeLinecap="round" strokeLinejoin="round" d="M9 13h6m-3-3v6m5 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
      </svg>
      <p className="text-sm font-medium text-zinc-500">{message}</p>
      <p className="text-xs text-zinc-400 mt-1">Clique no botão acima para adicionar.</p>
    </div>
  );
}

function PageHeader({ title, subtitle, onAdd, addLabel }: { title: string; subtitle: string; onAdd?: () => void; addLabel?: string }) {
  return (
    <div className="flex items-center justify-between">
      <div>
        <h1 className="text-xl font-bold text-zinc-900">{title}</h1>
        <p className="text-sm text-zinc-500">{subtitle}</p>
      </div>
      {onAdd ? (
        <button type="button" onClick={onAdd} className="cc-btn-primary">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
            <path strokeLinecap="round" d="M12 5v14M5 12h14"/>
          </svg>
          {addLabel ?? "Novo"}
        </button>
      ) : null}
    </div>
  );
}

function FormRow({ children }: { children: React.ReactNode }) {
  return <div className="grid gap-4 sm:grid-cols-2">{children}</div>;
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div>
      <label className="cc-label">{label}</label>
      {children}
    </div>
  );
}

/* ══════════════ CONTAS + TRANSAÇÕES ══════════════ */
export function AccountsModule() {
  const { store, loading, error: storeErr, createAccount, deleteAccount, createTransaction, deleteTransaction } = useAppStore();
  const [showAccModal, setShowAccModal] = useState(false);
  const [showTxModal, setShowTxModal] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);
  const [tab, setTab] = useState<"accounts" | "transactions">("accounts");

  const handleAccount = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const f = new FormData(e.currentTarget);
    const parsed = accountSchema.safeParse({
      name: f.get("name"),
      type: f.get("type"),
      institution: f.get("institution"),
      balance: Number(f.get("balance") ?? 0),
    });
    if (!parsed.success) { setFormError(parsed.error.issues[0]?.message ?? "Erro"); return; }
    await createAccount(parsed.data);
    setFormError(null);
    setShowAccModal(false);
  };

  const handleTx = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const f = new FormData(e.currentTarget);
    const parsed = transactionSchema.safeParse({
      date: f.get("date"),
      direction: f.get("direction"),
      description: f.get("description"),
      amount: Number(f.get("amount") ?? 0),
      accountId: f.get("accountId"),
      category: f.get("category"),
      costCenter: f.get("costCenter"),
      clientId: (f.get("clientId") as string) || undefined,
    });
    if (!parsed.success) { setFormError(parsed.error.issues[0]?.message ?? "Erro"); return; }
    const r = await createTransaction(parsed.data);
    if (r?.duplicate) { setFormError("Transação duplicada detectada."); return; }
    setFormError(null);
    setShowTxModal(false);
  };

  const totalBalance = store?.accounts.reduce((a, x) => a + x.balance, 0) ?? 0;
  const income = store?.transactions.filter((t) => t.direction === "INCOME").reduce((a, t) => a + t.amount, 0) ?? 0;
  const expense = store?.transactions.filter((t) => t.direction === "EXPENSE").reduce((a, t) => a + t.amount, 0) ?? 0;

  return (
    <section className="space-y-5">
      <PageHeader
        title="Contas & Transações"
        subtitle="Gerencie suas contas bancárias e lançamentos financeiros"
        onAdd={() => { setFormError(null); tab === "accounts" ? setShowAccModal(true) : setShowTxModal(true); }}
        addLabel={tab === "accounts" ? "Nova Conta" : "Nova Transação"}
      />

      {storeErr && <div className="rounded-lg bg-red-50 px-3 py-2 text-sm text-red-700">{storeErr.message}</div>}

      <div className="grid gap-3 sm:grid-cols-3">
        <article className="cc-card p-5">
          <p className="text-xs font-semibold uppercase tracking-wide text-zinc-500">Saldo Total (inicial)</p>
          <p className="mt-2 text-2xl font-bold text-blue-700">{money(totalBalance)}</p>
        </article>
        <article className="cc-card p-5">
          <p className="text-xs font-semibold uppercase tracking-wide text-zinc-500">Total Entradas</p>
          <p className="mt-2 text-2xl font-bold text-emerald-700">{money(income)}</p>
        </article>
        <article className="cc-card p-5">
          <p className="text-xs font-semibold uppercase tracking-wide text-zinc-500">Total Saídas</p>
          <p className="mt-2 text-2xl font-bold text-red-700">{money(expense)}</p>
        </article>
      </div>

      <div className="flex gap-1 border-b border-zinc-200">
        <button type="button" onClick={() => setTab("accounts")} className={`px-4 py-2 text-sm font-medium transition ${tab === "accounts" ? "border-b-2 border-blue-600 text-blue-600" : "text-zinc-500 hover:text-zinc-900"}`}>
          Contas ({store?.accounts.length ?? 0})
        </button>
        <button type="button" onClick={() => setTab("transactions")} className={`px-4 py-2 text-sm font-medium transition ${tab === "transactions" ? "border-b-2 border-blue-600 text-blue-600" : "text-zinc-500 hover:text-zinc-900"}`}>
          Transações ({store?.transactions.length ?? 0})
        </button>
      </div>

      {!store ? (
        <div className="flex items-center justify-center rounded-xl border-2 border-dashed border-zinc-200 bg-white py-16">
          <p className="text-sm text-zinc-500">{loading ? "Carregando dados..." : "Nenhum dado encontrado. Adicione sua primeira conta acima."}</p>
        </div>
      ) : (
        <>
          {tab === "accounts" && (
            <>
              {store.accounts.length === 0 ? <EmptyState message="Nenhuma conta cadastrada." /> : (
                <article className="cc-card overflow-hidden">
                  <table className="w-full">
                    <thead>
                      <tr>
                        <th className="cc-th">Conta</th>
                        <th className="cc-th">Tipo de Caixa</th>
                        <th className="cc-th">Instituição</th>
                        <th className="cc-th text-right">Saldo Inicial</th>
                        <th className="cc-th"></th>
                      </tr>
                    </thead>
                    <tbody>
                      {store.accounts.map((a) => (
                        <tr key={a.id} className="cc-tr">
                          <td className="cc-td font-semibold text-zinc-900">{a.name}</td>
                          <td className="cc-td"><Badge label={a.type.replaceAll("_", " ")} variant="blue" /></td>
                          <td className="cc-td text-zinc-500">{a.institution}</td>
                          <td className="cc-td text-right font-semibold">{money(a.balance)}</td>
                          <td className="cc-td">
                            <button type="button" onClick={() => void deleteAccount(a.id)} className="text-xs text-red-600 hover:underline">Excluir</button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </article>
              )}
            </>
          )}

          {tab === "transactions" && (
            <>
              {store.transactions.length === 0 ? <EmptyState message="Nenhuma transação lançada." /> : (
                <article className="cc-card overflow-hidden">
                  <table className="w-full">
                    <thead>
                      <tr>
                        <th className="cc-th">Data</th>
                        <th className="cc-th">Tipo</th>
                        <th className="cc-th">Descrição</th>
                        <th className="cc-th">Categoria</th>
                        <th className="cc-th text-right">Valor</th>
                        <th className="cc-th"></th>
                      </tr>
                    </thead>
                    <tbody>
                      {store.transactions.map((t) => (
                        <tr key={t.id} className="cc-tr">
                          <td className="cc-td text-zinc-500">{t.date}</td>
                          <td className="cc-td">
                            <Badge label={t.direction === "INCOME" ? "Entrada" : "Saída"} variant={t.direction === "INCOME" ? "green" : "red"} />
                          </td>
                          <td className="cc-td font-medium">{t.description}</td>
                          <td className="cc-td text-zinc-500">{t.category}</td>
                          <td className={`cc-td text-right font-semibold ${t.direction === "INCOME" ? "text-emerald-700" : "text-red-700"}`}>
                            {t.direction === "EXPENSE" ? "-" : ""}{money(t.amount)}
                          </td>
                          <td className="cc-td">
                            <button type="button" onClick={() => void deleteTransaction(t.id)} className="text-xs text-red-600 hover:underline">Excluir</button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </article>
              )}
            </>
          )}
        </>
      )}

      {/* Modal Nova Conta */}
      {showAccModal && (
        <Modal title="Nova Conta" onClose={() => setShowAccModal(false)}>
          <form onSubmit={handleAccount} className="space-y-4">
            {formError && <p className="rounded-lg bg-red-50 px-3 py-2 text-sm text-red-700">{formError}</p>}
            <Field label="Nome da Conta *">
              <input name="name" required placeholder="Ex: Sicoob Pessoal" className="cc-input" />
            </Field>
            <FormRow>
              <Field label="Tipo de Caixa *">
                <select name="type" required className="cc-select">
                  <option value="">-- Selecionar tipo --</option>
                  {(store?.workspaceOptions ?? [])
                    .filter((o) => o.kind === "ACCOUNT_TYPE")
                    .map((o) => (
                      <option key={o.id} value={o.value}>{o.label}</option>
                    ))}
                </select>
              </Field>
              <Field label="Banco / Instituição *">
                <select name="institution" required className="cc-select">
                  <option value="">-- Selecionar banco --</option>
                  {(store?.workspaceOptions ?? [])
                    .filter((o) => o.kind === "INSTITUTION")
                    .map((o) => (
                      <option key={o.id} value={o.value}>{o.label}</option>
                    ))}
                </select>
              </Field>
            </FormRow>
            <Field label="Saldo Inicial (R$)">
              <input name="balance" type="number" step="0.01" defaultValue="0" className="cc-input" />
            </Field>
            <div className="flex gap-3 pt-2">
              <button type="submit" className="cc-btn-primary">Salvar Conta</button>
              <button type="button" onClick={() => setShowAccModal(false)} className="cc-btn-ghost">Cancelar</button>
            </div>
          </form>
        </Modal>
      )}

      {/* Modal Nova Transação */}
      {showTxModal && (
        <Modal title="Nova Transação" onClose={() => setShowTxModal(false)}>
          <form onSubmit={handleTx} className="space-y-4">
            {formError && <p className="rounded-lg bg-red-50 px-3 py-2 text-sm text-red-700">{formError}</p>}
            <FormRow>
              <Field label="Data *">
                <input name="date" type="date" defaultValue={today()} className="cc-input" />
              </Field>
              <Field label="Tipo *">
                <select name="direction" defaultValue="INCOME" className="cc-select">
                  <option value="INCOME">Entrada (Receita)</option>
                  <option value="EXPENSE">Saída (Despesa)</option>
                </select>
              </Field>
            </FormRow>
            <Field label="Descrição *">
              <input name="description" required placeholder="Ex: Recebimento Educaminas" className="cc-input" />
            </Field>
            <FormRow>
              <Field label="Valor (R$) *">
                <input name="amount" type="number" step="0.01" min="0.01" required placeholder="0,00" className="cc-input" />
              </Field>
              <Field label="Conta *">
                <select name="accountId" required className="cc-select">
                  <option value="">-- Selecionar conta --</option>
                  {store?.accounts.map((a) => <option key={a.id} value={a.id}>{a.name}</option>)}
                </select>
              </Field>
            </FormRow>
            <FormRow>
              <Field label="Categoria *">
                {store?.categories.length ? (
                  <select name="category" required className="cc-select">
                    <option value="">-- Selecionar --</option>
                    {store.categories.map((c) => (
                      <option key={c.id} value={c.name}>{c.name}</option>
                    ))}
                  </select>
                ) : (
                  <input name="category" required placeholder="Ex: Receita de cliente (vai criar automaticamente)" className="cc-input" />
                )}
              </Field>
              <Field label="Centro de Custo *">
                {store?.costCenters.length ? (
                  <select name="costCenter" required className="cc-select">
                    <option value="">-- Selecionar --</option>
                    {store.costCenters.map((c) => (
                      <option key={c.id} value={c.name}>{c.name}</option>
                    ))}
                  </select>
                ) : (
                  <input name="costCenter" required placeholder="Ex: Agencia (vai criar automaticamente)" className="cc-input" />
                )}
              </Field>
            </FormRow>
            <Field label="Cliente (opcional)">
              <select name="clientId" className="cc-select">
                <option value="">-- Nenhum --</option>
                {store?.clients.map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}
              </select>
            </Field>
            <div className="flex gap-3 pt-2">
              <button type="submit" className="cc-btn-success">Salvar Transação</button>
              <button type="button" onClick={() => setShowTxModal(false)} className="cc-btn-ghost">Cancelar</button>
            </div>
          </form>
        </Modal>
      )}
    </section>
  );
}

/* ══════════════ CLIENTES + CONTRATOS ══════════════ */
export function ClientsModule() {
  const { store, loading, error: storeErr, createClient, deleteClient, createContract, deleteContract } = useAppStore();
  const [showClientModal, setShowClientModal] = useState(false);
  const [showContractModal, setShowContractModal] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);
  const [tab, setTab] = useState<"clients" | "contracts">("clients");

  const metrics = useMemo(() => {
    if (!store) return { clientRows: [] as Array<ReturnType<typeof Object.assign>>, mrr: 0, arr: 0, ltvAvg: 0 };
    const now = new Date();
    const clientRows = store.clients.map((c) => {
      const months = Math.max(1, (now.getFullYear() - new Date(c.startDate).getFullYear()) * 12 + (now.getMonth() - new Date(c.startDate).getMonth()) + 1);
      const ltv = c.monthlyValue * months;
      const received = store.transactions.filter((t) => t.direction === "INCOME" && t.clientId === c.id).reduce((a, t) => a + t.amount, 0);
      return { ...c, months, ltv, received };
    });
    const mrr = store.contracts.reduce((a, x) => a + x.monthlyValue, 0);
    const arr = mrr * 12;
    const ltvAvg = clientRows.length ? clientRows.reduce((a, c) => a + c.ltv, 0) / clientRows.length : 0;
    return { clientRows, mrr, arr, ltvAvg };
  }, [store]);

  if (!store) return (
    <section className="space-y-5">
      <PageHeader title="Clientes & Contratos" subtitle="Carteira de clientes, LTV e contratos ativos" onAdd={() => { setFormError(null); tab === "clients" ? setShowClientModal(true) : setShowContractModal(true); }} addLabel={tab === "clients" ? "Novo Cliente" : "Novo Contrato"} />
      <div className="flex items-center justify-center rounded-xl border-2 border-dashed border-zinc-200 bg-white py-16">
        <p className="text-sm text-zinc-500">{loading ? "Carregando dados..." : "Erro ao carregar. Verifique a conexão com o banco."}</p>
      </div>
    </section>
  );

  const handleClient = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const f = new FormData(e.currentTarget);
    const parsed = clientSchema.safeParse({ name: f.get("name"), status: f.get("status"), monthlyValue: Number(f.get("monthlyValue")), startDate: f.get("startDate") });
    if (!parsed.success) { setFormError(parsed.error.issues[0]?.message ?? "Erro"); return; }
    await createClient(parsed.data);
    setFormError(null);
    setShowClientModal(false);
  };

  const handleContract = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const f = new FormData(e.currentTarget);
    const parsed = contractSchema.safeParse({ clientId: f.get("clientId"), title: f.get("title"), monthlyValue: Number(f.get("monthlyValue")), startsAt: f.get("startsAt"), dueDay: Number(f.get("dueDay")), services: f.get("services") });
    if (!parsed.success) { setFormError(parsed.error.issues[0]?.message ?? "Erro"); return; }
    await createContract(parsed.data);
    setFormError(null);
    setShowContractModal(false);
  };

  return (
    <section className="space-y-5">
      <PageHeader
        title="Clientes & Contratos"
        subtitle="Carteira de clientes, LTV e contratos ativos"
        onAdd={() => { setFormError(null); tab === "clients" ? setShowClientModal(true) : setShowContractModal(true); }}
        addLabel={tab === "clients" ? "Novo Cliente" : "Novo Contrato"}
      />

      {storeErr && <div className="rounded-lg bg-red-50 px-3 py-2 text-sm text-red-700">{storeErr.message}</div>}

      <div className="grid gap-3 sm:grid-cols-4">
        <article className="cc-card p-5">
          <p className="text-xs font-semibold uppercase tracking-wide text-zinc-500">MRR</p>
          <p className="mt-2 text-2xl font-bold text-blue-700">{money(metrics.mrr)}</p>
        </article>
        <article className="cc-card p-5">
          <p className="text-xs font-semibold uppercase tracking-wide text-zinc-500">ARR</p>
          <p className="mt-2 text-2xl font-bold text-blue-700">{money(metrics.arr)}</p>
        </article>
        <article className="cc-card p-5">
          <p className="text-xs font-semibold uppercase tracking-wide text-zinc-500">LTV Médio</p>
          <p className="mt-2 text-2xl font-bold text-emerald-700">{money(metrics.ltvAvg)}</p>
        </article>
        <article className="cc-card p-5">
          <p className="text-xs font-semibold uppercase tracking-wide text-zinc-500">Clientes Ativos</p>
          <p className="mt-2 text-2xl font-bold text-zinc-900">{store.clients.filter((c) => c.status === "ACTIVE").length}</p>
        </article>
      </div>

      <div className="flex gap-1 border-b border-zinc-200">
        <button type="button" onClick={() => setTab("clients")} className={`px-4 py-2 text-sm font-medium transition ${tab === "clients" ? "border-b-2 border-blue-600 text-blue-600" : "text-zinc-500 hover:text-zinc-900"}`}>
          Clientes ({store.clients.length})
        </button>
        <button type="button" onClick={() => setTab("contracts")} className={`px-4 py-2 text-sm font-medium transition ${tab === "contracts" ? "border-b-2 border-blue-600 text-blue-600" : "text-zinc-500 hover:text-zinc-900"}`}>
          Contratos ({store.contracts.length})
        </button>
      </div>

      {tab === "clients" && (
        <>
          {store.clients.length === 0 ? <EmptyState message="Nenhum cliente cadastrado." /> : (
            <article className="cc-card overflow-hidden">
              <table className="w-full">
                <thead>
                  <tr>
                    <th className="cc-th">Cliente</th>
                    <th className="cc-th">Status</th>
                    <th className="cc-th text-right">Ticket Mensal</th>
                    <th className="cc-th text-right">Meses Ativo</th>
                    <th className="cc-th text-right">LTV</th>
                    <th className="cc-th text-right">Recebido</th>
                    <th className="cc-th"></th>
                  </tr>
                </thead>
                <tbody>
                  {metrics.clientRows.map((c) => (
                    <tr key={c.id} className="cc-tr">
                      <td className="cc-td font-semibold text-zinc-900">{c.name}</td>
                      <td className="cc-td">{clientStatusBadge(c.status)}</td>
                      <td className="cc-td text-right">{money(c.monthlyValue)}</td>
                      <td className="cc-td text-right">{c.months}</td>
                      <td className="cc-td text-right font-semibold text-blue-700">{money(c.ltv)}</td>
                      <td className="cc-td text-right">{money(c.received)}</td>
                      <td className="cc-td">
                        <button type="button" onClick={() => void deleteClient(c.id)} className="text-xs text-red-600 hover:underline">Excluir</button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </article>
          )}
        </>
      )}

      {tab === "contracts" && (
        <>
          {store.contracts.length === 0 ? <EmptyState message="Nenhum contrato cadastrado." /> : (
            <article className="cc-card overflow-hidden">
              <table className="w-full">
                <thead>
                  <tr>
                    <th className="cc-th">Cliente</th>
                    <th className="cc-th">Contrato</th>
                    <th className="cc-th text-right">Valor Mensal</th>
                    <th className="cc-th">Vencimento</th>
                    <th className="cc-th">Serviços</th>
                    <th className="cc-th"></th>
                  </tr>
                </thead>
                <tbody>
                  {store.contracts.map((c) => {
                    const client = store.clients.find((x) => x.id === c.clientId);
                    return (
                      <tr key={c.id} className="cc-tr">
                        <td className="cc-td font-medium">{client?.name ?? c.clientId}</td>
                        <td className="cc-td">{c.title}</td>
                        <td className="cc-td text-right font-semibold text-emerald-700">{money(c.monthlyValue)}</td>
                        <td className="cc-td">Dia {c.dueDay}</td>
                        <td className="cc-td text-zinc-500 text-xs">{c.services}</td>
                        <td className="cc-td">
                          <button type="button" onClick={() => void deleteContract(c.id)} className="text-xs text-red-600 hover:underline">Excluir</button>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </article>
          )}
        </>
      )}

      {showClientModal && (
        <Modal title="Novo Cliente" onClose={() => setShowClientModal(false)}>
          <form onSubmit={handleClient} className="space-y-4">
            {formError && <p className="rounded-lg bg-red-50 px-3 py-2 text-sm text-red-700">{formError}</p>}
            <Field label="Nome do Cliente *">
              <input name="name" required placeholder="Ex: Educaminas" className="cc-input" />
            </Field>
            <FormRow>
              <Field label="Status *">
                <select name="status" defaultValue="ACTIVE" className="cc-select">
                  <option value="ACTIVE">Ativo</option>
                  <option value="STANDBY">Standby</option>
                  <option value="DELINQUENT">Inadimplente</option>
                  <option value="CANCELED">Cancelado</option>
                  <option value="PROSPECT">Prospect</option>
                </select>
              </Field>
              <Field label="Valor Mensal (R$) *">
                <input name="monthlyValue" type="number" step="0.01" min="0" required placeholder="2500,00" className="cc-input" />
              </Field>
            </FormRow>
            <Field label="Data de Início *">
              <input name="startDate" type="date" defaultValue={today()} required className="cc-input" />
            </Field>
            <div className="flex gap-3 pt-2">
              <button type="submit" className="cc-btn-primary">Salvar Cliente</button>
              <button type="button" onClick={() => setShowClientModal(false)} className="cc-btn-ghost">Cancelar</button>
            </div>
          </form>
        </Modal>
      )}

      {showContractModal && (
        <Modal title="Novo Contrato" onClose={() => setShowContractModal(false)}>
          <form onSubmit={handleContract} className="space-y-4">
            {formError && <p className="rounded-lg bg-red-50 px-3 py-2 text-sm text-red-700">{formError}</p>}
            <Field label="Cliente *">
              <select name="clientId" required className="cc-select">
                <option value="">-- Selecionar cliente --</option>
                {store.clients.map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}
              </select>
            </Field>
            <Field label="Título do Contrato *">
              <input name="title" required placeholder="Ex: Gestão de Tráfego" className="cc-input" />
            </Field>
            <FormRow>
              <Field label="Valor Mensal (R$) *">
                <input name="monthlyValue" type="number" step="0.01" min="0.01" required className="cc-input" />
              </Field>
              <Field label="Dia de Vencimento *">
                <input name="dueDay" type="number" min={1} max={31} defaultValue={10} required className="cc-input" />
              </Field>
            </FormRow>
            <FormRow>
              <Field label="Início do Contrato *">
                <input name="startsAt" type="date" defaultValue={today()} required className="cc-input" />
              </Field>
              <Field label="Serviços">
                <input name="services" placeholder="Ex: Gestão de tráfego, Social media" className="cc-input" />
              </Field>
            </FormRow>
            <div className="flex gap-3 pt-2">
              <button type="submit" className="cc-btn-success">Salvar Contrato</button>
              <button type="button" onClick={() => setShowContractModal(false)} className="cc-btn-ghost">Cancelar</button>
            </div>
          </form>
        </Modal>
      )}
    </section>
  );
}

/* ══════════════ A RECEBER ══════════════ */
export function ReceivablesModule() {
  const { store, loading, error: storeErr, createReceivable, markReceivablePaid, deleteReceivable } = useAppStore();
  const [showModal, setShowModal] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);

  const [nowTs] = useState<number>(() => Date.now());
  const [todayStr] = useState<string>(() => new Date().toISOString().slice(0, 10));

  if (!store) return (
    <section className="space-y-5">
      <PageHeader title="Contas a Receber" subtitle="Cobranças, pagamentos recebidos e inadimplência" onAdd={() => { setFormError(null); setShowModal(true); }} addLabel="Novo Recebível" />
      <div className="flex items-center justify-center rounded-xl border-2 border-dashed border-zinc-200 bg-white py-16">
        <p className="text-sm text-zinc-500">{loading ? "Carregando dados..." : "Erro ao carregar. Verifique a conexão com o banco."}</p>
      </div>
    </section>
  );
  const overdue = store.receivables.filter((r) => r.status === "OVERDUE");
  const dueToday = store.receivables.filter((r) => r.expectedDate === todayStr && r.status !== "PAID");
  const over5 = overdue.filter((r) => (nowTs - new Date(r.expectedDate).getTime()) / 86400000 > 5);
  const totalPending = store.receivables.filter((r) => r.status !== "PAID" && r.status !== "CANCELED").reduce((a, r) => a + r.expectedAmount, 0);
  const totalReceived = store.receivables.filter((r) => r.status === "PAID").reduce((a, r) => a + r.receivedAmount, 0);

  const handleAdd = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const f = new FormData(e.currentTarget);
    const parsed = receivableSchema.safeParse({
      clientId: f.get("clientId"),
      competency: f.get("competency"),
      expectedAmount: Number(f.get("expectedAmount")),
      receivedAmount: Number(f.get("receivedAmount") ?? 0),
      expectedDate: f.get("expectedDate"),
      receivedDate: (f.get("receivedDate") as string) || undefined,
      status: f.get("status"),
      accountId: (f.get("accountId") as string) || undefined,
      notes: (f.get("notes") as string) || undefined,
    });
    if (!parsed.success) { setFormError(parsed.error.issues[0]?.message ?? "Erro"); return; }
    await createReceivable(parsed.data);
    setFormError(null);
    setShowModal(false);
  };

  return (
    <section className="space-y-5">
      <PageHeader title="Contas a Receber" subtitle="Cobranças, pagamentos recebidos e inadimplência" onAdd={() => { setFormError(null); setShowModal(true); }} addLabel="Novo Recebível" />

      {storeErr && <div className="rounded-lg bg-red-50 px-3 py-2 text-sm text-red-700">{storeErr.message}</div>}

      <div className="grid gap-3 sm:grid-cols-4">
        <article className="cc-card p-5">
          <p className="text-xs font-semibold uppercase tracking-wide text-zinc-500">Total Pendente</p>
          <p className="mt-2 text-2xl font-bold text-amber-700">{money(totalPending)}</p>
        </article>
        <article className="cc-card p-5">
          <p className="text-xs font-semibold uppercase tracking-wide text-zinc-500">Total Recebido</p>
          <p className="mt-2 text-2xl font-bold text-emerald-700">{money(totalReceived)}</p>
        </article>
        <article className="cc-card p-5">
          <p className="text-xs font-semibold uppercase tracking-wide text-zinc-500">Vencendo Hoje</p>
          <p className="mt-2 text-2xl font-bold text-amber-700">{dueToday.length}</p>
        </article>
        <article className="cc-card p-5">
          <p className="text-xs font-semibold uppercase tracking-wide text-zinc-500">Atraso &gt; 5 dias</p>
          <p className="mt-2 text-2xl font-bold text-red-700">{over5.length}</p>
        </article>
      </div>

      {store.receivables.length === 0 ? <EmptyState message="Nenhum recebível lançado." /> : (
        <article className="cc-card overflow-hidden">
          <table className="w-full">
            <thead>
              <tr>
                <th className="cc-th">Cliente</th>
                <th className="cc-th">Competência</th>
                <th className="cc-th text-right">Previsto</th>
                <th className="cc-th text-right">Recebido</th>
                <th className="cc-th">Vencimento</th>
                <th className="cc-th">Status</th>
                <th className="cc-th">Ações</th>
              </tr>
            </thead>
            <tbody>
              {store.receivables.map((r) => (
                <tr key={r.id} className="cc-tr">
                  <td className="cc-td font-medium">{store.clients.find((c) => c.id === r.clientId)?.name ?? r.clientId}</td>
                  <td className="cc-td text-zinc-500">{r.competency}</td>
                  <td className="cc-td text-right">{money(r.expectedAmount)}</td>
                  <td className="cc-td text-right font-medium text-emerald-700">{money(r.receivedAmount)}</td>
                  <td className="cc-td text-zinc-500">{r.expectedDate}</td>
                  <td className="cc-td">{receivableStatusBadge(r.status)}</td>
                  <td className="cc-td">
                    <div className="flex gap-2">
                      {r.status !== "PAID" && (
                        <button type="button" onClick={() => void markReceivablePaid(r.id)} className="rounded bg-emerald-600 px-2 py-1 text-xs font-semibold text-white hover:bg-emerald-700">
                          Pago
                        </button>
                      )}
                      <button type="button" onClick={() => void deleteReceivable(r.id)} className="text-xs text-red-600 hover:underline">Excluir</button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </article>
      )}

      {showModal && (
        <Modal title="Novo Recebível" onClose={() => setShowModal(false)}>
          <form onSubmit={handleAdd} className="space-y-4">
            {formError && <p className="rounded-lg bg-red-50 px-3 py-2 text-sm text-red-700">{formError}</p>}
            <Field label="Cliente *">
              <select name="clientId" required className="cc-select">
                <option value="">-- Selecionar cliente --</option>
                {store.clients.map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}
              </select>
            </Field>
            <FormRow>
              <Field label="Competência *">
                <input name="competency" type="date" defaultValue={todayStr} required className="cc-input" />
              </Field>
              <Field label="Data de Vencimento *">
                <input name="expectedDate" type="date" defaultValue={todayStr} required className="cc-input" />
              </Field>
            </FormRow>
            <FormRow>
              <Field label="Valor Previsto (R$) *">
                <input name="expectedAmount" type="number" step="0.01" min="0.01" required placeholder="0,00" className="cc-input" />
              </Field>
              <Field label="Valor Recebido (R$)">
                <input name="receivedAmount" type="number" step="0.01" min="0" defaultValue="0" className="cc-input" />
              </Field>
            </FormRow>
            <FormRow>
              <Field label="Data de Recebimento">
                <input name="receivedDate" type="date" className="cc-input" />
              </Field>
              <Field label="Status *">
                <select name="status" defaultValue="PENDING" className="cc-select">
                  <option value="PENDING">Pendente</option>
                  <option value="PAID">Pago</option>
                  <option value="PARTIAL">Pago Parcial</option>
                  <option value="OVERDUE">Atrasado</option>
                  <option value="CANCELED">Cancelado</option>
                  <option value="RENEGOTIATED">Renegociado</option>
                </select>
              </Field>
            </FormRow>
            <Field label="Conta de Recebimento">
              <select name="accountId" className="cc-select">
                <option value="">-- Opcional --</option>
                {store.accounts.map((a) => <option key={a.id} value={a.id}>{a.name}</option>)}
              </select>
            </Field>
            <Field label="Observações">
              <textarea name="notes" rows={2} className="cc-input resize-none" placeholder="Opcional..." />
            </Field>
            <div className="flex gap-3 pt-2">
              <button type="submit" className="cc-btn-success">Salvar Recebível</button>
              <button type="button" onClick={() => setShowModal(false)} className="cc-btn-ghost">Cancelar</button>
            </div>
          </form>
        </Modal>
      )}
    </section>
  );
}

/* ══════════════ A PAGAR ══════════════ */
export function PayablesModule() {
  const { store, loading, error: storeErr, createPayable, markPayablePaid, deletePayable } = useAppStore();
  const [showModal, setShowModal] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);

  if (!store) return (
    <section className="space-y-5">
      <PageHeader title="Contas a Pagar" subtitle="Despesas, compromissos e pagamentos realizados" onAdd={() => { setFormError(null); setShowModal(true); }} addLabel="Novo Pagamento" />
      <div className="flex items-center justify-center rounded-xl border-2 border-dashed border-zinc-200 bg-white py-16">
        <p className="text-sm text-zinc-500">{loading ? "Carregando dados..." : "Erro ao carregar. Verifique a conexão com o banco."}</p>
      </div>
    </section>
  );

  const totalOpen = store.payables.filter((p) => p.status !== "PAID").reduce((a, p) => a + p.amount, 0);
  const totalPaid = store.payables.filter((p) => p.status === "PAID").reduce((a, p) => a + p.amount, 0);
  const overdue = store.payables.filter((p) => p.status === "OVERDUE").length;

  const handleAdd = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const f = new FormData(e.currentTarget);
    const parsed = payableSchema.safeParse({
      description: f.get("description"),
      provider: (f.get("provider") as string) || undefined,
      category: f.get("category"),
      costCenter: f.get("costCenter"),
      amount: Number(f.get("amount")),
      dueDate: f.get("dueDate"),
      status: f.get("status"),
      type: f.get("type"),
      accountId: (f.get("accountId") as string) || undefined,
      notes: (f.get("notes") as string) || undefined,
    });
    if (!parsed.success) { setFormError(parsed.error.issues[0]?.message ?? "Erro"); return; }
    await createPayable(parsed.data);
    setFormError(null);
    setShowModal(false);
  };

  return (
    <section className="space-y-5">
      <PageHeader title="Contas a Pagar" subtitle="Despesas, compromissos e pagamentos realizados" onAdd={() => { setFormError(null); setShowModal(true); }} addLabel="Novo Pagamento" />

      {storeErr && <div className="rounded-lg bg-red-50 px-3 py-2 text-sm text-red-700">{storeErr.message}</div>}

      <div className="grid gap-3 sm:grid-cols-3">
        <article className="cc-card p-5">
          <p className="text-xs font-semibold uppercase tracking-wide text-zinc-500">Em Aberto</p>
          <p className="mt-2 text-2xl font-bold text-red-700">{money(totalOpen)}</p>
        </article>
        <article className="cc-card p-5">
          <p className="text-xs font-semibold uppercase tracking-wide text-zinc-500">Pago</p>
          <p className="mt-2 text-2xl font-bold text-emerald-700">{money(totalPaid)}</p>
        </article>
        <article className="cc-card p-5">
          <p className="text-xs font-semibold uppercase tracking-wide text-zinc-500">Atrasadas</p>
          <p className="mt-2 text-2xl font-bold text-amber-700">{overdue}</p>
        </article>
      </div>

      {store.payables.length === 0 ? <EmptyState message="Nenhuma conta a pagar lançada." /> : (
        <article className="cc-card overflow-hidden">
          <table className="w-full">
            <thead>
              <tr>
                <th className="cc-th">Descrição</th>
                <th className="cc-th">Fornecedor</th>
                <th className="cc-th">Categoria</th>
                <th className="cc-th text-right">Valor</th>
                <th className="cc-th">Vencimento</th>
                <th className="cc-th">Tipo</th>
                <th className="cc-th">Status</th>
                <th className="cc-th">Ações</th>
              </tr>
            </thead>
            <tbody>
              {store.payables.map((p) => (
                <tr key={p.id} className="cc-tr">
                  <td className="cc-td font-medium text-zinc-900">{p.description}</td>
                  <td className="cc-td text-zinc-500">{p.provider ?? "-"}</td>
                  <td className="cc-td text-zinc-500">{p.category}</td>
                  <td className="cc-td text-right font-semibold text-red-700">{money(p.amount)}</td>
                  <td className="cc-td text-zinc-500">{p.dueDate}</td>
                  <td className="cc-td"><Badge label={p.type} variant="gray" /></td>
                  <td className="cc-td">{payableStatusBadge(p.status)}</td>
                  <td className="cc-td">
                    <div className="flex gap-2">
                      {p.status !== "PAID" && (
                        <button type="button" onClick={() => void markPayablePaid(p.id)} className="rounded bg-emerald-600 px-2 py-1 text-xs font-semibold text-white hover:bg-emerald-700">
                          Pago
                        </button>
                      )}
                      <button type="button" onClick={() => void deletePayable(p.id)} className="text-xs text-red-600 hover:underline">Excluir</button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </article>
      )}

      {showModal && (
        <Modal title="Novo Pagamento" onClose={() => setShowModal(false)}>
          <form onSubmit={handleAdd} className="space-y-4">
            {formError && <p className="rounded-lg bg-red-50 px-3 py-2 text-sm text-red-700">{formError}</p>}
            <Field label="Descrição *">
              <input name="description" required placeholder="Ex: Google Workspace" className="cc-input" />
            </Field>
            <FormRow>
              <Field label="Fornecedor">
                <input name="provider" placeholder="Ex: Google" className="cc-input" />
              </Field>
              <Field label="Categoria *">
                {store?.categories.length ? (
                  <select name="category" required className="cc-select">
                    <option value="">-- Selecionar --</option>
                    {store.categories.map((c) => (
                      <option key={c.id} value={c.name}>{c.name}</option>
                    ))}
                  </select>
                ) : (
                  <input name="category" required placeholder="Ex: Ferramentas" className="cc-input" />
                )}
              </Field>
            </FormRow>
            <FormRow>
              <Field label="Centro de Custo *">
                {store?.costCenters.length ? (
                  <select name="costCenter" required className="cc-select">
                    <option value="">-- Selecionar --</option>
                    {store.costCenters.map((c) => (
                      <option key={c.id} value={c.name}>{c.name}</option>
                    ))}
                  </select>
                ) : (
                  <input name="costCenter" required placeholder="Ex: Agencia" className="cc-input" />
                )}
              </Field>
              <Field label="Valor (R$) *">
                <input name="amount" type="number" step="0.01" min="0.01" required placeholder="0,00" className="cc-input" />
              </Field>
            </FormRow>
            <FormRow>
              <Field label="Vencimento *">
                <input name="dueDate" type="date" defaultValue={today()} required className="cc-input" />
              </Field>
              <Field label="Status *">
                <select name="status" defaultValue="OPEN" className="cc-select">
                  <option value="OPEN">Aberto</option>
                  <option value="PAID">Pago</option>
                  <option value="OVERDUE">Atrasado</option>
                  <option value="INSTALMENT">Parcelado</option>
                  <option value="RENEGOTIATED">Renegociado</option>
                  <option value="SUSPENDED">Suspenso</option>
                </select>
              </Field>
            </FormRow>
            <FormRow>
              <Field label="Tipo *">
                <select name="type" defaultValue="VARIABLE" className="cc-select">
                  <option value="FIXED">Fixo</option>
                  <option value="VARIABLE">Variável</option>
                  <option value="RECURRING">Recorrente</option>
                  <option value="EXTRAORDINARY">Extraordinário</option>
                  <option value="DEBT">Dívida</option>
                  <option value="INVESTMENT">Investimento</option>
                </select>
              </Field>
              <Field label="Conta de Pagamento">
                <select name="accountId" className="cc-select">
                  <option value="">-- Opcional --</option>
                  {store.accounts.map((a) => <option key={a.id} value={a.id}>{a.name}</option>)}
                </select>
              </Field>
            </FormRow>
            <Field label="Observações">
              <textarea name="notes" rows={2} className="cc-input resize-none" placeholder="Opcional..." />
            </Field>
            <div className="flex gap-3 pt-2">
              <button type="submit" className="cc-btn-primary">Salvar Pagamento</button>
              <button type="button" onClick={() => setShowModal(false)} className="cc-btn-ghost">Cancelar</button>
            </div>
          </form>
        </Modal>
      )}
    </section>
  );
}
